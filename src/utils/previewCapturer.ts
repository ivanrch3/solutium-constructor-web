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
  const stats: any = { siteId, targetFound: false };
  
  const originalSources = new Map<HTMLImageElement, string>();

  try {
    const element = document.querySelector(selector) as HTMLElement;

    if (!element) {
      if (isDebug) logDebug(`[PREVIEW_CAPTURE_DEBUG] { targetFound: false, selector: "${selector}" }`);
      return null;
    }

    const rect = element.getBoundingClientRect();
    stats.targetFound = true;
    stats.targetClientWidth = element.clientWidth;
    stats.targetClientHeight = element.clientHeight;
    stats.targetScrollWidth = element.scrollWidth;
    stats.targetScrollHeight = element.scrollHeight;
    stats.captureMode = 'thumbnail'; // Default 1440x900 above the fold

    // Helper para esperar a que todas las imágenes del contenedor carguen y manejar CORS
    const waitForImages = async (container: HTMLElement) => {
      const images = Array.from(container.querySelectorAll('img'));
      stats.imageCount = images.length;
      
      const untrustedImages = images.filter(img => !isTrustedDomain(img.src));
      stats.externalImages = untrustedImages.length;
      stats.blockedImageDomains = Array.from(new Set(untrustedImages.map(img => {
        try { return new URL(img.src).hostname; } catch(e) { return 'unknown'; }
      })));

      // Temporalmente reemplazar imágenes no confiables (Pravatar, etc) para evitar errores CORS
      untrustedImages.forEach(img => {
        originalSources.set(img, img.src);
        img.src = PLACEHOLDER_AVATAR;
      });

      const promises = images.map(img => {
        // Intentar habilitar CORS para imágenes de dominios de confianza
        if (img.src.startsWith('http') && !img.src.includes(window.location.hostname) && !img.src.startsWith('data:')) {
          if (!img.crossOrigin) {
            img.crossOrigin = "anonymous";
          }
        }

        if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = () => {
             logDebug(`[PREVIEW_CAPTURE_DEBUG] Failed to load image (CORS or path): ${img.src}`);
             resolve(null);
          };
          setTimeout(resolve, 3000);
        });
      });
      await Promise.all(promises);
    };

    // 1. Preparación
    if (document.fonts) {
      try {
        await Promise.race([
          document.fonts.ready,
          new Promise(resolve => setTimeout(resolve, 1500)) // Max 1.5s wait for fonts
        ]);
        stats.fontsReady = true;
      } catch (e) {
        stats.fontsReady = false;
      }
    }
    
    await waitForImages(element);
    stats.imagesReady = true;

    // Pequeña espera extra para que el layout se asiente después de crossOrigin
    await new Promise(resolve => setTimeout(resolve, 500));

    // 2. Generar Screenshot
    element.classList.add('capturing-preview');
    
    // Guardar estilos originales para restaurar
    const originalStyle = {
      width: element.style.width,
      height: element.style.height,
      minHeight: element.style.minHeight,
      transform: element.style.transform,
      overflow: element.style.overflow,
      maxWidth: element.style.maxWidth,
      border: element.style.border,
      boxShadow: element.style.boxShadow,
      borderRadius: element.style.borderRadius
    };

    let dataUrl = '';
    let captureMethod = 'html-to-image';
    const captureWidth = 1440;
    const captureHeight = 900;
    stats.captureWidth = captureWidth;
    stats.captureHeight = captureHeight;

    try {
      // Intentar primero con html-to-image (evitando cssRules problemáticos y embedding de fuentes)
      dataUrl = await toPng(element, {
        cacheBust: true,
        width: captureWidth,
        height: captureHeight,
        fontEmbedCSS: '', 
        skipFonts: true,
        style: {
          transform: 'scale(1)',
          width: `${captureWidth}px`,
          maxWidth: 'none',
          height: 'auto',
          minHeight: `${captureHeight}px`,
          overflow: 'visible',
          border: 'none',
          boxShadow: 'none',
          borderRadius: '0',
          margin: '0',
          padding: '0'
        },
        filter: (node) => {
          if (node instanceof HTMLElement) {
            // Excluir elementos marcados explícitamente para no aparecer en preview
            const noPreview = node.getAttribute('data-no-preview') === 'true';
            const isEditorUI = node.classList.contains('editor-ui-overlay') || 
                             node.classList.contains('property-panel') ||
                             node.classList.contains('add-module-divider') ||
                             node.classList.contains('selection-indicator');
            return !noPreview && !isEditorUI;
          }
          return true;
        },
        quality: 0.95,
        pixelRatio: 1.0,
        backgroundColor: '#ffffff',
        imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      });
    } catch (err: any) {
      logDebug(`[PREVIEW_CAPTURE_DEBUG] html-to-image falló (${err.message}). Usando fallback html2canvas...`);
      captureMethod = 'html2canvas';
      
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 1,
        width: captureWidth,
        height: captureHeight,
        windowWidth: captureWidth,
        windowHeight: captureHeight,
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector(selector) as HTMLElement;
          if (el) {
            el.classList.add('capturing-preview');
            el.style.width = `${captureWidth}px`;
            el.style.maxWidth = 'none';
            el.style.height = 'auto';
            el.style.minHeight = `${captureHeight}px`;
            el.style.transform = 'scale(1)';
            el.style.overflow = 'visible';
            el.style.border = 'none';
            el.style.boxShadow = 'none';
            el.style.borderRadius = '0';
          }
        },
        ignoreElements: (node) => {
           if (node instanceof HTMLElement) {
             return node.getAttribute('data-no-preview') === 'true' || 
                    node.classList.contains('editor-ui-overlay') || 
                    node.classList.contains('add-module-divider') ||
                    node.classList.contains('selection-indicator');
           }
           return false;
        }
      });
      dataUrl = canvas.toDataURL('image/png');
    } finally {
      element.classList.remove('capturing-preview');
      // Restaurar estilos
      element.style.width = originalStyle.width;
      element.style.height = originalStyle.height;
      element.style.minHeight = originalStyle.minHeight;
      element.style.transform = originalStyle.transform;
      element.style.overflow = originalStyle.overflow;
      element.style.maxWidth = originalStyle.maxWidth;
      element.style.border = originalStyle.border;
      element.style.boxShadow = originalStyle.boxShadow;
      element.style.borderRadius = originalStyle.borderRadius;
      
      // Restaurar imágenes originales
      originalSources.forEach((src, img) => {
        img.src = src;
      });
    }

    stats.captureMethod = captureMethod;

    if (!dataUrl || dataUrl.length < 100) {
       throw new Error("La imagen generada está vacía o es inválida.");
    }

    // 3. Convertir dataUrl a Blob
    const fetchResponse = await fetch(dataUrl);
    const blob = await fetchResponse.blob();
    stats.blobGenerated = true;
    stats.blobSize = `${(blob.size / 1024).toFixed(2)} KB`;

    // 4. Subir vía assetsClient (Upload Centralizado)
    const timestamp = Date.now();
    const hash = `v${timestamp}`;
    const fileName = `preview-${siteId}.png`;
    
    const result = await uploadAsset(blob, {
      projectId,
      siteId,
      webBuilderSiteId,
      assetType: 'preview',
      sourceApp: 'constructor_web',
      fileName,
      contentType: 'image/png'
    });

    const previewUrl = result.public_url || (result as any).url;
    const storagePath = result.storage_path;

    stats.uploadSuccess = !!previewUrl;
    stats.publicUrl = previewUrl;
    stats.storagePath = storagePath;

    if (isDebug) logDebug(`[PREVIEW_CAPTURE_DEBUG]`, stats);

    return {
      url: previewUrl,
      path: storagePath,
      hash: hash,
      updatedAt: new Date().toISOString()
    };
  } catch (error: any) {
    stats.errorName = error.name;
    stats.errorMessage = error.message;
    console.error('[PREVIEW_CAPTURE_DEBUG] Error fatal en captura:', error);
    if (isDebug) logDebug(`[PREVIEW_CAPTURE_DEBUG]`, stats);
    return null;
  }
};
