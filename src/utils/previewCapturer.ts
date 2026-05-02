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

/**
 * Captura una imagen del Canvas y la sube al sistema de activos de la App Madre.
 */
export const captureAndUploadPreview = async (
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
  const originalSources = new Map<HTMLImageElement, string>();

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

    // 1. Crear frame de captura off-screen pero en DOM
    frame = document.createElement('div');
    frame.id = 'preview-capture-frame';
    Object.assign(frame.style, {
      position: 'fixed',
      left: '-99999px',
      top: '0',
      width: '1440px',
      height: '900px',
      backgroundColor: 'white',
      overflow: 'hidden',
      zIndex: '-1000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start'
    });
    document.body.appendChild(frame);

    // 2. Clonar el elemento
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Forzar estilos base en el clon para que ocupe el ancho del frame
    Object.assign(clone.style, {
      width: '1440px',
      maxWidth: 'none',
      height: 'auto',
      minHeight: '900px',
      transform: 'none',
      margin: '0 auto',
      padding: '0',
      overflow: 'visible',
      border: 'none',
      boxShadow: 'none',
      borderRadius: '0',
      position: 'relative',
      opacity: '1',
      display: 'block'
    });

    // Limpiar UI del editor en el clon si se coló algo
    const noise = clone.querySelectorAll('.editor-ui-overlay, .property-panel, .add-module-divider, .selection-indicator, [data-no-preview="true"]');
    noise.forEach(n => n.remove());

    frame.appendChild(clone);

    stats.cloneWidth = clone.offsetWidth;
    stats.cloneHeight = clone.offsetHeight;
    const computed = window.getComputedStyle(clone);
    stats.cloneComputedDisplay = computed.display;
    stats.cloneComputedOverflow = computed.overflow;

    // 3. Preparar imágenes y detectar Hero
    const images = Array.from(clone.querySelectorAll('img'));
    stats.imagesTotal = images.length;
    stats.heroImagesDetected = 0;
    let imagesLoaded = 0;
    let imagesFailed = 0;

    const imagePromises = images.map(img => {
      // Reemplazar Pravatar etc con placeholder
      if (!isTrustedDomain(img.src)) {
        img.src = PLACEHOLDER_AVATAR;
        return Promise.resolve();
      }

      // Habilitar CORS para dominios confiables si no está
      if (img.src.startsWith('http') && !img.src.includes(window.location.hostname)) {
        img.crossOrigin = "anonymous";
      }

      // Forzar carga eager
      img.loading = "eager";

      // Detección de Hero Image (grande y arriba)
      const rect = img.getBoundingClientRect();
      if (rect.width > 200 && rect.top < 600) {
        stats.heroImagesDetected++;
        stats.heroImageSrc = img.src;
        stats.heroImageRect = `${Math.round(rect.width)}x${Math.round(rect.height)} at ${Math.round(rect.left)},${Math.round(rect.top)}`;
      }

      if (img.complete && img.naturalWidth > 0) {
        imagesLoaded++;
        return Promise.resolve();
      }

      return new Promise(resolve => {
        img.onload = () => { imagesLoaded++; resolve(null); };
        img.onerror = () => { imagesFailed++; resolve(null); };
        setTimeout(resolve, 3000);
      });
    });

    // También buscar background-images en el clone
    const bgElements = clone.querySelectorAll('[style*="background-image"]');
    bgElements.forEach(el => {
      const style = (el as HTMLElement).style.backgroundImage;
      if (style && style.includes('url(')) {
        const urlMatch = style.match(/url\(["']?([^"']+)["']?\)/);
        if (urlMatch && urlMatch[1]) {
          const url = urlMatch[1];
          if (!isTrustedDomain(url)) {
             (el as HTMLElement).style.backgroundImage = `url(${PLACEHOLDER_AVATAR})`;
          }
        }
      }
    });

    await Promise.all(imagePromises);
    stats.imagesLoaded = imagesLoaded;
    stats.imagesFailed = imagesFailed;

    // 4. Desactivar animaciones en el clon para el screenshot
    const allElements = clone.querySelectorAll('*');
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.transition = 'none';
      htmlEl.style.animation = 'none';
      htmlEl.style.opacity = '1';
      htmlEl.style.transform = 'none';
    });

    // 5. Esperar asentamiento
    if (document.fonts) await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 800));

    // 6. Captura
    let dataUrl = '';
    let captureMethod = 'html-to-image';

    try {
      dataUrl = await toPng(frame, {
        width: 1440,
        height: 900,
        pixelRatio: 1.0,
        quality: 0.95,
        backgroundColor: '#ffffff',
        fontEmbedCSS: '',
        skipFonts: true,
        imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      });
    } catch (err: any) {
      logDebug(`[PREVIEW_CAPTURE_DEBUG] html-to-image falló. Usando html2canvas...`);
      captureMethod = 'html2canvas';
      const canvas = await html2canvas(frame, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        scale: 1,
        width: 1440,
        height: 900,
        logging: false
      });
      dataUrl = canvas.toDataURL('image/png');
    }

    stats.captureMethod = captureMethod;
    stats.blobGenerated = !!dataUrl;

    if (!dataUrl || dataUrl.length < 500) {
      throw new Error("Screenshot generado vacío o demasiado pequeño");
    }

    // 7. Estimación de espacio vacío a la derecha
    // Si el scrollWidth del clone es mucho menor que 1440 en el frame
    if (clone.scrollWidth < 1200) {
      stats.frameHasEmptyRightSpaceEstimate = true;
    }

    // 8. Convertir y Subir
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    stats.blobSize = `${(blob.size / 1024).toFixed(2)} KB`;

    const timestamp = Date.now();
    const hash = `v${timestamp}`;
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
      hash: hash,
      updatedAt: new Date().toISOString()
    };

  } catch (error: any) {
    stats.errorName = error.name;
    stats.errorMessage = error.message;
    console.error('[PREVIEW_CAPTURE_DEBUG] Error fatal:', error);
    if (isDebug) logDebug(`[PREVIEW_CAPTURE_DEBUG]`, stats);
    return null;
  } finally {
    if (frame && document.body.contains(frame)) {
      document.body.removeChild(frame);
    }
  }
};
