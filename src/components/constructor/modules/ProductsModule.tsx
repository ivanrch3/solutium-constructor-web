import React from 'react';
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react';
import { Product } from '../../../types/schema';
import { MOCK_PRODUCTS } from '../../../constants/mockData';

export const ProductsModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any>,
  products?: Product[],
  isDevMode?: boolean
}> = ({ moduleId, settingsValues, products, isDevMode }) => {
  // Helper to get setting value
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  const selectedProductIds = getVal(null, 'select_products', []);
  const baseProducts = products && products.length > 0 ? products : (isDevMode ? MOCK_PRODUCTS : []);
  
  const displayProducts = baseProducts.filter(p => 
    Array.isArray(selectedProductIds) && selectedProductIds.includes(p.id)
  );

  // Global Settings
  const sectionTitle = getVal(null, 'section_title', 'Nuestros Productos');
  const sectionDesc = getVal(null, 'section_desc', 'Descubre nuestra selección exclusiva de productos.');
  const columns = getVal(null, 'columns', 4);
  const gap = getVal(null, 'gap', 24);
  const darkMode = getVal(null, 'dark_mode', false);
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const hoverEffect = getVal(null, 'hover_effect', 'zoom');
  const sectionBgImage = getVal(null, 'section_bg_image', '');

  // Element Settings
  const imgBorderRadius = getVal(`${moduleId}_el_img`, 'border_radius', 16);
  const imgAspectRatio = getVal(`${moduleId}_el_img`, 'aspect_ratio', '1:1');
  
  const titleFontSize = getVal(`${moduleId}_el_title`, 'font_size', 16);
  const titleFontWeight = getVal(`${moduleId}_el_title`, 'font_weight', 'bold');
  
  const currency = getVal(`${moduleId}_el_price`, 'currency', '$');
  const priceSize = getVal(`${moduleId}_el_price`, 'price_size', 18);

  const showBadge = getVal(`${moduleId}_el_badge`, 'show_badge', true);
  const badgeBg = getVal(`${moduleId}_el_badge`, 'badge_bg', '#2563EB');

  const showRating = getVal(`${moduleId}_el_rating`, 'show_rating', true);
  const starColor = getVal(`${moduleId}_el_rating`, 'star_color', '#FBBF24');

  const ctaText = getVal(`${moduleId}_el_cta`, 'cta_text', 'Añadir');
  const ctaBg = getVal(`${moduleId}_el_cta`, 'cta_bg', '#0F172A');
  const ctaColor = getVal(`${moduleId}_el_cta`, 'cta_color', '#FFFFFF');
  const ctaHoverBg = getVal(`${moduleId}_el_cta`, 'cta_hover_bg', '#2563EB');

  const showDesc = getVal(`${moduleId}_el_desc`, 'show_desc', false);
  const descSize = getVal(`${moduleId}_el_desc`, 'desc_size', 12);

  const getAspectRatioClass = (ratio: string) => {
    switch (ratio) {
      case '4:5': return 'aspect-[4/5]';
      case '16:9': return 'aspect-video';
      default: return 'aspect-square';
    }
  };

  const getHoverClass = (effect: string) => {
    switch (effect) {
      case 'lift': return 'hover:-translate-y-2';
      case 'zoom': return 'group-hover:scale-110';
      default: return '';
    }
  };

  const getFontWeightClass = (weight: string) => {
    switch (weight) {
      case 'medium': return 'font-medium';
      case 'black': return 'font-black';
      case 'normal': return 'font-normal';
      default: return 'font-bold';
    }
  };

  return (
    <section 
      className="py-12 @md:py-20 @lg:py-24 px-8 w-full transition-colors duration-300 relative"
      style={{ 
        backgroundColor: darkMode ? undefined : bgColor,
        backgroundImage: sectionBgImage ? `url(${sectionBgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {sectionBgImage && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header del Módulo */}
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className={`font-black mb-4 text-3xl @md:text-4xl @lg:text-5xl ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {sectionTitle}
          </h2>
          <div className="w-20 h-1.5 bg-blue-600 rounded-full mb-6"></div>
          <p className={`max-w-2xl ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {sectionDesc}
          </p>
        </div>

        {/* Grid de Productos */}
        {displayProducts.length > 0 ? (
          <div 
            className={`grid ${
              columns === 4 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4' :
              columns === 3 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3' :
              columns === 2 ? 'grid-cols-1 @sm:grid-cols-2' : 'grid-cols-1'
            }`}
            style={{ 
              gap: `${gap}px`
            }}
          >
            {displayProducts.map((product) => (
              <div 
                key={product.id} 
                className={`group rounded-2xl border overflow-hidden transition-all duration-500 flex flex-col ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700 hover:shadow-2xl hover:shadow-black/50' 
                    : 'bg-white border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50'
                } ${hoverEffect === 'lift' ? 'hover:-translate-y-2' : ''}`}
              >
                {/* Imagen y Badge */}
                <div className={`relative overflow-hidden bg-slate-50 ${getAspectRatioClass(imgAspectRatio)}`}>
                  <img 
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=1000&auto=format&fit=crop'} 
                    alt={product.name} 
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      hoverEffect === 'zoom' ? 'group-hover:scale-110' : ''
                    } ${product.image2Url ? 'group-hover:opacity-0' : ''}`}
                    style={{ borderRadius: `${imgBorderRadius}px` }}
                    referrerPolicy="no-referrer"
                  />

                  {product.image2Url && (
                    <img 
                      src={product.image2Url} 
                      alt={`${product.name} alternate`} 
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 ${
                        hoverEffect === 'zoom' ? 'group-hover:scale-110' : ''
                      }`}
                      style={{ borderRadius: `${imgBorderRadius}px` }}
                      referrerPolicy="no-referrer"
                    />
                  )}
                  
                  {product.badgeText && showBadge && (
                    <div 
                      className="absolute top-4 left-4 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg"
                      style={{ backgroundColor: badgeBg }}
                    >
                      {product.badgeText}
                    </div>
                  )}

                  {/* Overlays de Acción */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 hover:bg-blue-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                      <Eye size={18} />
                    </button>
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 hover:bg-rose-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                      <Heart size={18} />
                    </button>
                  </div>
                </div>

                {/* Información */}
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">
                    {product.category}
                  </span>
                  <h3 
                    className={`mb-2 line-clamp-2 transition-colors ${
                      darkMode ? 'text-white' : 'text-slate-800'
                    } ${getFontWeightClass(titleFontWeight)}`}
                    style={{ fontSize: `${titleFontSize}px` }}
                  >
                    {product.name}
                  </h3>

                  {showDesc && (
                    <p 
                      className={`mb-4 line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}
                      style={{ fontSize: `${descSize}px` }}
                    >
                      Esta es una descripción corta del producto para mostrar cómo se ve en el constructor.
                    </p>
                  )}
                  
                  {/* Rating */}
                  {showRating && (
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          className={i < Math.floor(product.ratingAverage || 0) ? '' : 'text-slate-200'} 
                          style={{ color: i < Math.floor(product.ratingAverage || 0) ? starColor : undefined, fill: i < Math.floor(product.ratingAverage || 0) ? starColor : undefined }}
                        />
                      ))}
                      <span className="text-[10px] font-bold text-slate-400 ml-1">({product.reviewCount || 0})</span>
                    </div>
                  )}

                  {/* Precio y Botón */}
                  <div className={`mt-auto pt-4 border-t flex items-center justify-between ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
                    <div className="flex flex-col">
                      {product.priceReference && (
                        <span className="text-xs text-slate-400 line-through font-medium">
                          {currency}{product.priceReference.toFixed(2)}
                        </span>
                      )}
                      <span 
                        className={`font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}
                        style={{ fontSize: `${priceSize}px` }}
                      >
                        {currency}{(product.price || 0).toFixed(2)}
                      </span>
                    </div>
                    <button 
                      className="px-4 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-slate-900/10 text-[10px] font-bold uppercase tracking-widest gap-2"
                      style={{ 
                        backgroundColor: ctaBg, 
                        color: ctaColor 
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = ctaHoverBg}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ctaBg}
                    >
                      <ShoppingCart size={14} />
                      {ctaText}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`py-20 text-center border-2 border-dashed rounded-3xl ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'}`}>
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="text-blue-500 w-8 h-8" />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>No hay productos disponibles</h3>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Agrega productos a tu inventario en la pestaña de Datos para verlos aquí.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
