import React from 'react';

interface CrmSettingsProps {
  config: any;
}

export const CrmSettings: React.FC<CrmSettingsProps> = ({ config }) => {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
      <h4 className="text-lg font-bold text-text mb-4">Ajustes CRM</h4>
      <p className="text-text/60 mb-4">Configuración avanzada de CRM.</p>
      <div className="text-xs text-text/60 bg-background p-4 rounded-xl border border-text/10 font-mono">
        <p>API URL: {config.api_url}</p>
        <p>Token de sesión activo</p>
      </div>
    </div>
  );
};
