import { useEffect, useState } from 'react';

interface VersionHistory {
  date: string;
  changes: string[];
}

interface VersionData {
  version: string;
  history: VersionHistory[];
}

export const VersionDisplay = () => {
  const [data, setData] = useState<VersionData | null>(null);

  useEffect(() => {
    fetch('/version.json')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Error loading version:', err));
  }, []);

  if (!data) return null;

  // Sistema de semáforo Foundry v2
  const isCompatible = data.version.startsWith('3'); // Ejemplo: v3.x es compatible
  
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${isCompatible ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
      <span className={`text-[9px] font-bold ${isCompatible ? 'text-text/40' : 'text-amber-500/80'}`}>
        v{data.version}
      </span>
    </div>
  );
};
