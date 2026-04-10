import React, { useState, useMemo } from 'react';
import { Star, ShoppingCart, Eye, Heart, X, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../../../types/schema';
import { MOCK_PRODUCTS } from '../../../constants/mockData';

export const ProductsModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any>,
  products?: Product[],
  isDevMode?: boolean
}> = ({ moduleId, settingsValues, products, isDevMode }) => {
  const [activeTab, setActiveTab] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  const selectedProductIds = getVal(null, 'select_products', []);
  const baseProducts = products && products.length > 0 ? products : (isDevMode ? MOCK_PRODUCTS : []);
  
  const allDisplayProducts = useMemo(() => {
    return baseProducts.filter(p => 
      Array.isArray(selectedProductIds) && selectedProductIds.includes(p.id)
    );
  }, [baseProducts, selectedProductIds]);

  const categories = useMemo(() => {
    const cats = new Set(allDisplayProducts.map(p => p.category).filter(Boolean));
    return ['Todos', ...Array.from(cats)];
  }, [allDisplayProducts]);

  const filteredProducts = useMemo(() => {
    if (activeTab === 'Todos') return allDisplayProducts;
    return allDisplayProducts.filter(p => p.category === activeTab);
  }, [allDisplayProducts, activeTab]);

  // Global Settings
  const sectionTitle = getVal(null, 'section_title', 'Nuestros Productos');
  const sectionDesc = getVal(null, 'section_desc', 'Descubre nuestra selección exclusiva de productos.');
  const showTabs = getVal(null, 'show_tabs', true);
  const layout = getVal(null, 'layout', 'grid');
  const columns = getVal(null, 'columns', 4);
  const gap = getVal(null, 'gap', 24);
  const darkMode = getVal(null, 'dark_mode', false);
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const sectionGradient = getVal(null, 'section_gradient', false);
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const enableQuickview = getVal(null, 'enable_quickview', true);
  const showUrgency = getVal(null, 'show_urgency', false);

  // Element Settings: Image
  const imgBorderRadius = getVal(`${moduleId}_el_img`, 'border_radius', 16);
  const imgAspectRatio = getVal(`${moduleId}_el_img`, 'aspect_ratio', '1:1');
  const hoverSwap = getVal(`${moduleId}_el_img`, 'hover_swap', true);
  const imgHoverEffect = getVal(`${moduleId}_el_img`, 'hover_effect', 'zoom');
  
  // Element Settings: Card
  const cardStyle = getVal(`${moduleId}_el_product_card`, 'card_style', 'solid');
  const cardBg = getVal(`${moduleId}_el_product_card`, 'card_bg', '#FFFFFF');
  const cardShadow = getVal(`${moduleId}_el_product_card`, 'card_shadow', 'sm');
  const cardHoverLift = getVal(`${moduleId}_el_product_card`, 'hover_lift', true);

  // Element Settings: Title
  const titleFontSize = getVal(`${moduleId}_el_title`, 'font_size', 16);
  const titleFontWeight = getVal(`${moduleId}_el_title`, 'font_weight', 'bold');
  const titleColor = getVal(`${moduleId}_el_title`, 'title_color', '#0F172A');
  
  // Element Settings: Price
  const currency = getVal(`${moduleId}_el_price`, 'currency', '$');
  const priceSize = getVal(`${moduleId}_el_price`, 'price_size', 18);
  const showSavings = getVal(`${moduleId}_el_price`, 'show_savings', true);
  const priceColorSetting = getVal(`${moduleId}_el_price`, 'price_color', '#0F172A');
  const saleColorSetting = getVal(`${moduleId}_el_price`, 'sale_color', '#EF4444');

  // Element Settings: CTA
  const ctaText = getVal(`${moduleId}_el_cta`, 'cta_text', 'Añadir');
  const showCtaIcon = getVal(`${moduleId}_el_cta`, 'show_icon', true);
  const ctaBg = getVal(`${moduleId}_el_cta`, 'cta_bg', '#0F172A');
  const ctaColor = getVal(`${moduleId}_el_cta`, 'cta_color', '#FFFFFF');
  const ctaRadius = getVal(`${moduleId}_el_cta`, 'cta_radius', 12);
  const ctaHoverBg = getVal(`${moduleId}_el_cta`, 'cta_hover_bg', '#2563EB');

  const getAspectRatioClass = (ratio: string) => {
    switch (ratio) {
      case '4:5': return 'aspect-[4/5]';
      case '16:9': return 'aspect-video';
      default: return 'aspect-square';
    }
  };

  const getShadow = (s: string) => {
    if (s === 'sm') return '0 4px 20px rgba(0,0,0,0.05)';
    if (s === 'lg') return '0 10px 40px rgba(0,0,0,0.1)';
    return 'none';
  };

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % Math.ceil(filteredProducts.length / columns));
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + Math.ceil(filteredProducts.length / columns)) % Math.ceil(filteredProducts.length / columns));
  };

  return (
    <section 
      className={`py-12 @md:py-20 @lg:py-24 px-8 w-full transition-colors duration-300 relative ${darkMode ? 'bg-slate-900' : ''}`}
      style={{ 
        backgroundColor: darkMode ? undefined : bgColor,
        backgroundImage: sectionGradient ? `linear-gradient(180deg, ${bgColor} 0%, rgba(0,0,0,0.02) 100%)` : 'none'
      }}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className={`font-black mb-4 text-3xl @md:text-4xl @lg:text-5xl ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {sectionTitle}
          </h2>
          <div className="w-20 h-1.5 bg-primary rounded-full mb-6"></div>
          <p className={`max-w-2xl ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {sectionDesc}
          </p>
        </div>

        {/* Tabs */}
        {showTabs && categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveTab(cat);
                  setCarouselIndex(0);
                }}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  activeTab === cat 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products Display */}
        {filteredProducts.length > 0 ? (
          <div className="relative">
            <motion.div 
              layout
              className={`grid ${
                layout === 'carousel' ? 'flex transition-transform duration-500' :
                layout === 'list' ? 'grid-cols-1' :
                columns === 6 ? 'grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-6' :
                columns === 4 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4' :
                columns === 3 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3' :
                columns === 2 ? 'grid-cols-1 @sm:grid-cols-2' : 'grid-cols-1'
              }`}
              style={{ 
                gap: layout === 'carousel' ? '0' : `${gap}px`,
                transform: layout === 'carousel' ? `translateX(-${carouselIndex * 100}%)` : 'none'
              }}
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, idx) => {
                  const hasSale = product.priceReference && product.priceReference > (product.price || 0);
                  const savings = hasSale ? Math.round(((product.priceReference! - product.price!) / product.priceReference!) * 100) : 0;

                  return (
                    <motion.div 
                      key={product.id + idx}
                      layout
                      initial={entranceAnim ? { opacity: 0, y: 20 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`group flex flex-col transition-all duration-500 ${
                        layout === 'list' ? 'flex-row gap-8 items-center' : 
                        layout === 'carousel' ? `w-full shrink-0 px-[${gap/2}px]` : ''
                      } ${cardHoverLift ? 'hover:-translate-y-2' : ''}`}
                      style={{
                        backgroundColor: cardStyle === 'glass' ? 'rgba(255,255,255,0.05)' : cardStyle === 'minimal' ? 'transparent' : darkMode ? '#1E293B' : cardBg,
                        backdropFilter: cardStyle === 'glass' ? 'blur(12px)' : 'none',
                        borderRadius: `${imgBorderRadius}px`,
                        padding: cardStyle === 'minimal' ? '0' : '16px',
                        boxShadow: cardStyle === 'minimal' ? 'none' : getShadow(cardShadow),
                        border: cardStyle === 'bordered' ? `1px solid ${darkMode ? '#334155' : '#E2E8F0'}` : 'none',
                        width: layout === 'carousel' ? `${100 / columns}%` : 'auto'
                      }}
                    >
                      {/* Image */}
                      <div className={`relative overflow-hidden bg-slate-50 ${getAspectRatioClass(imgAspectRatio)} ${layout === 'list' ? 'w-48 shrink-0' : 'w-full'}`} style={{ borderRadius: `${imgBorderRadius}px` }}>
                        <img 
                          src={product.imageUrl || 'https://picsum.photos/seed/prod/800/800'} 
                          alt={product.name} 
                          className={`w-full h-full object-cover transition-all duration-700 ${imgHoverEffect === 'zoom' ? 'group-hover:scale-110' : imgHoverEffect === 'scale' ? 'group-hover:scale-105' : ''}`}
                          referrerPolicy="no-referrer"
                        />
                        {hoverSwap && product.image2Url && (
                          <img 
                            src={product.image2Url} 
                            alt={`${product.name} alt`} 
                            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            referrerPolicy="no-referrer"
                          />
                        )}

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.badgeText && (
                            <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                              {product.badgeText}
                            </span>
                          )}
                          {hasSale && showSavings && (
                            <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                              -{savings}%
                            </span>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                          {enableQuickview && (
                            <button 
                              onClick={() => setSelectedProduct(product)}
                              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                            >
                              <Eye size={18} />
                            </button>
                          )}
                          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 hover:bg-rose-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                            <Heart size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className={`pt-4 flex flex-col flex-1 ${layout === 'list' ? 'text-left' : 'text-center'}`}>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
                          {product.category}
                        </span>
                        <h3 
                          className={`line-clamp-2 mb-2 ${darkMode ? 'text-white' : ''}`}
                          style={{ 
                            fontSize: `${titleFontSize}px`, 
                            fontWeight: titleFontWeight === 'black' ? 900 : titleFontWeight === 'bold' ? 700 : 500,
                            color: darkMode ? '#FFFFFF' : titleColor
                          }}
                        >
                          {product.name}
                        </h3>

                        {/* Urgency */}
                        {showUrgency && (product.stock || 0) < 10 && (
                          <div className="flex items-center justify-center gap-1 mb-2 text-rose-500 text-[10px] font-bold uppercase animate-pulse">
                            <Zap size={10} fill="currentColor" />
                            ¡Solo quedan {product.stock} unidades!
                          </div>
                        )}

                        {/* Rating */}
                        <div className={`flex items-center gap-1 mb-4 ${layout === 'list' ? 'justify-start' : 'justify-center'}`}>
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              fill={i < Math.floor(product.ratingAverage || 0) ? "#FBBF24" : "none"}
                              className={i < Math.floor(product.ratingAverage || 0) ? 'text-amber-400' : 'text-slate-200'} 
                            />
                          ))}
                          <span className="text-[10px] font-bold text-slate-400 ml-1">({product.reviewCount || 0})</span>
                        </div>

                        {/* Price & CTA */}
                        <div className={`mt-auto pt-4 border-t flex items-center justify-between ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                          <div className="flex flex-col items-start">
                            {hasSale && (
                              <span className="text-xs text-slate-400 line-through font-medium">
                                {currency}{product.priceReference?.toFixed(2)}
                              </span>
                            )}
                            <span 
                              className="font-black"
                              style={{ 
                                fontSize: `${priceSize}px`, 
                                color: hasSale ? saleColorSetting : darkMode ? '#FFFFFF' : priceColorSetting 
                              }}
                            >
                              {currency}{(product.price || 0).toFixed(2)}
                            </span>
                          </div>
                          <button 
                            className="px-4 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg text-[10px] font-bold uppercase tracking-widest gap-2"
                            style={{ 
                              backgroundColor: ctaBg, 
                              color: ctaColor,
                              borderRadius: `${ctaRadius}px`
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = ctaHoverBg}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ctaBg}
                          >
                            {showCtaIcon && <ShoppingCart size={14} />}
                            {ctaText}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {layout === 'carousel' && filteredProducts.length > columns && (
              <>
                <button 
                  onClick={prevSlide}
                  className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all z-10"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all z-10"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={`py-20 text-center border-2 border-dashed rounded-3xl ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'}`}>
            <ShoppingCart className="text-slate-300 w-12 h-12 mx-auto mb-4" />
            <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>No hay productos seleccionados</h3>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Selecciona productos en el panel de configuración para mostrarlos aquí.
            </p>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all z-10"
              >
                <X size={20} />
              </button>
              
              <div className="w-full md:w-1/2 aspect-square">
                <img 
                  src={selectedProduct.imageUrl || 'https://picsum.photos/seed/prod/800/800'} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="flex-1 p-8 md:p-12 flex flex-col">
                <span className="text-primary font-bold uppercase tracking-widest text-xs mb-2">{selectedProduct.category}</span>
                <h3 className="text-3xl font-black text-slate-900 mb-4">{selectedProduct.name}</h3>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < Math.floor(selectedProduct.ratingAverage || 0) ? "#FBBF24" : "none"} className={i < Math.floor(selectedProduct.ratingAverage || 0) ? 'text-amber-400' : 'text-slate-200'} />
                    ))}
                  </div>
                  <span className="text-sm text-slate-400 font-bold">{selectedProduct.reviewCount} reseñas</span>
                </div>

                <div className="text-4xl font-black text-slate-900 mb-8">
                  {currency}{selectedProduct.price?.toFixed(2)}
                  {selectedProduct.priceReference && (
                    <span className="text-lg text-slate-400 line-through ml-3 font-medium">
                      {currency}{selectedProduct.priceReference.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-slate-600 leading-relaxed mb-8">
                  {selectedProduct.description || "Este producto de alta calidad ha sido diseñado pensando en la durabilidad y el rendimiento excepcional. Perfecto para quienes buscan lo mejor en su categoría."}
                </p>

                <div className="mt-auto flex gap-4">
                  <button className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-primary/20">
                    <ShoppingCart size={20} />
                    Añadir al Carrito
                  </button>
                  <button className="w-14 h-14 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                    <Heart size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
