import React from 'react';
import { Package, Check, Plus } from 'lucide-react';
import { useSolutiumContext } from '../../context/SatelliteContext';
import { useBuilderStore } from '../../store/useBuilderStore';

interface ProductManagerProps {
  data: any;
  onUpdate: (data: any) => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ data, onUpdate }) => {
  const { payload: config } = useSolutiumContext();
  const { selected_product_ids, update_selected_products } = useBuilderStore();
  
  // Get products from config (mother app)
  const products = config?.products_data || [];

  const toggleProduct = (productId: string) => {
    const idStr = productId.toString();
    const newSelection = selected_product_ids.includes(idStr)
      ? selected_product_ids.filter(id => id !== idStr)
      : [...selected_product_ids, idStr];
    update_selected_products(newSelection);
  };

  if (products.length === 0) {
    return (
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-700 text-xs">
        No se han recibido productos de la aplicación madre.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2">
        {products.map((product: any) => {
          const isSelected = selected_product_ids.includes(product.id.toString());
          return (
            <button
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                isSelected 
                  ? 'bg-primary/5 border-primary shadow-sm' 
                  : 'bg-surface border-text/5 hover:border-text/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-primary text-white' : 'bg-background text-text/40'
                }`}>
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-text'}`}>
                    {product.name}
                  </p>
                  {product.unit_cost && (
                    <p className="text-[10px] text-text/40">
                      ${product.unit_cost}
                    </p>
                  )}
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                isSelected 
                  ? 'bg-primary border-primary text-white' 
                  : 'bg-background border-text/10 text-transparent'
              }`}>
                <Check className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>
      
      <p className="text-[10px] text-text/40 italic px-1">
        * Los productos seleccionados se mostrarán automáticamente en el módulo.
      </p>
    </div>
  );
};
