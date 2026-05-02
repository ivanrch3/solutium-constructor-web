import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';
import { logDebug } from './debug';
import { uploadAsset } from '../services/assetsClient';

export interface PreviewResult {
  url: string;
  path: string;
  hash: string;
  updatedAt: string;
}

const TRUSTED_DOMAINS = [
  'solutium-space.nyc3.digitaloceanspaces.com',
  'nyc3.digitaloceanspaces.com',
  'solutium.app',
  'solutium-constructor-web-g9777.ondigitalocean.app',
  'solutium-app-maestra-ld25z.ondigitalocean.app',
  'ondigitalocean.app',
  'digitaloceanspaces.com'
];

const PLACEHOLDER_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFMkU4RjAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIyMCIgZmlsbD0iIzk0QTNDQiIvPjxwYXRoIGQ9Ik0yMCA4MEMyMCA2OC45NTQzIDI4Ljk1NDMgNjAgNDAgNjBINTBDNjEuMDQ1NyA2MCA3MCA2OC45NTQzIDcwIDgwVjg1SDIwVjgwWiIgZmlsbD0iIzk0QTNDQiIvPjwvc3ZnPg==';

const isTrustedDomain = (src: string) => {
  if (!src || src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('/') || !src.startsWith('http')) return true;
  try {
    const url = new URL(src);
    if (url.hostname === window.location.hostname) return true;
    return TRUSTED_DOMAINS.some(domain => url.hostname.endsWith(domain));
  } catch (e) {
    return false;
  }
};

const isCanvasBlank = (canvas: HTMLCanvasElement): { isBlank: boolean, whiteRatio: number } => {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return { isBlank: true, whiteRatio: 1 };
  
  const width = canvas.width;
  const height = canvas.height;
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  let nonWhitePixels = 0;
  const totalPixels = width * height;
  
  // Muestreo rápido para performance (cada 20 píxeles aproximadamente)
  const step = 4 * Math.max(1, Math.floor(totalPixels / 5000)); 
  let sampledPixels = 0;

  for (let i = 0; i < data.length; i += step) {
    sampledPixels++;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    // Si no es blanco puro (o casi) y no es transparente
    if (a > 50 && (r < 250 || g < 250 || b < 250)) {
      nonWhitePixels++;
    }
  }
  
  const nonWhiteRatio = nonWhitePixels / sampledPixels;
  return {
    isBlank: nonWhiteRatio < 0.02, // Si menos del 2% tiene color, se considera blanca
    whiteRatio: 1 - nonWhiteRatio
  };
};

/**
 * Revierte colores oklch() a rgb() para compatibilidad con html2canvas
 */
const sanitizeOklchColors = (root: HTMLElement) => {
  const elements = Array.from(root.querySelectorAll('*'));
  elements.push(root); // Incluir el root mismo
  
  let sanitizedCount = 0;
  const oklchProperties = [
    'color', 'background-color', 'border-top-color', 'border-right-color', 
    'border-bottom-color', 'border-left-color', 'outline-color', 
    'text-decoration-color', 'fill', 'stroke'
  ];

  // Helper para convertir oklch a rgb usando el motor del navegador
  const convertColor = (val: string): string | null => {
    if (!val || !val.includes('oklch')) return null;
    const temp = document.createElement('div');
    temp.style.color = val;
    document.body.appendChild(temp);
    const rgb = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    // Si sigue siendo oklch, el navegador no hizo la conversión automática en computed style (raro en navegadores modernos)
    return (rgb && !rgb.includes('oklch')) ? rgb : null;
  };

  elements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computed = window.getComputedStyle(htmlEl);
    
    oklchProperties.forEach(prop => {
      const val = computed.getPropertyValue(prop);
      if (val && val.includes('oklch')) {
        const rgb = convertColor(val);
        if (rgb) {
          htmlEl.style.setProperty(prop, rgb, 'important');
          sanitizedCount++;
        } else {
          // Fallback manual si falla la conversión del navegador
          if (prop === 'color' || prop === 'fill' || prop === 'stroke') {
            htmlEl.style.setProperty(prop, '#0f172a', 'important');
          } else {
            htmlEl.style.setProperty(prop, 'rgba(0,0,0,0)', 'important');
          }
        }
      }
    });

    // También sanear variables CSS comunes que podrían tener oklch
    const commonVars = ['--background', '--foreground', '--primary', '--primary-foreground', '--border', '--ring', '--muted', '--muted-foreground', '--accent', '--accent-foreground'];
    commonVars.forEach(v => {
      const val = computed.getPropertyValue(v);
      if (val && val.includes('oklch')) {
        const rgb = convertColor(val);
        if (rgb) {
          htmlEl.style.setProperty(v, rgb, 'important');
          sanitizedCount++;
        }
      }
    });
  });

  return sanitizedCount;
};

/**
 * Captura una imagen del Canvas y la sube al sistema de activos de la App Madre.
 */
export const capturePreview = async (
  projectId: string,
  siteId: string,
  webBuilderSiteId?: string,
  selector: string = '[data-preview-root="true"]'
): Promise<PreviewResult | null> => {
  const isDebug = new URLSearchParams(window.location.search).get('debug_render') === 'true';
  const stats: any = { 
    siteId, 
    targetFound: false,
    captureMode: 'thumbnail',
    usedClone: true,
    captureWidth: 1440,
    captureHeight: 900
  };
  
  let frame: HTMLDivElement | null = null;

  try {
    const element = document.querySelector(selector) as HTMLElement;

    if (!element) {
      if (isDebug) logDebug(`[PREVIEW_CAPTURE_DEBUG] { targetFound: false, selector: "${selector}" }`);
      return null;
    }

    stats.targetFound = true;
    stats.originalTargetWidth = element.offsetWidth;
    stats.originalTargetHeight = element.offsetHeight;
    stats.originalTargetScrollWidth = element.scrollWidth;
    stats.originalTargetScrollHeight = element.scrollHeight;

    // 1. Crear frame de captura "Safe" (Visible pero detrás de la UI principal)
    frame = document.createElement('div');
    frame.id = 'preview-capture-frame';
    Object.assign(frame.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: '1440px',
      height: '900px',
      backgroundColor: 'white',
      overflow: 'hidden',
      zIndex: '-2000', // Detrás de todo el bloque de edición
      visibility: 'visible',
      pointerEvents: 'none',
      opacity: '1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start'
    });
    document.body.appendChild(frame);

    // 2. Clonar el elemento
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Forzar estilos base en el clon para composición perfecta 16:9
    Object.assign(clone.style, {
      width: '1440px',
      maxWidth: 'none',
      height: 'auto',
      minHeight: '900px',
      transform: 'none',
      margin: '0 auto',
      padding: '0',
      display: 'block',
      position: 'relative',
      opacity: '1',
      visibility: 'visible',
      boxShadow: 'none',
      border: 'none',
      borderRadius: '0'
    });

    // Limpiar UI del editor en el clon
    const noise = clone.querySelectorAll('.editor-ui-overlay, .property-panel, .add-module-divider, .selection-indicator, [data-no-preview="true"]');
    noise.forEach(n => n.remove());

    frame.appendChild(clone);

    // 3. Preparar imágenes y detectar contenido
    const images = Array.from(clone.querySelectorAll('img'));
    stats.imagesTotal = images.length;
    let imagesLoaded = 0;

    const imagePromises = images.map(img => {
      // Reemplazar imágenes no confiables
      if (!isTrustedDomain(img.src)) {
        img.src = PLACEHOLDER_AVATAR;
        return Promise.resolve();
      }

      if (img.src.startsWith('http') && !img.src.includes(window.location.hostname)) {
        img.crossOrigin = "anonymous";
      }

      img.loading = "eager";

      if (img.complete && img.naturalWidth > 0) {
        imagesLoaded++;
        return Promise.resolve();
      }

      return new Promise(resolve => {
        img.onload = () => { imagesLoaded++; resolve(null); };
        img.onerror = () => resolve(null);
        setTimeout(resolve, 3000);
      });
    });

    await Promise.all(imagePromises);
    stats.imagesLoaded = imagesLoaded;

    // También limpiar background-images en el clone
    const bgElements = clone.querySelectorAll('[style*="background-image"]');
    bgElements.forEach(el => {
      const style = (el as HTMLElement).style.backgroundImage;
      if (style && style.includes('url(')) {
        const urlMatch = style.match(/url\(["']?([^"']+)["']?\)/);
        if (urlMatch && urlMatch[1] && !isTrustedDomain(urlMatch[1])) {
          (el as HTMLElement).style.backgroundImage = `url(${PLACEHOLDER_AVATAR})`;
        }
      }
    });

    // 4. Desactivar animaciones y saneamiento de estilos
    const oklchSanitized = sanitizeOklchColors(clone);
    stats.oklchSanitizedCount = oklchSanitized;

    const allElements = clone.querySelectorAll('*');
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.transition = 'none';
      htmlEl.style.animation = 'none';
      htmlEl.style.opacity = '1';
      htmlEl.style.transform = 'none';
    });

    if (document.fonts) await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 1200)); // Un poco más de tiempo para que se aplique el style inline secundario

    // 5. Captura Real con html2canvas
    const canvas = await html2canvas(frame, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      scale: 1,
      width: 1440,
      height: 900,
      logging: false,
      imageTimeout: 5000,
      onclone: (clonedDoc) => {
        // Asegurar que el fondo del frame esté correcto en el clon interno de html2canvas
        const f = clonedDoc.getElementById('preview-capture-frame');
        if (f) (f as HTMLElement).style.backgroundColor = '#ffffff';
      }
    });

    // 6. VALIDACIÓN ANTI-BLANCO
    const blankCheck = isCanvasBlank(canvas);
    stats.captureBlank = blankCheck.isBlank;
    stats.whiteRatio = blankCheck.whiteRatio;

    if (blankCheck.isBlank) {
       throw new Error(`La captura resultó en una imagen mayormente vacía (${(blankCheck.whiteRatio * 100).toFixed(1)}% blanco). Se conserva preview anterior.`);
    }

    const dataUrl = canvas.toDataURL('image/png', 0.9);
    stats.blobGenerated = !!dataUrl;

    // 7. Subida vía assetsClient
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    stats.blobSize = `${(blob.size / 1024).toFixed(2)} KB`;

    const result = await uploadAsset(blob, {
      projectId,
      siteId,
      webBuilderSiteId,
      assetType: 'preview',
      sourceApp: 'constructor_web',
      fileName: `preview-${siteId}.png`,
      contentType: 'image/png'
    });

    const previewUrl = result.public_url || (result as any).url;
    stats.uploadSuccess = !!previewUrl;
    stats.publicUrl = previewUrl;

    if (isDebug) logDebug(`[PREVIEW_CAPTURE_DEBUG]`, stats);

    return {
      url: previewUrl,
      path: result.storage_path,
      hash: `v${Date.now()}`,
      updatedAt: new Date().toISOString()
    };

  } catch (error: any) {
    stats.errorName = error.name;
    stats.errorMessage = error.message;
    console.error('[PREVIEW_CAPTURE_DEBUG] Error en captura:', error.message);
    if (isDebug) logDebug(`[PREVIEW_CAPTURE_DEBUG]`, stats);
    return null;
  } finally {
    if (frame && document.body.contains(frame)) {
      document.body.removeChild(frame);
    }
  }
};
