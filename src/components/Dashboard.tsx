import React, { useState } from 'react';
import { PlusSquare, FileText, ExternalLink, Eye, Edit2, Check, X } from 'lucide-react';
import { Asset, WebBuilderSite, PublishedSite } from '../types/schema';
import { motion } from 'motion/react';

import { logDebug } from '../utils/debug';

interface DashboardProps {
  assets: Asset[];
  pages: (WebBuilderSite | PublishedSite)[];
  pagesLoadError?: string | null;
  onNewPage: () => void;
  onSelectAsset: (asset: Asset) => void;
  onSelectPage: (page: WebBuilderSite | PublishedSite) => void;
  onRenamePage: (siteId: string, newName: string) => Promise<void>;
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
  onNewPage, 
  onSelectAsset, 
  onSelectPage, 
  onRenamePage,
  sessionInfo,
  onRequestMotherContext,
  logoUrl, 
  logoWhiteUrl 
}) => {
  const displayLogo = CONSTRUCTOR_WEB_LOGO_URL;
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

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

  const handlePreview = (e: React.MouseEvent, siteId: string) => {
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'preview');
    url.searchParams.set('site_id', siteId);
    window.open(url.toString(), '_blank');
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
            {pages.length > 0 && (
              <button 
                onClick={(e) => handlePreview(e, pages[0].siteId || '')}
            className="p-2 text-text/40 hover:text-[var(--builder-primary)] transition-all"
                title="Previsualizar último sitio"
              >
                <Eye className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {pages.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {pages.map((page, index) => {
                  const status = (page as any).status || (!('contentDraft' in page) ? 'published' : 'draft');
                  const isPublished = status === 'published' || status === 'modified';
                  const isDebug = new URLSearchParams(window.location.search).get('debug_render') === 'true';
                  const pageKey = page.siteId || page.id || `page-${index}`;
                  const previewImageSrc = getPreviewImageSrc(page);
                  
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
                            {editingSiteId === page.siteId ? (
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <input 
                                  type="text"
                                  value={tempName}
                                  onChange={(e) => setTempName(e.target.value)}
                                  className="text-sm font-bold bg-secondary rounded px-2 py-0.5 outline-none focus:ring-1 w-full"
                                  style={{ borderColor: 'color-mix(in srgb, var(--builder-primary) 30%, var(--builder-border) 70%)' }}
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      onRenamePage(page.siteId || '', tempName);
                                      setEditingSiteId(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingSiteId(null);
                                    }
                                  }}
                                />
                                <button 
                                  onClick={() => {
                                    onRenamePage(page.siteId || '', tempName);
                                    setEditingSiteId(null);
                                  }}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => setEditingSiteId(null)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <h3 className="text-base font-bold text-text group-hover:text-[var(--builder-primary)] transition-colors truncate">
                                  {page.siteName || 'Sin nombre'}
                                </h3>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSiteId(page.siteId || null);
                                    setTempName(page.siteName || '');
                                  }}
                                  className="p-1 text-text/20 hover:text-[var(--builder-primary)] opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                              status === 'published' ? 'bg-green-100 text-green-700' : 
                              status === 'modified' ? 'bg-blue-100 text-blue-700' : 
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {status === 'published' ? 'Publicado' : status === 'modified' ? 'Modificado' : 'Borrador'}
                            </span>
                          </div>
                          <p className="text-xs text-text/80 font-medium truncate">
                            Actualizado el {new Date(page.updatedAt || '').toLocaleString([], { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {(isDebug || true) && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Guardar en sessionStorage que este sitio requiere captura automática al abrirse
                              sessionStorage.setItem(`auto_capture_${page.siteId}`, 'true');
                              onSelectPage(page);
                            }}
                            className="p-2 text-text/20 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Actualizar preview"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        <button 
                          onClick={(e) => handlePreview(e, page.siteId || '')}
                          className="p-2 text-text/30 hover:text-[var(--builder-primary)] transition-all"
                          title="Previsualizar"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
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

        {/* Nueva Página Card */}
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
