import { getSupabase } from './supabaseClient';
import { Asset } from '../types/schema';
import { uploadToDO } from './doService';

const APP_NAME = 'Constructor Web';

/**
 * Sincroniza un activo con Digital Ocean y Supabase siguiendo el estándar de Solutium.
 * 
 * @param entity El objeto de la entidad (ej: oferta, factura)
 * @param type El tipo de activo (ej: 'offer', 'invoice')
 * @param file El contenido del archivo
 * @param extension La extensión del archivo (sin punto, ej: 'pdf')
 * @param contentType El tipo MIME del archivo
 * @param assetDisplayName Nombre legible para el activo (ej: "Juan Pérez")
 */
export const syncAsset = async (
  entity: { id: string; projectId: string; status?: string; [key: string]: any },
  type: string,
  file: Blob | Uint8Array | string,
  extension: string,
  contentType: string,
  assetDisplayName?: string
): Promise<string> => {
  // Convención de rutas en Digital Ocean: [tipo_de_activo]s/[project_id]/[id_del_activo].[extensión]
  const fileName = `${type}s/${entity.projectId}/${entity.id}.${extension}`;
  
  // Calcular tamaño en bytes
  let fileSize = 0;
  if (file instanceof Blob) {
    fileSize = file.size;
  } else if (file instanceof Uint8Array) {
    fileSize = file.length;
  } else if (typeof file === 'string') {
    fileSize = new Blob([file]).size;
  }
  
  try {
    console.log(`[AssetService] Sincronizando activo: ${fileName} (${fileSize} bytes)`);
    
    // 1. Subir a Digital Ocean Spaces
    const url = await uploadToDO(fileName, file, contentType);
    console.log(`[AssetService] Subida a DO exitosa: ${url}`);

    // 2. Preparar datos para la tabla assets de Supabase
    const assetName = assetDisplayName 
      ? `${type.charAt(0).toUpperCase() + type.slice(1)}: ${assetDisplayName}` 
      : `${type}: ${entity.id}`;

    const assetData: any = {
      id: entity.id,
      project_id: entity.projectId,
      origin_app: APP_NAME,
      name: assetName,
      type: type,
      url: url,
      size: fileSize,
      metadata: {
        assetName: assetName,
        ...entity.metadata
      },
      updated_at: new Date().toISOString()
    };

    // 3. Registrar en Supabase
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase no inicializado');

    console.log('[AssetService] Registrando en Supabase:', assetData);
    const { error } = await supabase.from('assets').upsert(assetData);

    if (error) {
      console.error('[AssetService] Error en upsert de Supabase:', error);
      throw error;
    }

    console.log('[AssetService] Registro en Supabase exitoso');
    return url;
  } catch (error: any) {
    console.error('Error detallado en syncAsset:', error);
    
    // 4. Resiliencia y Fallback: Guardar en localStorage con el contenido si es posible
    const pendingAssets = JSON.parse(localStorage.getItem('pending_assets') || '[]');
    
    let fileBase64 = null;
    try {
      // Intentar convertir a base64 para persistencia real (solo si no es excesivo)
      if (fileSize < 2 * 1024 * 1024) { // Límite de 2MB para localStorage
        if (file instanceof Blob) {
          fileBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        }
      }
    } catch (e) {
      console.warn('[AssetService] No se pudo serializar el archivo para el fallback:', e);
    }

    pendingAssets.push({
      entity,
      type,
      extension,
      contentType,
      fileName,
      fileData: fileBase64,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error)
    });
    localStorage.setItem('pending_assets', JSON.stringify(pendingAssets));
    
    // Informar al usuario (el componente que llama debe manejar este error)
    const displayError = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al sincronizar el activo: ${displayError}. Los datos se han guardado localmente como respaldo.`);
  }
};

/**
 * Intenta sincronizar activos pendientes guardados en localStorage.
 */
export const syncPendingAssets = async () => {
  const pendingAssets = JSON.parse(localStorage.getItem('pending_assets') || '[]');
  if (pendingAssets.length === 0) return;

  console.log(`Intentando sincronizar ${pendingAssets.length} activos pendientes...`);
  
  // Nota: Esta es una implementación simplificada. 
  // En una app real, necesitaríamos el contenido del archivo original, 
  // el cual no se puede guardar fácilmente en localStorage si es grande.
  // Por ahora, solo limpiamos si el usuario lo solicita o si implementamos un sistema de blobs.
};
