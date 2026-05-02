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
  elementId: string = 'constructor-canvas-render'
): Promise<PreviewResult | null> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`[PreviewCapturer] Elemento ${elementId} no encontrado.`);
      return null;
    }

    logDebug(`[PreviewCapturer] Iniciando captura de preview para sitio ${siteId}...`);

    // 1. Esperar un momento para que el renderizado se asiente (fuentes, imágenes, etc.)
    await new Promise(resolve => setTimeout(resolve, 500));

    // 2. Generar Screenshot usando html-to-image
    // Configuramos para evitar que se capturen elementos con data-no-preview
    const dataUrl = await toPng(element, {
      cacheBust: true,
      filter: (node) => {
        if (node instanceof HTMLElement) {
          return node.getAttribute('data-no-preview') !== 'true';
        }
        return true;
      },
      quality: 0.8,
      pixelRatio: 1, // 1:1 para evitar imágenes demasiado pesadas
    });

    // 3. Convertir dataUrl a Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // 4. Subir a DigitalOcean Spaces vía assetService
    const timestamp = Date.now();
    const hash = `preview-${siteId}-${timestamp}`;
    const extension = 'png';
    const contentType = 'image/png';
    
    // Usamos el ID del sitio como ID del activo para que se sobrescriba o mantenga referencia
    // Pero el requerimiento pide: previews/{project_id}/{site_id}/preview-{timestamp}.png
    // SincAsset usa internamente: [type]s/[project_id]/[id_del_activo].[extension]
    // Así que pasaremos siteId como parte del ID o personalizaremos el path si es necesario.
    
    const previewUrl = await syncAsset(
      { 
        id: `${siteId}-preview`, 
        projectId,
        metadata: { siteId, type: 'preview' } 
      },
      'preview', // Se guardará en previews/[projectId]/[siteId]-preview.png
      blob,
      extension,
      contentType,
      `Preview: ${siteId}`
    );

    logDebug(`[PreviewCapturer] Preview subido exitosamente: ${previewUrl}`);

    return {
      url: previewUrl,
      path: `previews/${projectId}/${siteId}-preview.${extension}`,
      hash: hash,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('[PreviewCapturer] Error capturando preview:', error);
    return null;
  }
};
