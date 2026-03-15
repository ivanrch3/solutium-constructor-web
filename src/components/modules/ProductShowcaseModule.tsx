import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';

export const ProductShowcaseModule = ({ data, config, selectedProductIds, onUpdate }: { data: any, config: any, selectedProductIds: string[], onUpdate?: (data: any) => void }) => {
  const products = config?.productsConfig?.initialProducts?.filter((p: any) => 
    selectedProductIds.includes(p.id.toString())
  ) || [];

  const handleTextUpdate = (path: string, value: string) => {
    if (onUpdate) {
      const newData = { ...data };
      const parts = path.split('.');
      let current = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (Array.isArray(current[key])) {
          current[key] = [...current[key]];
        } else {
          current[key] = { ...current[key] };
        }
        current = current[key];
      }
      current[parts[parts.length - 1]] = value;
      onUpdate(newData);
    }
  };

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <Typography
            variant="h2"
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
          >
            {data?.title || 'Productos Destacados'}
          </Typography>
          <Typography
            variant="p"
            className="text-xl opacity-60 max-w-2xl mx-auto leading-relaxed"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('subtitle', text)}
          >
            {data?.subtitle || 'Echa un vistazo a nuestras últimas novedades.'}
          </Typography>
        </div>
        
        {products.length > 0 ? (
          <div className={`grid ${data?.layout === 'list' ? 'grid-cols-1 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-8`}>
            {products.map((product: any) => (
              <div 
                key={product.id} 
                className={`bg-current/5 rounded-[2rem] overflow-hidden border border-current/10 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group ${
                  data?.layout === 'list' ? 'flex flex-col sm:flex-row items-center' : 'flex flex-col'
                }`}
              >
                <div className={`relative ${data?.layout === 'list' ? 'w-full sm:w-1/3 aspect-square' : 'aspect-[4/3] w-full'} overflow-hidden bg-current/5`}>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-current/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold opacity-70 shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    4.9
                  </div>
                </div>
                <div className={`p-8 flex-1 flex flex-col ${data?.layout === 'list' ? 'justify-center' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                      <p className="opacity-60 text-sm line-clamp-2 leading-relaxed">{product.description}</p>
                    </div>
                  </div>
                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-current/10">
                    <span className="text-3xl font-black tracking-tight">{product.price}</span>
                    <button className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary/90 transition-colors hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-current/5 rounded-[2rem] border border-dashed border-current/20">
            <ShoppingCart className="w-16 h-16 opacity-30 mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-2">No hay productos seleccionados</h3>
            <p className="opacity-60 max-w-md mx-auto">
              Ve a la pestaña "Productos" en la barra lateral para seleccionar qué productos quieres mostrar aquí.
            </p>
          </div>
        )}
      </div>
    </ModuleWrapper>
  );
};
