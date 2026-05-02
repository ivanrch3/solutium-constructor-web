import { toPng } from 'html-to-image';
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
  try {
    const element = document.querySelector(selector) as HTMLElement;
    const isDebug = new URLSearchParams(window.location.search).get('debug_render') === 'true';

    // Helper para esperar a que todas las imágenes del contenedor carguen
    const waitForImages = async (container: HTMLElement) => {
      const images = Array.from(container.querySelectorAll('img'));
      const promises = images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(promises);
    };

    if (!element) {
      if (isDebug) logDebug(`[PREVIEW_CAPTURE_DEBUG] { targetFound: false, selector: "${selector}" }`);
      return null;
    }

    const rect = element.getBoundingClientRect();
    const stats: any = {
      targetFound: true,
      targetSize: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
      siteId
    };

    // 1. Esperar a que carguen las fuentes y un delay de render
    if (document.fonts) {
      await document.fonts.ready;
      stats.fontsReady = true;
    }
    
    // Esperar a que carguen las imágenes
    await waitForImages(element);
    stats.imagesReady = true;

    await new Promise(resolve => setTimeout(resolve, 600));

    // 2. Generar Screenshot usando html-to-image
    element.classList.add('capturing-preview');
    
    const dataUrl = await toPng(element, {
      cacheBust: true,
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
      pixelRatio: 1.0, // Reducimos a 1.0 para evitar archivos pesados en preview
      backgroundColor: '#ffffff'
    });

    element.classList.remove('capturing-preview');

    logDebug(`[PREVIEW_CAPTURE_DEBUG] Screenshot generado (length: ${dataUrl.length}). Convirtiendo a blob...`);

    // 3. Convertir dataUrl a Blob
    const fetchResponse = await fetch(dataUrl);
    const blob = await fetchResponse.blob();
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
  } catch (error) {
    console.error('[PREVIEW_CAPTURE_DEBUG] Error fatal en captura:', error);
    return null;
  }
};
