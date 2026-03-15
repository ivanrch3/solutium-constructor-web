import React from 'react';
import { Share2, Link as LinkIcon, RefreshCw, Edit3 } from 'lucide-react';

interface SocialNetworksManagerProps {
  data: any;
  onUpdate: (data: any) => void;
  projectSocials?: any;
}

export const SocialNetworksManager = ({ data, onUpdate, projectSocials }: SocialNetworksManagerProps) => {
  const socials = data.socials || { useProjectSocials: true };
  const isUsingProject = socials.useProjectSocials !== false;

  const updateSocials = (key: string, value: any) => {
    onUpdate({
      socials: {
        ...socials,
        [key]: value
      }
    });
  };

  const currentSocials = isUsingProject && projectSocials ? projectSocials : socials;

  return (
    <div className="space-y-6">
      {/* Toggle Mode */}
      <div className="flex bg-background p-1 rounded-xl border border-text/10">
        <button
          onClick={() => updateSocials('useProjectSocials', true)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
            isUsingProject 
              ? 'bg-surface text-primary shadow-sm' 
              : 'text-text/40 hover:text-text/60'
          }`}
        >
          <RefreshCw className="w-3 h-3" />
          Usar del Proyecto
        </button>
        <button
          onClick={() => updateSocials('useProjectSocials', false)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
            !isUsingProject 
              ? 'bg-surface text-primary shadow-sm' 
              : 'text-text/40 hover:text-text/60'
          }`}
        >
          <Edit3 className="w-3 h-3" />
          Editar Manual
        </button>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map((network) => (
          <div key={network} className="space-y-2">
            <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2 capitalize">
              <Share2 className="w-3 h-3" /> {network}
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/30" />
              <input
                type="text"
                value={currentSocials[network] || ''}
                onChange={(e) => updateSocials(network, e.target.value)}
                disabled={isUsingProject}
                className={`w-full pl-9 pr-3 py-3 bg-background border border-text/10 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${
                  isUsingProject ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                placeholder={`https://${network}.com/...`}
              />
            </div>
          </div>
        ))}
      </div>
      
      {isUsingProject && (
        <p className="text-[9px] text-text/30 italic leading-relaxed text-center">
          * La información se está obteniendo automáticamente de la configuración del proyecto activo.
        </p>
      )}
    </div>
  );
};
