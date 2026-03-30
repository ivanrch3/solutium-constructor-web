import React, { useState, useEffect } from 'react';
import { Project, Product } from '../types/schema';
import { getProjects, getProducts } from '../services/dataService';
import { generateAsset } from '../services/assetService';
import { WebRenderer } from './WebRenderer';
import { Asset } from '../types/asset';

export const AssetGenerator: React.FC<{ userId: string }> = ({ userId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'pdf' | 'excel' | 'web'>('pdf');
  const [loading, setLoading] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const projs = await getProjects(0, 100);
      const prods = await getProducts(0, 100);
      setProjects(projs);
      setProducts(prods);
      if (projs.length > 0) setSelectedProjectId(projs[0].id);
    };
    loadData();
  }, []);

  const handleGenerate = async () => {
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return;

    setLoading(true);
    const data = { products }; // Pass products as data for the asset
    const asset = await generateAsset(selectedType, data, project, userId);
    setGeneratedAsset(asset);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-surface rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-text">Generador de Activos</h2>
      
      <div className="space-y-4 mb-6 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
          <select 
            value={selectedProjectId} 
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Activo</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="web">Web</option>
          </select>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading || !selectedProjectId}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Generando...' : 'Generar Activo'}
        </button>
      </div>

      {generatedAsset && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold mb-4 text-text">Activo Generado</h3>
          <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
            <p className="text-sm text-gray-700 mb-1"><strong className="font-medium">ID:</strong> {generatedAsset.id}</p>
            <p className="text-sm text-gray-700 mb-1"><strong className="font-medium">Nombre:</strong> {generatedAsset.name}</p>
            <p className="text-sm text-gray-700 mb-1"><strong className="font-medium">Tipo:</strong> <span className="uppercase">{generatedAsset.type}</span></p>
            {generatedAsset.url && (
              <p className="text-sm text-gray-700">
                <strong className="font-medium">URL:</strong>{' '}
                <a href={generatedAsset.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  {generatedAsset.url}
                </a>
              </p>
            )}
          </div>

          {generatedAsset.type === 'web' && generatedAsset.data && (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <WebRenderer data={generatedAsset.data} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
