import React from 'react';
import { PlusSquare, FileText, ExternalLink, Eye } from 'lucide-react';
import { Asset, WebBuilderSite, PublishedSite } from '../types/schema';
import { motion } from 'motion/react';

interface DashboardProps {
  assets: Asset[];
  pages: (WebBuilderSite | PublishedSite)[];
  onNewPage: () => void;
  onSelectAsset: (asset: Asset) => void;
  onSelectPage: (page: WebBuilderSite | PublishedSite) => void;
  logoUrl?: string | null;
  logoWhiteUrl?: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  assets, 
  pages, 
  onNewPage, 
  onSelectAsset, 
  onSelectPage, 
  logoUrl, 
  logoWhiteUrl 
}) => {
  const handlePreview = (e: React.MouseEvent, siteId: string) => {
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'preview');
    url.searchParams.set('site_id', siteId);
    window.open(url.toString(), '_blank');
  };

  return (
    <div className="min-h-screen bg-secondary p-8 flex flex-col items-center">
      {/* Header Logo */}
      <div className="flex flex-col items-center mb-16">
        {logoUrl && (
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="h-20 w-auto object-contain" 
            referrerPolicy="no-referrer" 
          />
        )}
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
                className="p-2 text-text/40 hover:text-primary transition-all"
                title="Previsualizar último sitio"
              >
                <Eye className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {pages.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {pages.map((page) => {
                  const isPublished = !('contentDraft' in page);
                  return (
                    <button
                      key={page.id}
                      onClick={() => onSelectPage(page)}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          isPublished ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-text group-hover:text-primary transition-colors">
                              {page.siteName || 'Sin nombre'}
                            </h3>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                              isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {isPublished ? 'Publicado' : 'Borrador'}
                            </span>
                          </div>
                          <p className="text-xs text-text/80 font-medium">
                            Actualizado el {new Date(page.updatedAt || '').toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => handlePreview(e, page.siteId || '')}
                          className="p-2 text-text/30 hover:text-primary transition-all"
                          title="Previsualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <ExternalLink className="w-4 h-4 text-text/50 group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  );
                })}
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
            className="flex items-center justify-center gap-2 bg-solutium-dark hover:opacity-90 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 w-fit group border border-black/5"
          >
            <PlusSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-base">Crear nuevo</span>
          </button>
        </motion.div>
      </div>

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
