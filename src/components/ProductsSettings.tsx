import React from 'react';
import { supabase } from '../lib/supabase';

interface ProductsSettingsProps {
  config: any;
  selectedProductIds: string[];
  onUpdateProducts: (productIds: string[]) => void;
}

export const ProductsSettings: React.FC<ProductsSettingsProps> = ({ config, selectedProductIds, onUpdateProducts }) => {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Verificar si supabase.from existe antes de llamar
        if (!supabase || typeof supabase.from !== 'function') {
          console.warn("Supabase no está inicializado, omitiendo carga de productos.");
          setProducts([]);
          return;
        }
        
        const { data, error } = await supabase
          .from('products')
          .select('*');
          
        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products from Supabase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleProduct = (productId: string) => {
    const newSelection = selectedProductIds.includes(productId.toString())
      ? selectedProductIds.filter(id => id !== productId.toString())
      : [...selectedProductIds, productId.toString()];
    onUpdateProducts(newSelection);
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
      <h4 className="text-lg font-bold text-text mb-4">Ajustes de Productos y Servicios</h4>
      <p className="text-text/60 mb-6">Selecciona los productos que quieres mostrar.</p>
      
      {loading ? (
        <p className="text-text/60">Cargando productos...</p>
      ) : products.length === 0 ? (
        <p className="text-text/60">No se encontraron productos.</p>
      ) : (
        <div className="space-y-4">
          {products.map((product: any) => (
            <div key={product.id} className="flex items-center justify-between p-4 bg-background rounded-xl border border-text/10">
              <span className="font-medium text-text">{product.name}</span>
              <button 
                onClick={() => toggleProduct(product.id)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  selectedProductIds.includes(product.id.toString())
                    ? 'bg-primary text-white'
                    : 'bg-surface text-text/60 hover:bg-text/10'
                }`}
              >
                {selectedProductIds.includes(product.id.toString()) ? 'Seleccionado' : 'Seleccionar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
