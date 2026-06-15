import { getSupabase } from './supabaseClient';
import { Asset } from '../types/schema';
import { uploadAsset } from './assetsClient';
import { logDebug } from '../utils/debug';

const APP_NAME = 'solutium constructor web';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface SyncAssetResult {
  url: string;
  storagePath: string;
}

const isUuid = (value?: string) => typeof value === 'string' && UUID_REGEX.test(value);

/**
 * Sincroniza un activo con la App Madre y Supabase siguiendo el estándar de Solutium.
 */
export const syncAsset = async (
  entity: { id: string; projectId: string; status?: string; [key: string]: any },
  type: string,
  file: Blob | Uint8Array | string,
  extension: string,
  contentType: string,
  assetDisplayName?: string
): Promise<SyncAssetResult> => {
  // Calcular tamaño en bytes para registro
  let fileSize = 0;
  if (file instanceof Blob) {
    fileSize = file.size;
  } else if (file instanceof Uint8Array) {
    fileSize = file.length;
  } else if (typeof file === 'string') {
    fileSize = new Blob([file]).size;
  }
  
  const fileName = `${entity.id}.${extension}`;
  
  try {
    logDebug(`[AssetService] Sincronizando activo tipo ${type} (${fileSize} bytes)`);
    
    // 1. Subir a través de la App Madre
    let blob: Blob;
    if (file instanceof Blob) {
      blob = file;
    } else {
      blob = new Blob([file], { type: contentType });
    }

    const uploaded = await uploadAsset(blob, {
      projectId: entity.projectId,
      siteId: entity.metadata?.siteId,
      webBuilderSiteId: entity.metadata?.webBuilderSiteId,
      assetType: type as any,
      fileName,
      contentType,
      sourceApp: APP_NAME
    });

    const { public_url, storage_path, asset_id } = uploaded;
    const persistedAssetId = isUuid(asset_id) ? asset_id : undefined;

    logDebug(`[AssetService] Subida a App Madre exitosa: ${public_url}`);

    // 2. Preparar datos para la tabla assets de Supabase.
    // El backend de App Madre ya registra el asset en la tabla `assets` como
    // parte del upload. Este bloque queda como sincronizacion auxiliar para
    // contextos donde el cliente Supabase del Constructor esta disponible.
    const assetName = assetDisplayName 
      ? `${type.charAt(0).toUpperCase() + type.slice(1)}: ${assetDisplayName}` 
      : `${type}: ${entity.id}`;

    const assetData: any = {
      ...(persistedAssetId ? { id: persistedAssetId } : {}),
      project_id: entity.projectId,
      origin_app: APP_NAME,
      name: assetName,
      type: type,
      url: public_url,
      size: fileSize,
      metadata: {
        assetName: assetName,
        path: storage_path,
        external_asset_id: asset_id,
        local_entity_id: entity.id,
        ...entity.metadata
      },
      updated_at: new Date().toISOString()
    };

    // 3. Registrar en Supabase (best-effort).
    const supabase = getSupabase();
    if (!supabase) {
      logDebug('[AssetService] Supabase no inicializado; se conserva el resultado persistido por App Madre.');
      return { url: public_url, storagePath: storage_path };
    }

    try {
      logDebug('[AssetService] Registrando en Supabase:', assetData);
      const { error } = await supabase.from('assets').upsert(assetData);

      if (error) {
        console.warn('[AssetService] Error en upsert auxiliar de Supabase. Se conserva el asset persistido por App Madre.', error);
      } else {
        logDebug('[AssetService] Registro auxiliar en Supabase exitoso');
      }
    } catch (syncError) {
      console.warn('[AssetService] Fallo la sincronizacion auxiliar en Supabase. Se conserva el asset persistido por App Madre.', syncError);
    }

    return { url: public_url, storagePath: storage_path };
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
    try {
      localStorage.setItem('pending_assets', JSON.stringify(pendingAssets));
    } catch (e) {
      console.warn('[AssetService] No se pudo guardar en localStorage (QuotaExceeded). Los datos no se persistirán localmente.');
    }
    
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

  logDebug(`Intentando sincronizar ${pendingAssets.length} activos pendientes...`);
  
  // Nota: Esta es una implementación simplificada. 
  // En una app real, necesitaríamos el contenido del archivo original, 
  // el cual no se puede guardar fácilmente en localStorage si es grande.
  // Por ahora, solo limpiamos si el usuario lo solicita o si implementamos un sistema de blobs.
};
