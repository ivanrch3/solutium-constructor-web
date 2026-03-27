import React from 'react';
import { useSolutium } from '../hooks/useSolutium';

export const ProductShowcase: React.FC = () => {
  const { config } = useSolutium();
  const { products, project } = config;

  const filteredProducts = products.filter(
    (p) => p.projectId === project.id && p.status === 'active'
  );

  if (filteredProducts.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No hay productos activos para este proyecto.
      </div>
    );
  }

  return (
    <div className="py-12 px-6">
      <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">Nuestros Productos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className="bg-white border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all"
            style={{ borderRadius: 'var(--border-radius)' }}
          >
            <div className="aspect-square overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-blue-600">${product.price}</span>
                <button 
                  className="px-4 py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                  style={{ borderRadius: 'calc(var(--border-radius) / 2)' }}
                >
                  Comprar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
