import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { usePageLayout } from '../../context/PageLayoutContext';

export const ProductShowcaseModule = ({ data, config, selected_product_ids, onUpdate }: { data: any, config: any, selected_product_ids: string[], onUpdate?: (data: any) => void }) => {
  const { previewDevice } = usePageLayout();
  const is_mobile_simulated = previewDevice === 'mobile';
  const products = (config?.products_data || []).filter((p: any) => 
    selected_product_ids.includes(p.id.toString())
  );

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
        <div className={`text-center ${is_mobile_simulated ? 'mb-10' : 'mb-20'}`}>
          <Typography
            variant="h2"
            className={`${is_mobile_simulated ? 'text-3xl' : 'text-4xl md:text-5xl'} font-black mb-6 tracking-tight`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
          >
            {data?.title || 'Productos Destacados'}
          </Typography>
          <Typography
            variant="p"
            className={`${is_mobile_simulated ? 'text-lg' : 'text-xl'} opacity-60 max-w-2xl mx-auto leading-relaxed`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('subtitle', text)}
          >
            {data?.subtitle || 'Echa un vistazo a nuestras últimas novedades.'}
          </Typography>
        </div>
        
        {products.length > 0 ? (
          <div className={`grid ${data?.layout === 'list' && !is_mobile_simulated ? 'grid-cols-1 max-w-4xl mx-auto' : is_mobile_simulated ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-8`}>
            {products.map((product: any) => (
              <div 
                key={product.id} 
                className={`bg-current/5 ${is_mobile_simulated ? 'rounded-2xl' : 'rounded-[2rem]'} overflow-hidden border border-current/10 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group ${
                  data?.layout === 'list' && !is_mobile_simulated ? 'flex flex-col sm:flex-row items-center' : 'flex flex-col'
                }`}
              >
                <div className={`relative ${data?.layout === 'list' && !is_mobile_simulated ? 'w-full sm:w-1/3 aspect-square' : 'aspect-[4/3] w-full'} overflow-hidden bg-current/5`}>
                  <img 
                    src={product.app_data?.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=compress&cs=tinysrgb&w=800'} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-current/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold opacity-70 shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    4.9
                  </div>
                </div>
                <div className={`${is_mobile_simulated ? 'p-6' : 'p-8'} flex-1 flex flex-col ${data?.layout === 'list' && !is_mobile_simulated ? 'justify-center' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`${is_mobile_simulated ? 'text-xl' : 'text-2xl'} font-bold mb-2 group-hover:text-primary transition-colors`}>{product.name}</h3>
                      <p className="opacity-60 text-sm line-clamp-2 leading-relaxed">{product.description}</p>
                    </div>
                  </div>
                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-current/10">
                    <span className={`${is_mobile_simulated ? 'text-2xl' : 'text-3xl'} font-black tracking-tight`}>${product.unit_cost || 0}</span>
                    <button className={`${is_mobile_simulated ? 'w-10 h-10' : 'w-12 h-12'} bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary/90 transition-colors hover:scale-105 active:scale-95 shadow-lg shadow-primary/20`}>
                      <ShoppingCart className={`${is_mobile_simulated ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center ${is_mobile_simulated ? 'py-12' : 'py-20'} bg-current/5 ${is_mobile_simulated ? 'rounded-2xl' : 'rounded-[2rem]'} border border-dashed border-current/20`}>
            <ShoppingCart className={`${is_mobile_simulated ? 'w-12 h-12' : 'w-16 h-16'} opacity-30 mx-auto mb-6`} />
            <h3 className={`${is_mobile_simulated ? 'text-xl' : 'text-2xl'} font-bold mb-2`}>No hay productos seleccionados</h3>
            <p className="opacity-60 max-w-md mx-auto px-4">
              Selecciona los productos que quieres mostrar desde el panel de propiedades del módulo.
            </p>
          </div>
        )}
      </div>
    </ModuleWrapper>
  );
};
