import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Star, Package, Eye, ArrowRight, Filter } from 'lucide-react';
import { Product } from '../../../types/schema';

interface ProductsShowcaseModuleProps {
  moduleId: string;
  content: any;
  settingsValues: any;
  isActuallyEditor?: boolean;
  isPublishedViewer?: boolean;
  products?: Product[];
}

export const ProductsShowcaseModule: React.FC<ProductsShowcaseModuleProps> = ({
  moduleId,
  content = {},
  settingsValues = {},
  isActuallyEditor = false,
  isPublishedViewer = false,
  products = []
}) => {
  const [activeTab, setActiveTab] = useState('Todos');

  // --- 1. NORMALIZACIÓN DE PRODUCTOS (AUDIT POINT 3/8) ---
  const normalizeProduct = (p: any, index: number): any => {
    if (!p) return null;
    
    const id = String(p.id || p.product_id || p.productId || p.sku || p.codigo || p.ID || `prod_v2_${index}`);
    const name = p.name || p.title || p.nombre || p.title || p.titulo || p.heading || `Producto ${index + 1}`;
    const description = p.description || p.descripcion || p.desc || p.text || p.texto || p.summary || p.resumen || p.shortDescription || '';
    
    let priceValue = p.price || p.precio || p.amount || p.monto || p.cost || p.costo || 0;
    if (typeof priceValue === 'string') {
      priceValue = parseFloat(priceValue.replace(/[^\d.,-]/g, '').replace(',', '.'));
    }
    const price = Number.isFinite(priceValue) ? priceValue : 0;

    let refPriceValue = p.priceReference || p.precioReferencia || p.old_price || p.precio_anterior || p.compare_at_price || p.before_price;
    if (typeof refPriceValue === 'string') {
      refPriceValue = parseFloat(refPriceValue.replace(/[^\d.,-]/g, '').replace(',', '.'));
    }
    const priceReference = Number.isFinite(refPriceValue) ? refPriceValue : undefined;

    const imageUrl = p.imageUrl || p.image_url || p.image || p.imagen || p.foto || p.img || 
                     p.thumbnail || (p.media && p.media.url) || (p.image && p.image.url) || '/api/placeholder/400/400';
    
    const category = p.category || p.categoria || p.type || p.tipo || '';
    const badge = p.badge || p.tag || p.badgeText || p.etiqueta || p.label || '';
    
    let ratingValue = p.ratingAverage || p.rating || p.calificacion || 0;
    if (typeof ratingValue === 'string') ratingValue = parseFloat(ratingValue);
    const ratingAverage = Number.isFinite(ratingValue) ? ratingValue : 0;
    
    // Formateo de precio si no viene
    const priceFormatted = p.priceFormatted || p.precioFormateado || 
      (typeof price === 'number' ? `$${price.toLocaleString()}` : `$${price}`);

    return {
      ...p,
      id,
      name,
      description,
      price,
      priceReference,
      priceFormatted,
      imageUrl,
      category,
      badge,
      ratingAverage
    };
  };

  // --- 2. RESOLUCIÓN DE DATOS (MECANISMO DE SNAPSHOT V2) ---
  const { displayProducts, source } = useMemo(() => {
    let raw: any[] = [];
    let resSource = 'empty';

    // A. Prioridad Global: Snapshot en Content (Publicado)
    if (Array.isArray(content.products) && content.products.length > 0) {
      raw = content.products;
      resSource = 'published_snapshot_content';
    } 
    // B. Prioridad Secundaria: Snapshot en Settings (Hydration fallback)
    else if (Array.isArray(settingsValues[`${moduleId}_el_products_showcase_items_products`]) && settingsValues[`${moduleId}_el_products_showcase_items_products`].length > 0) {
      raw = settingsValues[`${moduleId}_el_products_showcase_items_products`];
      resSource = 'published_snapshot_settings';
    }
    // C. Editor / Preview: Resolución Dinámica
    else {
      const catalog = products.length > 0 ? products : [];
      const selectedIds = settingsValues[`${moduleId}_el_products_showcase_config_select_products`] || [];
      
      if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
        raw = catalog.slice(0, 8);
        resSource = catalog.length > 0 ? 'catalog_default' : 'empty';
      } else {
        const stringIds = selectedIds.map(String);
        raw = catalog.filter(p => stringIds.includes(String(p.id)));
        resSource = 'manual_selection';
      }
    }

    const normalized = raw.map((p, idx) => normalizeProduct(p, idx)).filter(Boolean);
    
    if (window.location.search.includes('debug=products')) {
      console.log('[PRODUCTS_SHOWCASE_V2_NORMALIZE_DEBUG]', {
        inputCount: raw.length,
        outputCount: normalized.length,
        resSource
      });
    }

    return { displayProducts: normalized, source: resSource };
  }, [content.products, settingsValues, moduleId, products]);

  // --- 2. HELPERS ---
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${moduleId}_${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    const val = settingsValues[key];
    
    // SIP v12.1: Soporte para objetos de valor (unwrap)
    if (val !== undefined) {
      return (val && typeof val === 'object' && 'value' in val && !Array.isArray(val)) ? val.value : val;
    }
    return defaultValue;
  };

  // --- 3. CONFIGURACIÓN VISUAL ---
  const title = content.title || content.titulo || content.header_title || getVal(null, 'header_title', (isActuallyEditor ? 'Nuestros Productos' : ''));
  const subtitle = content.subtitle || content.descripcion || content.description || content.summary || getVal(null, 'header_subtitle', '');
  
  // [PRODUCTS_SHOWCASE_HEADER_RESOLUTION_DEBUG] (FASE 6)
  React.useEffect(() => {
    if (window.location.search.includes('debug=products') || window.location.search.includes('debug_render=true')) {
      console.log('[PRODUCTS_SHOWCASE_HEADER_RESOLUTION_DEBUG]', {
        moduleId,
        candidates: {
          contentTitle: content.title,
          contentTitulo: content.titulo,
          contentHeaderTitle: content.header_title,
          prefixedGlobalHeaderTitle: settingsValues?.[`${moduleId}_global_header_title`],
          unprefixedGlobalHeaderTitle: settingsValues?.global_header_title,
          getValHeaderTitle: getVal(null, 'header_title', null)
        },
        finalTitle: title,
        finalSubtitle: subtitle
      });
    }
  }, [moduleId, content, settingsValues, title, subtitle]);
  
  const layout = getVal(null, 'layout', 'grid');
  const columns = parseInt(getVal(null, 'columns', '3'));
  const cardStyle = getVal(null, 'card_style', 'elevated');
  const showTabs = getVal(null, 'show_tabs', true);
  
  const showPrice = getVal(null, 'show_price', true);
  const showDescription = getVal(null, 'show_description', true);
  const showCategory = getVal(null, 'show_category', true);
  const ctaLabel = getVal(null, 'cta_label', 'Ver Producto');

  // --- 4. LOGS DE AUDITORÍA (AUDIT POINT 10) ---
  React.useEffect(() => {
    console.log('[PRODUCTS_SHOWCASE_V2_VIEWER_DEBUG]', {
      currentView: isActuallyEditor ? 'editor' : (isPublishedViewer ? 'published' : 'preview'),
      isPublishedViewer,
      sectionId: moduleId,
      moduleId,
      contentProductsCount: Array.isArray(content.products) ? content.products.length : 0,
      settingsSnapshotCount: Array.isArray(settingsValues[`${moduleId}_el_products_showcase_items_products`]) ? settingsValues[`${moduleId}_el_products_showcase_items_products`].length : 0,
      resolvedProductsCount: displayProducts.length,
      resolvedSource: source,
      willShowEmptyState: displayProducts.length === 0
    });
  }, [moduleId, isPublishedViewer, isActuallyEditor, source, displayProducts, content.products, settingsValues]);

  // --- 4. FILTRADO POR CATEGORÍAS ---
  const categories = useMemo(() => {
    const cats = new Set(displayProducts.map(p => p.category).filter(Boolean));
    return ['Todos', ...Array.from(cats).sort()];
  }, [displayProducts]);

  const filteredProducts = useMemo(() => {
    if (!showTabs || activeTab === 'Todos') return displayProducts;
    return displayProducts.filter(p => p.category === activeTab);
  }, [displayProducts, activeTab, showTabs]);

  // --- 5. RENDER LOGIC ---
  const hasHeader = Boolean(title || subtitle);
  const hasProducts = displayProducts.length > 0;

  // [PRODUCTS_SHOWCASE_MODULE_MOUNT_DEBUG] (FASE 4 & 5)
  React.useEffect(() => {
    if (window.location.search.includes('debug=products') || window.location.search.includes('debug_render=true')) {
      console.log('[PRODUCTS_SHOWCASE_MODULE_MOUNT_DEBUG]', {
        moduleId,
        runtime: isPublishedViewer ? "published_viewer" : "preview_canvas",
        isEditor: isActuallyEditor,
        contentKeys: Object.keys(content),
        settingsKeys: Object.keys(settingsValues).filter(k => k.startsWith(moduleId)),
        titleResolved: !!title,
        subtitleResolved: !!subtitle,
        contentProductsCount: Array.isArray(content.products) ? content.products.length : 0,
        snapshotProductsCount: Array.isArray(settingsValues[`${moduleId}_el_products_showcase_items_products`]) ? settingsValues[`${moduleId}_el_products_showcase_items_products`].length : 0,
        finalProductsCount: displayProducts.length,
        willReturnNull: !hasHeader && !hasProducts && !isActuallyEditor,
        returnNullReason: !hasHeader && !hasProducts && !isActuallyEditor ? "No header and no products" : "None"
      });
    }
  }, [moduleId, isActuallyEditor, isPublishedViewer, content, settingsValues, title, subtitle, hasHeader, hasProducts, displayProducts.length]);

  if (!hasHeader && !hasProducts && !isActuallyEditor) {
    return null;
  }

  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4"
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {displayProducts.length === 0 ? (
        <div className="py-20 px-4 text-center border-2 border-dashed border-slate-200 rounded-3xl">
          {isActuallyEditor ? (
            <>
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800">Módulo de Catálogo Vacío</h3>
              <p className="text-slate-500 mt-2">Usa el panel de "Selección de Productos" para mostrar ítems aquí.</p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-medium text-slate-400">Próximamente nuevos productos disponibles</h3>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Tabs */}
          {showTabs && categories.length > 2 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {categories.map((cat: string) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                    activeTab === cat 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Product Grid */}
          <div className={`grid gap-6 md:gap-8 ${
            columns === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
            columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
            'grid-cols-1 sm:grid-cols-2'
          }`}>
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  layout
                  key={product.id || idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`group flex flex-col h-full overflow-hidden transition-all duration-500 ${
                    cardStyle === 'elevated' ? 'bg-white rounded-[32px] shadow-sm hover:shadow-2xl hover:-translate-y-2' :
                    cardStyle === 'bordered' ? 'bg-white rounded-[32px] border border-slate-100 hover:border-blue-200' :
                    cardStyle === 'glass' ? 'bg-white/40 backdrop-blur-md rounded-[32px] border border-white/20' :
                    'bg-transparent'
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden m-3 rounded-[24px]">
                    <img 
                      src={product.imageUrl || '/api/placeholder/400/400'} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Overlays */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center translate-y-full group-hover:translate-y-0">
                      <div className="flex gap-2">
                        <button className="p-3 bg-white text-slate-900 rounded-full shadow-xl hover:bg-blue-600 hover:text-white transition-colors transform hover:scale-110">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-slate-900 transition-colors transform hover:scale-110">
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Badge/Category */}
                    {(product.badge || (showCategory && product.category)) && (
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.badge && (
                          <span className="px-3 py-1 bg-yellow-400 text-slate-900 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                            {product.badge}
                          </span>
                        )}
                        {showCategory && product.category && (
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-medium rounded-lg shadow-sm">
                            {product.category}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 pt-2 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      {product.ratingAverage && (
                        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-bold text-slate-700">{product.ratingAverage}</span>
                        </div>
                      )}
                    </div>

                    {showDescription && product.description && (
                      <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-slate-50">
                      {showPrice && (
                        <div className="flex flex-col">
                          <span className="text-2xl font-black text-slate-900">
                            {product.priceFormatted || `$${product.price}`}
                          </span>
                        </div>
                      )}
                      
                      <button className="flex items-center gap-2 text-blue-600 font-bold group/btn">
                        <span className="text-sm">{ctaLabel}</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </section>
  );
};
