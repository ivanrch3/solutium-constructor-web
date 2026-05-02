import { toPng } from 'html-to-image';
import { logDebug } from './debug';
import { syncAsset } from '../services/assetService';

export interface PreviewResult {
  url: string;
  path: string;
  hash: string;
  updatedAt: string;
}

/**
 * Captura una imagen del Canvas y la sube al sistema de activos.
 */
export const captureAndUploadPreview = async (
  projectId: string,
  siteId: string,
  webBuilderSiteId?: string,
  selector: string = '[data-preview-root="true"]'
): Promise<PreviewResult | null> => {
  try {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) {
      logDebug(`[PREVIEW_CAPTURE_DEBUG] Error: Elemento con selector ${selector} no encontrado.`);
      return null;
    }

    logDebug(`[PREVIEW_CAPTURE_DEBUG] Iniciando captura para sitio ${siteId}...`);

    // 1. Esperar a que carguen las fuentes y un delay de render
    if (document.fonts) {
      await document.fonts.ready;
    }
    await new Promise(resolve => setTimeout(resolve, 600));

    // 2. Generar Screenshot usando html-to-image
    const dataUrl = await toPng(element, {
      cacheBust: true,
      filter: (node) => {
        if (node instanceof HTMLElement) {
          // Excluir elementos marcados explícitamente para no aparecer en preview
          const noPreview = node.getAttribute('data-no-preview') === 'true';
          const isEditorUI = node.classList.contains('editor-ui-overlay') || 
                           node.classList.contains('property-panel');
          return !noPreview && !isEditorUI;
        }
        return true;
      },
      quality: 0.85,
      pixelRatio: 1.2, // Balance entre calidad y peso
      backgroundColor: '#ffffff'
    });

    logDebug(`[PREVIEW_CAPTURE_DEBUG] Screenshot generado (length: ${dataUrl.length}). Convirtiendo a blob...`);

    // 3. Convertir dataUrl a Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // 4. Subir vía assetService
    const timestamp = Date.now();
    const hash = `v${timestamp}`;
    const extension = 'png';
    const contentType = 'image/png';
    
    logDebug(`[PREVIEW_CAPTURE_DEBUG] Subiendo asset...`);
    
    // El assetService.syncAsset sube el archivo y devuelve la URL pública y el path
    const { url: previewUrl, storagePath } = await syncAsset(
      { 
        id: `${siteId}-preview-v${timestamp}`, 
        projectId,
        metadata: { siteId, webBuilderSiteId, type: 'preview', timestamp } 
      },
      'preview', 
      blob,
      extension,
      contentType,
      `Preview for Site: ${siteId}`
    );

    logDebug(`[PREVIEW_CAPTURE_DEBUG] Captura exitosa. URL: ${previewUrl}`);

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
