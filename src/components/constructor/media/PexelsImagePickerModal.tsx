import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ExternalLink, Image as ImageIcon, Loader2, Search, X } from 'lucide-react';
import { PexelsMediaClientError, PexelsMediaPhoto, searchPexelsMedia } from '../../../services/pexelsMediaClient';

type OrientationOption = 'landscape' | 'portrait' | 'square';

export interface SelectedPexelsImageMetadata {
  provider: 'pexels';
  pexels_id: number;
  photographer?: string;
  photographer_url?: string;
  pexels_url?: string;
  query: string;
  selected_url: string;
  orientation?: string;
}

interface PexelsImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string, metadata: SelectedPexelsImageMetadata) => void;
  projectId?: string | null;
  industry?: string;
  moduleType?: string;
  fieldKey?: string;
  fieldLabel?: string;
  initialOrientation?: OrientationOption;
}

const buildInitialQuery = ({
  industry,
  moduleType,
  fieldLabel,
  fieldKey
}: {
  industry?: string;
  moduleType?: string;
  fieldLabel?: string;
  fieldKey?: string;
}) => {
  const parts = [
    industry?.trim(),
    moduleType?.trim(),
    fieldLabel?.trim(),
    fieldKey?.trim()
  ].filter(Boolean) as string[];

  const raw = parts.join(' ').toLowerCase();
  if (!raw) return 'business';

  const sanitized = raw
    .replace(/[_-]/g, ' ')
    .replace(/\b(image|imagen|principal|background|bg|url|field|media)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return sanitized || 'business';
};

const getPreferredImageUrl = (photo: PexelsMediaPhoto, orientation: OrientationOption) => {
  if (orientation === 'portrait') return photo.src?.portrait || photo.src?.large || photo.src?.medium || '';
  if (orientation === 'square') return photo.src?.large || photo.src?.medium || photo.src?.portrait || '';
  return photo.src?.landscape || photo.src?.large || photo.src?.medium || '';
};

export const PexelsImagePickerModal: React.FC<PexelsImagePickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  projectId,
  industry,
  moduleType,
  fieldKey,
  fieldLabel,
  initialOrientation = 'landscape'
}) => {
  const initialQuery = useMemo(
    () => buildInitialQuery({ industry, moduleType, fieldLabel, fieldKey }),
    [industry, moduleType, fieldLabel, fieldKey]
  );

  const [query, setQuery] = useState(initialQuery);
  const [orientation, setOrientation] = useState<OrientationOption>(initialOrientation);
  const [results, setResults] = useState<PexelsMediaPhoto[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setOrientation(initialOrientation);
      setResults([]);
      setPage(1);
      setError(null);
    }
  }, [isOpen, initialQuery, initialOrientation]);

  useEffect(() => {
    if (!isOpen) return;

    const runInitialSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await searchPexelsMedia({
          projectId,
          query: initialQuery || 'business',
          orientation,
          page: 1,
          per_page: 12,
          moduleType,
          fieldKey,
          industry
        });
        setResults(response.photos || []);
        setHasMore(Boolean(response.next_page) || (response.photos || []).length >= 12);
        setPage(1);
      } catch (err) {
        setResults([]);
        setHasMore(false);
        setError(err instanceof PexelsMediaClientError ? err.message : 'No se pudieron cargar imágenes.');
      } finally {
        setLoading(false);
      }
    };

    runInitialSearch();
  }, [isOpen, initialQuery, orientation, projectId, moduleType, fieldKey, industry]);

  const executeSearch = async (nextPage = 1, append = false) => {
    if (!query.trim()) return;

    if (append) setLoadingMore(true);
    else setLoading(true);

    setError(null);
    try {
      const response = await searchPexelsMedia({
        projectId,
        query,
        orientation,
        page: nextPage,
        per_page: 12,
        moduleType,
        fieldKey,
        industry
      });

      const photos = response.photos || [];
      setResults(prev => (append ? [...prev, ...photos] : photos));
      setHasMore(Boolean(response.next_page) || photos.length >= 12);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof PexelsMediaClientError ? err.message : 'No se pudieron cargar imágenes.');
      if (!append) {
        setResults([]);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  if (!portalTarget) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/65 p-4 sm:p-6"
          onClick={onClose}
        >
          <div className="flex min-h-full items-start justify-center py-6 sm:py-10">
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex max-h-[min(88vh,900px)] w-full max-w-[1120px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Buscar en Pexels</h3>
                <p className="text-sm text-slate-500">Explora imágenes de stock y aplica una al campo actual.</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 md:flex-row md:items-center">
              <div className="relative min-w-[260px] flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') executeSearch(1, false);
                  }}
                  placeholder="Buscar imágenes..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition-all focus:border-blue-400 focus:bg-white"
                />
              </div>

              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as OrientationOption)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
                <option value="square">Square</option>
              </select>

              <button
                onClick={() => executeSearch(1, false)}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 md:self-stretch"
              >
                Buscar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {loading ? (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader2 size={28} className="animate-spin text-blue-600" />
                  <p className="text-sm font-semibold">Buscando imágenes...</p>
                </div>
              ) : error ? (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-center">
                  <div className="rounded-full bg-red-50 p-4 text-red-500">
                    <ImageIcon size={26} />
                  </div>
                  <p className="text-sm font-bold text-slate-900">{error}</p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-center">
                  <div className="rounded-full bg-slate-100 p-4 text-slate-400">
                    <ImageIcon size={26} />
                  </div>
                  <p className="text-sm font-bold text-slate-900">No se encontraron imágenes.</p>
                  <p className="text-xs text-slate-500">Prueba con otra búsqueda o cambia la orientación.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {results.map((photo) => {
                    const imageUrl = getPreferredImageUrl(photo, orientation);
                    return (
                      <div key={`${photo.id}-${imageUrl}`} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                        <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={photo.alt || 'Pexels image'}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-300">
                              <ImageIcon size={28} />
                            </div>
                          )}
                        </div>
                        <div className="space-y-3 p-4">
                          <div className="min-h-[52px]">
                            <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                              {photo.alt || 'Imagen de Pexels'}
                            </p>
                          </div>
                          <div className="space-y-1 text-xs text-slate-500">
                            <p>
                              Foto por <span className="font-bold text-slate-700">{photo.photographer || 'Pexels'}</span>
                            </p>
                            <a
                              href={photo.pexels_url || photo.url || 'https://www.pexels.com/'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
                            >
                              Ver fuente en Pexels
                              <ExternalLink size={12} />
                            </a>
                          </div>
                          <button
                            onClick={() =>
                              onSelect(imageUrl, {
                                provider: 'pexels',
                                pexels_id: photo.id,
                                photographer: photo.photographer,
                                photographer_url: photo.photographer_url,
                                pexels_url: photo.pexels_url || photo.url,
                                query,
                                selected_url: imageUrl,
                                orientation
                              })
                            }
                            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                          >
                            Usar imagen
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <p className="text-xs text-slate-500">
                Fuente: <span className="font-bold text-slate-700">Pexels</span>
              </p>
              {hasMore && !loading && !error && (
                <button
                  onClick={() => executeSearch(page + 1, true)}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
                  Cargar más
                </button>
              )}
            </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    ,
    portalTarget
  );
};
