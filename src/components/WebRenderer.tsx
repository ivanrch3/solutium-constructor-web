import React from 'react';

interface WebRendererProps {
  data: any;
}

export const WebRenderer: React.FC<WebRendererProps> = ({ data }) => {
  if (!data || !data.structure) {
    return <div className="p-4 text-gray-500">No data to render</div>;
  }

  const { structure, branding } = data;

  return (
    <div style={{ backgroundColor: branding?.secondaryColor || '#f3f4f6', padding: '2rem', minHeight: '400px' }}>
      <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div className="flex items-center mb-6">
          {branding?.logoUrl && (
            <img src={branding.logoUrl} alt="Logo" className="h-12 mr-4" referrerPolicy="no-referrer" />
          )}
          <h1 style={{ color: branding?.primaryColor || '#000', fontSize: '2rem', margin: 0 }}>
            Web Asset
          </h1>
        </div>
        <pre style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px', overflowX: 'auto', fontSize: '0.875rem' }}>
          {JSON.stringify(structure, null, 2)}
        </pre>
      </div>
    </div>
  );
};
