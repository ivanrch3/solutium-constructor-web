import React from 'react';
import { Package, Check } from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { PremiumBadge } from './PremiumBadge';

interface ProductManagerProps {
  data: any;
  onUpdate: (data: any) => void;
  isPremiumUser?: boolean;
  config?: any;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ data, onUpdate, isPremiumUser = false, config }) => {
  const { selectedProductIds, updateSelectedProducts } = useBuilderStore();
  
  // Get products from config (mother app)
  const products = config?.products || (config as any)?.productsData || [];

  const toggleProduct = (productId: string) => {
    const idStr = productId.toString();
    const newSelection = selectedProductIds.includes(idStr)
      ? selectedProductIds.filter(id => id !== idStr)
      : [...selectedProductIds, idStr];
    
    // Free users can only select up to 3 products
    if (!isPremiumUser && newSelection.length > 3) {
      return;
    }
    
    updateSelectedProducts(newSelection);
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
      {!isPremiumUser && (
        <div className="p-3 bg-background border border-text/10 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2">
            <PremiumBadge inline />
          </div>
          <p className="text-xs font-medium text-text/80 pr-12">
            En la versión gratuita puedes seleccionar hasta <span className="font-black text-primary">3 productos</span>.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {products.map((product: any) => {
          const isSelected = selectedProductIds.includes(product.id.toString());
          const isLimitReached = !isPremiumUser && !isSelected && selectedProductIds.length >= 3;

          return (
            <button
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              disabled={isLimitReached}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                isSelected 
                  ? 'bg-primary/5 border-primary shadow-sm' 
                  : isLimitReached
                    ? 'bg-background border-text/5 opacity-50 cursor-not-allowed'
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
                  {product.unitCost && (
                    <p className="text-[10px] text-text/40">
                      ${product.unitCost}
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
