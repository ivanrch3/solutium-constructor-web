import { getUploadAuthToken } from './authTokenProvider';
import { getAppMadreBaseUrl } from './secureLaunchSession';

export interface PexelsSearchParams {
  projectId?: string | null;
  query: string;
  orientation?: string;
  page?: number;
  per_page?: number;
  moduleType?: string;
  fieldKey?: string;
  industry?: string;
}

export interface PexelsMediaPhoto {
  id: number;
  width?: number;
  height?: number;
  url?: string;
  alt?: string;
  avg_color?: string;
  photographer?: string;
  photographer_url?: string;
  pexels_url?: string;
  src?: {
    original?: string;
    large2x?: string;
    large?: string;
    medium?: string;
    small?: string;
    portrait?: string;
    landscape?: string;
    tiny?: string;
  };
}

export interface PexelsSearchResponse {
  success?: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
  message?: string;
  photos?: PexelsMediaPhoto[];
  page?: number;
  per_page?: number;
  total_results?: number;
  next_page?: string;
  prev_page?: string;
}

export class PexelsMediaClientError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = 'PexelsMediaClientError';
    this.code = code;
    this.status = status;
  }
}

const getMotherApiBaseUrl = () => {
  const apiBaseUrl = import.meta.env.VITE_APP_MADRE_API_URL;
  return typeof apiBaseUrl === 'string' && apiBaseUrl.trim()
    ? apiBaseUrl.replace(/\/$/, '')
    : getAppMadreBaseUrl();
};

export const searchPexelsMedia = async ({
  projectId,
  query,
  orientation,
  page = 1,
  per_page = 5,
  moduleType,
  fieldKey,
  industry
}: PexelsSearchParams): Promise<PexelsSearchResponse> => {
  const apiBaseUrl = getMotherApiBaseUrl();
  if (!apiBaseUrl || !query?.trim()) {
    return { success: true, photos: [] };
  }

  const { token } = await getUploadAuthToken();
  if (!token) {
    throw new PexelsMediaClientError(
      'La sesión segura del Constructor ya no es válida. Por favor vuelve a lanzar el Constructor Web desde Solutium.',
      'missing_auth_token',
      401
    );
  }

  const params = new URLSearchParams();
  params.set('query', query.trim());
  params.set('page', String(page));
  params.set('per_page', String(per_page));

  if (projectId) params.set('projectId', projectId);
  if (orientation) params.set('orientation', orientation);
  if (moduleType) params.set('moduleType', moduleType);
  if (fieldKey) params.set('fieldKey', fieldKey);
  if (industry) params.set('industry', industry);

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/api/media/pexels/search?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch {
    throw new PexelsMediaClientError('No se pudieron cargar imágenes.', 'network_error');
  }

  if (!response.ok) {
    let payload: any = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (response.status === 429) {
      throw new PexelsMediaClientError(
        'Se alcanzó el límite de búsquedas de imágenes. Intenta más tarde.',
        'rate_limited',
        429
      );
    }

    if (response.status === 401) {
      throw new PexelsMediaClientError(
        'La sesión segura del Constructor ya no es válida. Por favor vuelve a lanzar el Constructor Web desde Solutium.',
        'unauthorized',
        401
      );
    }

    if (response.status === 404 && payload?.reason === 'API_ROUTE_NOT_FOUND') {
      throw new PexelsMediaClientError(
        'La App Madre actual no tiene habilitado el endpoint de Pexels todavía.',
        'missing_backend_endpoint',
        404
      );
    }

    throw new PexelsMediaClientError(
      payload?.message || payload?.error || 'No se pudieron cargar imágenes.',
      payload?.reason || `http_${response.status}`,
      response.status
    );
  }

  const data: PexelsSearchResponse = await response.json();

  if (data.skipped && data.reason === 'missing_pexels_api_key') {
    throw new PexelsMediaClientError('Pexels no está configurado todavía.', 'missing_pexels_api_key');
  }

  if (data.success === false && !data.photos) {
    throw new PexelsMediaClientError(
      data.message || data.error || 'No se pudieron cargar imágenes.',
      data.reason || 'search_failed'
    );
  }

  return {
    success: data.success ?? true,
    skipped: data.skipped,
    reason: data.reason,
    photos: data.photos || [],
    page: data.page,
    per_page: data.per_page,
    total_results: data.total_results,
    next_page: data.next_page,
    prev_page: data.prev_page
  };
};
