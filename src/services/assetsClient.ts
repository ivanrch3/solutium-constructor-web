import { logDebug } from '../utils/debug';
import { getSupabase } from './supabaseClient';

export interface AssetUploadResponse {
  asset_id?: string;
  public_url: string;
  url?: string;
  storage_path: string;
  mime_type?: string;
  size_bytes?: number;
}

export interface AssetUploadOptions {
  projectId: string;
  siteId?: string;
  webBuilderSiteId?: string;
  moduleId?: string;
  assetType: 'preview' | 'image' | 'logo' | 'icon' | 'module_asset' | 'other';
  fileName?: string;
  contentType?: string;
  sourceApp?: string;
}

/**
 * Cliente de activos para subir archivos a través de la App Madre.
 * Esto evita exponer credenciales de DigitalOcean Spaces en el frontend.
 */
export const uploadAsset = async (
  fileOrBlob: File | Blob,
  options: AssetUploadOptions
): Promise<AssetUploadResponse> => {
  const apiBaseUrl = import.meta.env.VITE_APP_MADRE_API_URL;
  
  if (!apiBaseUrl) {
    console.error("[AssetsClient] No está configurada la URL de la App Madre para subir archivos (VITE_APP_MADRE_API_URL).");
    throw new Error("No está configurada la URL de la App Madre para subir archivos.");
  }

  const baseUrl = apiBaseUrl.replace(/\/$/, "");
  const uploadUrl = `${baseUrl}/api/assets/upload`;

  logDebug(`[AssetsClient] Iniciando subida de activo a ${uploadUrl}...`, options);

  try {
    const formData = new FormData();
    formData.append('file', fileOrBlob);
    formData.append('project_id', options.projectId);
    
    if (options.siteId) formData.append('site_id', options.siteId);
    if (options.webBuilderSiteId) formData.append('web_builder_site_id', options.webBuilderSiteId);
    if (options.moduleId) formData.append('module_id', options.moduleId);
    
    formData.append('asset_type', options.assetType);
    formData.append('source_app', options.sourceApp || 'constructor_web');
    
    if (options.fileName) formData.append('file_name', options.fileName);
    if (options.contentType) formData.append('content_type', options.contentType || (fileOrBlob as any).type);

    // Obtener el token de Supabase para la autenticación
    const supabase = getSupabase();
    const { data: { session } } = await supabase?.auth.getSession() || { data: { session: null } };
    const token = session?.access_token;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Error de subida (${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.error || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const data: AssetUploadResponse = await response.json();
    logDebug(`[AssetsClient] Subida exitosa:`, data);
    
    return data;
  } catch (error) {
    console.error(`[AssetsClient] Error fatal subiendo activo:`, error);
    throw error;
  }
};
