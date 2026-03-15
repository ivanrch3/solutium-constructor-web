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

  return (
    <div className="flex items-center">
      <span className="text-[9px] font-bold text-text/30">
        v{data.version}
      </span>
    </div>
  );
};
