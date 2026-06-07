import React, { useState } from 'react';
import { PlusSquare, FileText, ExternalLink, Eye, Edit2, Trash2 } from 'lucide-react';
import { Asset, WebBuilderSite, PublishedSite } from '../types/schema';
import { motion } from 'motion/react';

import { logDebug } from '../utils/debug';

interface DashboardProps {
  assets: Asset[];
  pages: (WebBuilderSite | PublishedSite)[];
  pagesLoadError?: string | null;
  pagesLoading?: boolean;
  onNewPage: () => void;
  onSelectAsset: (asset: Asset) => void;
  onSelectPage: (page: WebBuilderSite | PublishedSite) => void;
  sessionInfo?: {
    hasRealSession: boolean;
    userLabel: string;
    projectLabel: string;
    startedAt: string;
    canRequestMotherContext: boolean;
  };
  onRequestMotherContext?: () => void;
  logoUrl?: string | null;
  logoWhiteUrl?: string | null;
}

const CONSTRUCTOR_WEB_LOGO_URL = 'https://nyc3.digitaloceanspaces.com/solutium-space/988cd339-a2c7-4951-b944-998d32dc349b-solutium-constructor-web-imagotipo.png';

export const Dashboard: React.FC<DashboardProps> = ({
  assets,
  pages,
  pagesLoadError,
  pagesLoading = false,
  onNewPage,
  onSelectAsset,
  onSelectPage,
  sessionInfo,
  onRequestMotherContext,
  logoUrl,
  logoWhiteUrl
}) => {
  const displayLogo = CONSTRUCTOR_WEB_LOGO_URL;
  const [previewPage, setPreviewPage] = useState<(WebBuilderSite | PublishedSite) | null>(null);

  const getPreviewImageSrc = (page: WebBuilderSite | PublishedSite) => {
    const baseUrl = page.previewThumbnailUrl || page.previewImageUrl;
    if (!baseUrl) return null;

    const version =
      page.previewImageHash ||
      page.previewImageUpdatedAt ||
      page.updatedAt ||
      page.createdAt ||
      null;

    if (!version) return baseUrl;

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}v=${encodeURIComponent(version)}`;
  };

  const resolvePreviewImageSrc = (page: WebBuilderSite | PublishedSite | null) => (
    page ? getPreviewImageSrc(page) : null
  );

  const normalizePublishedUrlCandidate = (value: unknown): string | null => {
    const rawValue = String(value || '').trim();
    if (!rawValue || rawValue === '#') return null;

    if (/^https?:\/\//i.test(rawValue)) return rawValue;
    if (/^[a-z0-9.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(rawValue)) return `https://${rawValue}`;

    return null;
  };

  const isValidPublishedPublicUrl = (value: unknown): value is string => {
    const candidate = normalizePublishedUrlCandidate(value);
    if (!candidate) return false;

    try {
      const url = new URL(candidate);
      const isLocalConstructorHost =
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.hostname === '::1' ||
        url.hostname === '[::1]';

      if (isLocalConstructorHost && url.port === '3010') return false;

      const search = url.searchParams;
      if (search.has('preview') || search.has('launch') || search.has('constructor')) {
        return false;
      }

      const mode = String(search.get('mode') || '').toLowerCase();
      if (mode === 'preview' || mode === 'render') {
        return false;
      }

      if (candidate.toLowerCase().includes('constructor')) return false;

      return true;
    } catch {
      return false;
    }
  };

  const resolvePublishedUrl = (page: WebBuilderSite | PublishedSite) => {
    const pageAny = page as any;
    const metadata = pageAny.metadata || {};
    const candidates = [
      pageAny.publicUrl,
      pageAny.publishedUrl,
      pageAny.public_url,
      pageAny.published_url,
      metadata.publicUrl,
      metadata.publishedUrl,
      metadata.public_url,
      metadata.published_url,
      metadata.domain,
      metadata.customDomain,
      metadata.custom_domain,
      pageAny.domain,
      pageAny.customDomain,
      pageAny.custom_domain,
      pageAny.url
    ];

    for (const candidate of candidates) {
      const normalizedCandidate = normalizePublishedUrlCandidate(candidate);
      if (normalizedCandidate && isValidPublishedPublicUrl(normalizedCandidate)) {
        return normalizedCandidate;
      }
    }

    return null;
  };

  const handlePreview = (e: React.MouseEvent, page: WebBuilderSite | PublishedSite) => {
    e.stopPropagation();
    if (!resolvePreviewImageSrc(page)) return;
    setPreviewPage(page);
  };

  const handleOpenPublished = (e: React.MouseEvent, page: WebBuilderSite | PublishedSite) => {
    e.stopPropagation();
    const publishedUrl = resolvePublishedUrl(page);
    if (!publishedUrl) return;
    window.open(publishedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="min-h-screen px-8 pb-8 pt-4 flex flex-col items-center"
      style={{ background: 'linear-gradient(180deg, var(--builder-bg) 0%, #EEF2FF 100%)' }}
    >
        {/* Header Logo */}
        <div className="w-full min-h-[170px] flex items-center justify-center">
          <img
            src={displayLogo}
            alt="Constructor Web"
            className="h-20 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        {/* Páginas Creadas Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-3xl p-8 shadow-sm border border-border flex flex-col h-[380px]"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text">Páginas creadas</h2>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {pages.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {pages.map((page, index) => {
                  const status = (page as any).status || (!('contentDraft' in page) ? 'published' : 'draft');
                  const isPublished = status === 'published' || status === 'modified';
                  const publishedUrl = resolvePublishedUrl(page);
                  const isLinked = Boolean(publishedUrl);
                  const statusLabel = status === 'published' && isLinked ? 'VINCULADO' : status === 'published' ? 'PUBLICADO' : status === 'modified' ? 'MODIFICADO' : 'BORRADOR';
                  const isDebug = new URLSearchParams(window.location.search).get('debug_render') === 'true';
                  const pageKey = page.siteId || page.id || `page-${index}`;
                  const previewImageSrc = getPreviewImageSrc(page);
                  const deleteUnavailableMessage = 'Para eliminar un sitio, necesitas hacerlo desde Solutium.';

                  return (
                    <div
                      key={pageKey}
                      onClick={() => {
                        logDebug('[OPEN_SAVED_SITE_CLICK_DEBUG]', {
                          siteId: page.siteId,
                          id: page.id,
                          siteName: page.siteName,
                          source: 'created_pages_list'
                        });
                        onSelectPage(page);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onSelectPage(page);
                        }
                      }}
                      className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-[var(--builder-primary-soft)] transition-all group text-left cursor-pointer"
                      style={{ borderColor: 'color-mix(in srgb, var(--builder-primary) 18%, var(--builder-border) 82%)' }}
                    >
                      <div className="flex items-center gap-3 shrink-0 min-w-0">
                        <div className={`w-14 h-10 rounded-lg flex items-center justify-center transition-colors overflow-hidden border border-border/40 shrink-0 ${
                          isPublished ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {previewImageSrc ? (
                            <img
                              src={previewImageSrc}
                              alt={page.siteName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                // Fallback if image fails to load
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement?.classList.add('flex-col');
                              }}
                            />
                          ) : (
                            <FileText className="w-5 h-5 opacity-40" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-text group-hover:text-[var(--builder-primary)] transition-colors truncate">
                              {page.siteName || 'Sin nombre'}
                            </h3>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                              status === 'published' && isLinked ? 'border border-purple-200 bg-purple-100 text-purple-700' :
                              status === 'published' ? 'bg-green-100 text-green-700' :
                              status === 'modified' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {statusLabel}
                            </span>
                            {status === 'modified' && isLinked && (
                              <span className="shrink-0 rounded-full border border-purple-200 bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-purple-700">
                                VINCULADO
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text/80 font-medium truncate">
                            Actualizado el {new Date(page.updatedAt || '').toLocaleString([], { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2 shrink-0">
                        {isPublished && isLinked && (
                          <button
                            onClick={(e) => handleOpenPublished(e, page)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-all hover:bg-green-50 hover:text-green-700"
                            aria-label="Abrir sitio vinculado"
                            title="Abrir URL vinculada"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPage(page);
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-all hover:bg-primary/5 hover:text-[var(--builder-primary)]"
                          aria-label="Editar"
                          title="Editar"
                        >
                          <Edit2 size={15} />
                        </button>
                        {(isDebug || true) && (
                          <button
                            onClick={(e) => handlePreview(e, page)}
                            disabled={!previewImageSrc}
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                              previewImageSrc
                                ? 'text-slate-600 hover:bg-amber-50 hover:text-amber-600'
                                : 'cursor-not-allowed text-slate-300'
                            }`}
                            aria-label="Actualizar preview"
                            title={previewImageSrc ? 'Ver preview guardado' : 'Aún no hay preview guardado.'}
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          disabled
                          className="inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg text-slate-300 transition-all"
                          aria-label="Borrar no disponible"
                          title={deleteUnavailableMessage}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : pagesLoading ? (
              <div className="h-full border-2 border-dashed border-border/70 bg-white/60 rounded-2xl flex flex-col justify-center gap-4 px-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-200/80 animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-2/3 rounded-full bg-slate-200/80 animate-pulse" />
                    <div className="h-3 w-1/2 rounded-full bg-slate-200/60 animate-pulse" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-20 rounded-2xl bg-slate-200/60 animate-pulse" />
                  <div className="h-20 rounded-2xl bg-slate-200/50 animate-pulse" />
                  <div className="h-20 rounded-2xl bg-slate-200/40 animate-pulse" />
                </div>
              </div>
            ) : pagesLoadError ? (
              <div className="h-full border-2 border-dashed border-amber-200 bg-amber-50/70 rounded-2xl flex flex-col items-center justify-center text-amber-800 space-y-3 px-6 text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-amber-700" />
                </div>
                <p className="text-base font-semibold">No se pudieron cargar las páginas.</p>
                <p className="text-xs leading-relaxed text-amber-700">{pagesLoadError}</p>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-text/80 space-y-3">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-text/60" />
                </div>
                <p className="text-base font-medium">No existen páginas.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Nueva página Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface rounded-3xl p-8 shadow-sm border border-border flex flex-col h-[380px]"
        >
          <h2 className="text-xl font-bold text-text mb-4">Nueva página</h2>
          <p className="text-base text-text/60 leading-relaxed mb-auto">
            Crea una nueva página desde cero con nuestro constructor web o utilizando inteligencia artificial.
          </p>

          <button
            onClick={onNewPage}
            className="flex items-center justify-center gap-2 hover:opacity-90 font-bold py-3 px-6 rounded-xl transition-all w-fit group border border-black/5"
            style={{
              backgroundColor: 'var(--builder-primary)',
              color: 'var(--builder-primary-contrast)',
              boxShadow: '0 18px 36px -18px color-mix(in srgb, var(--builder-primary) 40%, transparent)'
            }}
          >
            <PlusSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-base">Crear nuevo</span>
          </button>
        </motion.div>
      </div>

      {sessionInfo && (
        <div className="mt-6 w-full max-w-6xl">
          <div className={`rounded-2xl border px-4 py-3 text-center shadow-sm ${
            sessionInfo.hasRealSession
              ? 'border-slate-200 bg-white/85 text-slate-500'
              : 'border-red-200 bg-red-50/90 text-red-700'
          }`}>
            {sessionInfo.hasRealSession ? (
              <p className="text-xs leading-relaxed">
                Sesión activa: <span className="font-semibold text-slate-700">{sessionInfo.userLabel}</span>
                {' · '}
                Proyecto: <span className="font-semibold text-slate-700">{sessionInfo.projectLabel}</span>
                {' · '}
                Inicio: <span className="font-semibold text-slate-700">{sessionInfo.startedAt}</span>
              </p>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-semibold leading-relaxed">
                  Sesión expirada o no válida. Por favor vuelve a lanzar el Constructor Web desde Solutium.
                </p>
                {sessionInfo.canRequestMotherContext && onRequestMotherContext && (
                  <button
                    type="button"
                    onClick={onRequestMotherContext}
                    className="rounded-full border border-red-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700 transition-colors hover:bg-red-100"
                  >
                    Relanzar desde App Madre
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}


      {previewPage && resolvePreviewImageSrc(previewPage) && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-text">{previewPage.siteName || 'Preview guardado'}</h2>
                <p className="text-xs font-medium text-text/45">Preview guardado</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPage(null)}
                className="rounded-lg px-3 py-2 text-xs font-bold text-text/60 transition-all hover:bg-secondary hover:text-text"
              >
                Cerrar
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto bg-slate-100 p-4">
              <img
                src={resolvePreviewImageSrc(previewPage) || ''}
                alt={`Preview de ${previewPage.siteName || 'sitio'}`}
                className="mx-auto h-auto max-w-full rounded-xl bg-white shadow-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}} />
    </div>
  );
};
