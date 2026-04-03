import { getSupabase } from './supabaseClient';
import { Asset } from '../types/schema';
import { uploadToDO } from './doService';

const APP_NAME = 'Solutium Satellite Base';

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
  
  try {
    // 1. Subir a Digital Ocean Spaces
    const url = await uploadToDO(fileName, file, contentType);

    // 2. Preparar datos para la tabla assets de Supabase
    const assetName = assetDisplayName 
      ? `${type.charAt(0).toUpperCase() + type.slice(1)}: ${assetDisplayName}` 
      : `${type}: ${entity.id}`;

    const assetData: Asset = {
      id: entity.id,
      project_id: entity.projectId,
      origin_app: APP_NAME,
      name: assetName,
      type: type,
      url: url,
      status: entity.status,
      metadata: {
        assetName: assetName,
      },
      data: { ...entity },
      updated_at: new Date().toISOString()
    };

    // 3. Registrar en Supabase
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase no inicializado');

    const { error } = await supabase.from('assets').upsert(assetData);

    if (error) throw error;

    return url;
  } catch (error) {
    console.error('Error sincronizando activo:', error);
    
    // 4. Resiliencia y Fallback: Guardar en localStorage
    const pendingAssets = JSON.parse(localStorage.getItem('pending_assets') || '[]');
    pendingAssets.push({
      entity,
      type,
      extension,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error)
    });
    localStorage.setItem('pending_assets', JSON.stringify(pendingAssets));
    
    // Informar al usuario (el componente que llama debe manejar este error)
    throw new Error('Error al sincronizar el activo. Los datos se han guardado localmente como respaldo.');
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
