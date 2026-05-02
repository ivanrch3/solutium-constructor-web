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

    // 4. Subir vía assetsClient (Upload Centralizado)
    const timestamp = Date.now();
    const hash = `v${timestamp}`;
    const fileName = `preview-${siteId}.png`;
    
    logDebug(`[PREVIEW_CAPTURE_DEBUG] Subiendo asset centralizado...`);
    
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
