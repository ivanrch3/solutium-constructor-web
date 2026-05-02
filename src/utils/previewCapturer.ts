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
  
  try {
    const element = document.querySelector(selector) as HTMLElement;

    if (!element) {
      if (isDebug) logDebug(`[PREVIEW_CAPTURE_DEBUG] { targetFound: false, selector: "${selector}" }`);
      return null;
    }

    const rect = element.getBoundingClientRect();
    stats.targetFound = true;
    stats.targetSize = `${Math.round(rect.width)}x${Math.round(rect.height)}`;

    // Helper para esperar a que todas las imágenes del contenedor carguen y manejar CORS
    const waitForImages = async (container: HTMLElement) => {
      const images = Array.from(container.querySelectorAll('img'));
      stats.imageCount = images.length;
      stats.externalImages = images.filter(img => img.src.startsWith('http') && !img.src.includes(window.location.hostname)).length;
      
      const promises = images.map(img => {
        // Intentar habilitar CORS para imágenes externas si son de dominios conocidos o si no tienen crossOrigin
        if (img.src.startsWith('http') && !img.src.includes(window.location.hostname)) {
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
          // Timeout de seguridad por imagen: 3 segundos
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
    let dataUrl = '';
    let captureMethod = 'html-to-image';

    try {
      // Intentar primero con html-to-image (evitando cssRules problemáticos y embedding de fuentes)
      dataUrl = await toPng(element, {
        cacheBust: true,
        fontEmbedCSS: '', // CRITICAL: EVITA EL ERROR DE CSSRULES CON GOOGLE FONTS EXTERNOS
        skipFonts: true,  // No intentar embeber fuentes externas que causan errores de seguridad
        filter: (node) => {
          if (node instanceof HTMLElement) {
            // Excluir elementos marcados explícitamente para no aparecer en preview
            const noPreview = node.getAttribute('data-no-preview') === 'true';
            const isEditorUI = node.classList.contains('editor-ui-overlay') || 
                             node.classList.contains('property-panel') ||
                             node.classList.contains('add-module-divider');
            return !noPreview && !isEditorUI;
          }
          return true;
        },
        quality: 0.85,
        pixelRatio: 1.0,
        backgroundColor: '#ffffff',
        // Placeholder en caso de que alguna imagen falle por CORS
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
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector(selector) as HTMLElement;
          if (el) el.classList.add('capturing-preview');
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
