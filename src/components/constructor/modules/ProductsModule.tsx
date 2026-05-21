import React, { useState, useMemo } from 'react';
import { SectionAnimation } from '../animations/SectionAnimation';
import { normalizeSectionAnimation } from '../../../constants/moduleAnimations';
import { Star, ShoppingCart, Eye, Heart, X, ChevronLeft, ChevronRight, Zap, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../../../types/schema';
import { MOCK_PRODUCTS } from '../../../constants/mockData';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';
import { InlineEditableText } from '../InlineEditableText';
import { useEditorStore } from '../../../store/editorStore';

const toBoolean = (value: unknown) => value === true || value === 'true' || value === 1 || value === '1';

const resolveThemeColor = (
  value: string | undefined,
  lightDefault: string,
  darkDefault: string,
  darkMode: boolean
) => {
  const safeValue = String(value || '').trim();
  const safeLight = String(lightDefault || '').trim().toLowerCase();
  if (!darkMode) return safeValue || lightDefault;
  if (!safeValue || safeValue.toLowerCase() === safeLight) return darkDefault;
  return safeValue;
};

export const ProductsModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any>,
  products?: Product[],
  selectedProductIds?: any[],
  isDevMode?: boolean,
  isPreviewMode?: boolean,
  forceSnapshotRender?: boolean,
  skipEmptyManualFilter?: boolean
}> = ({ 
  moduleId, 
  settingsValues, 
  products, 
  selectedProductIds: propSelectedProductIds, 
  isDevMode = false, 
  isPreviewMode = false,
  forceSnapshotRender = false,
  skipEmptyManualFilter = false
}) => {
  const { selectSection, selectElement } = useEditorStore();
  const [activeTab, setActiveTab] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const gridRef = React.useRef<HTMLDivElement>(null);

  const isInConstructorEnvironment = (
    window.location.search.includes('mode=constructor') || 
    window.location.search.includes('renderMode=editor') ||
    (!!window.name && (window.name.includes('supabase_url') || window.name.includes('projectId'))) ||
    window.location.hostname.includes('localhost') ||
    window.location.hostname.includes('ais-dev-') 
  );

  const isActuallyEditor = (isPreviewMode === true) || (
    (window.location.search.includes('mode=constructor') || window.location.search.includes('renderMode=editor')) &&
    (window.location.hostname.includes('localhost') || window.location.hostname.includes('ais-dev-'))
  );
  const isPublishedViewer = !isActuallyEditor;

  // [FASE 1] Función Única de Resolución Forense para Editor
  const resolveProductsForEditor = (params: {
    moduleId: string,
    selectionMode: string,
    selectedProductIds: any,
    selectionTouched: boolean,
    catalogProducts: Product[],
    snapshotProducts: Product[],
    injectedProducts: Product[],
    isEditor: boolean,
    forceSnapshotRender?: boolean
  }) => {
    const { moduleId, selectionMode, selectedProductIds, selectionTouched, catalogProducts, snapshotProducts, injectedProducts, isEditor, forceSnapshotRender = false } = params;
    
    let results: Product[] = [];
    let sourceUsed = 'empty';
    let reason = 'initialization';
    const ignoredSources: string[] = [];

    // [FASE 2] RESOLUCIÓN EN VIVO / PÁGINA PUBLICADA
    if (!isEditor || forceSnapshotRender) {
      if (snapshotProducts.length > 0) {
        results = snapshotProducts;
        sourceUsed = 'published_snapshot_settings';
        reason = 'Priority snapshot found in settings';
      } else if (injectedProducts.length > 0) {
        results = injectedProducts;
        sourceUsed = 'published_prop_products';
        reason = 'Snapshot found in products prop';
      } else if (forceSnapshotRender) {
        results = [];
        sourceUsed = 'force_snapshot_empty';
        reason = 'Force snapshot requested but no data found';
      } else {
        results = [];
        sourceUsed = 'published_no_data';
        reason = 'No snapshot found in live view';
      }

      console.log('[PRODUCTS_LEGACY_VIEWER_RESOLUTION_FORENSIC_DEBUG]', {
        moduleId,
        runtime: "published_viewer",
        snapshotProductsCount: snapshotProducts.length,
        injectedProductsCount: injectedProducts.length,
        finalProductsCount: results.length,
        finalProductIds: results.map(p => p.id),
        sourceUsed,
        reason
      });

      return results;
    }

    if (isEditor) {
      if (selectionMode === 'manual') {
        const selectedIdsArray = Array.isArray(selectedProductIds) ? selectedProductIds : [];
        const isExplicitlyEmpty = (selectedIdsArray.length === 0 && (selectedProductIds !== undefined && selectedProductIds !== null)) || (selectionTouched && selectedIdsArray.length === 0);

        if (isExplicitlyEmpty) {
          results = [];
          sourceUsed = 'manual_selection_empty_explicit';
          reason = 'User explicitly deselected everything';
          ignoredSources.push('snapshot', 'catalog_full', 'content.products');
        } else if (selectedIdsArray.length > 0) {
          const searchIds = selectedIdsArray.map(id => String(id));
          results = catalogProducts.filter(p => searchIds.includes(String(p.id)));
          sourceUsed = 'manual_selection_filtered';
          reason = `Filtered ${results.length} products from catalog of ${catalogProducts.length}`;
          ignoredSources.push('snapshot');
        } else {
          // Case where selectedProductIds is null/undefined AND not touched (initial state)
          results = catalogProducts;
          sourceUsed = 'manual_selection_all_default';
          reason = 'No selection defined yet, showing all';
        }
      } else {
        // Auto mode in editor
        results = catalogProducts;
        sourceUsed = 'catalog_auto_editor';
      }
    }

    console.log('[PRODUCTS_EDITOR_EMPTY_SELECTION_RULE_DEBUG]', {
      moduleId,
      isEditorRuntime: isEditor,
      selectionMode,
      selectionTouched,
      selectedProductIds,
      selectedProductIdsCount: Array.isArray(selectedProductIds) ? selectedProductIds.length : (selectedProductIds ? 1 : 0),
      catalogProductsCount: catalogProducts.length,
      finalProductsCount: results.length,
      sourceUsed,
      fallbackBlocked: true,
      timestamp: Date.now()
    });

    console.log('[PRODUCTS_EDITOR_RESOLUTION_FORENSIC_DEBUG]', {
      moduleId,
      runtime: isEditor ? "constructor_canvas" : "viewer",
      selectionMode,
      selectedProductIds,
      selectionTouched,
      selectedProductIdsCount: Array.isArray(selectedProductIds) ? selectedProductIds.length : 0,
      catalogProductsCount: catalogProducts.length,
      catalogProductIds: catalogProducts.map(p => p.id),
      snapshotProductsCount: snapshotProducts.length,
      finalRenderedProductsCount: results.length,
      finalRenderedProductIds: results.map(p => p.id),
      finalRenderedProductNames: results.map(p => p.name),
      sourceUsed,
      ignoredSources,
      reason
    });

    return results;
  };

  // [PRODUCTS_MODE_DETECTION_DEBUG] Diagnóstico de Modo
  if (isActuallyEditor || isPublishedViewer) {
    console.log('[PRODUCTS_MODE_DETECTION_DEBUG]', {
      moduleId,
      isPreviewMode,
      isActuallyEditor,
      isPublishedViewer,
      windowName: window.name,
      search: window.location.search,
      hostname: window.location.hostname,
      timestamp: Date.now()
    });
  }

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };


  const parseF = (val: any, fallback: number) => {
    const f = parseFloat(val);
    return isNaN(f) ? fallback : f;
  };

  // Element: Textos
  const sectionTitle = getVal(`${moduleId}_el_products_header`, 'title', 'Nuestros Productos');
  const sectionDesc = getVal(`${moduleId}_el_products_header`, 'subtitle', 'Descubre nuestra selección exclusiva de productos.');
  const titleSize = getVal(`${moduleId}_el_products_header`, 'title_size', 't2');
  const titleWeight = getVal(`${moduleId}_el_products_header`, 'title_weight', 'black');
  const subtitleSize = getVal(`${moduleId}_el_products_header`, 'subtitle_size', 'p');
  const subtitleWeight = getVal(`${moduleId}_el_products_header`, 'subtitle_weight', 'normal');
  const titleAlign = getVal(`${moduleId}_el_products_header`, 'align', 'center');

  const titleHighlightType = getVal(`${moduleId}_el_products_header`, 'title_highlight_type', 'gradient');
  const titleHighlightColor = getVal(`${moduleId}_el_products_header`, 'title_highlight_color', '#3B82F6');
  const titleHighlightGradient = getVal(`${moduleId}_el_products_header`, 'title_highlight_gradient', 'linear-gradient(to right, #3B82F6, #2563EB)');
  const titleHighlightBold = getVal(`${moduleId}_el_products_header`, 'title_highlight_bold', true);

  const subtitleHighlightType = getVal(`${moduleId}_el_products_header`, 'subtitle_highlight_type', 'none');
  const subtitleHighlightColor = getVal(`${moduleId}_el_products_header`, 'subtitle_highlight_color', '#3B82F6');
  const subtitleHighlightGradient = getVal(`${moduleId}_el_products_header`, 'subtitle_highlight_gradient', 'linear-gradient(to right, #3B82F6, #2563EB)');
  const subtitleHighlightBold = getVal(`${moduleId}_el_products_header`, 'subtitle_highlight_bold', true);

  // Element: Configuración de Selección
  const selectedProductIdsFromSettings = getVal(`${moduleId}_el_products_config`, 'select_products', []);
  const selectedProductIds = propSelectedProductIds !== undefined ? propSelectedProductIds : selectedProductIdsFromSettings;
  const selectionTouched = getVal(`${moduleId}_el_products_config`, 'selection_touched', false);
  const showTabs = getVal(`${moduleId}_el_products_config`, 'show_tabs', true);

  // Element: Configuración de Selección
  const selectionMode = getVal(`${moduleId}_el_products_config`, 'selection_mode', 'manual');
  const layout = getVal(null, 'layout', 'grid');
  const columns = Math.max(1, parseInt(getVal(null, 'columns', 4)) || 4);
  const gap = parseF(getVal(null, 'gap', 24), 24);
  const darkMode = toBoolean(getVal(null, 'dark_mode', false));
  const rawBgColor = getVal(null, 'bg_color', '#FFFFFF');
  const bgColor = resolveThemeColor(rawBgColor, '#FFFFFF', '#0F172A', darkMode);
  const sectionGradient = getVal(null, 'section_gradient', false);
  const bgGradient = getVal(null, 'bg_gradient', 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)');
  const legacyEntranceAnim = getVal(null, 'entrance_anim', 'none');
  const globalThemeSectionAnimation = settingsValues['global_theme_section_animation'];
  const globalThemeSectionAnimationSpeed = parseF(settingsValues['global_theme_section_animation_speed'], 1);
  const moduleSectionAnimation = getVal(null, 'section_animation', undefined);
  const sectionAnimation = normalizeSectionAnimation(
    globalThemeSectionAnimation ?? moduleSectionAnimation ?? legacyEntranceAnim,
    'fade-up'
  );
  const entranceAnim = 'none';
  const headerTitleColor = resolveThemeColor(undefined, '#0F172A', '#FFFFFF', darkMode);
  const headerSubtitleColor = resolveThemeColor(undefined, '#64748B', '#94A3B8', darkMode);

  // [SIP v12.9] Hooks must be at the top level
  const allDisplayProducts = useMemo(() => {
    const snapshotKey = `${moduleId}_el_products_items_products`;
    const snapshotFromSettings = settingsValues[snapshotKey];
    const snapshotProducts = Array.isArray(snapshotFromSettings) ? snapshotFromSettings : [];
    
    const catalog = (products && products.length > 0) ? products : (isDevMode ? MOCK_PRODUCTS : []);
    
    // USAR RESOLUTOR FORENSE UNIFICADO
    return resolveProductsForEditor({
      moduleId,
      selectionMode,
      selectedProductIds,
      selectionTouched,
      catalogProducts: catalog,
      snapshotProducts,
      injectedProducts: products || [],
      isEditor: isActuallyEditor,
      forceSnapshotRender
    });
  }, [products, selectedProductIds, selectionTouched, selectionMode, isDevMode, isPreviewMode, isActuallyEditor, isPublishedViewer, moduleId, settingsValues]);

  const categories = useMemo(() => {
    const cats = new Set(allDisplayProducts.map(p => p.category).filter(Boolean));
    const sortedCats = Array.from(cats).sort();
    return ['Todos', ...sortedCats];
  }, [allDisplayProducts]);

  const filteredProducts = useMemo(() => {
    if (activeTab === 'Todos') return allDisplayProducts;
    return allDisplayProducts.filter(p => p.category === activeTab);
  }, [allDisplayProducts, activeTab]);

  React.useEffect(() => {
    if (!categories.includes(activeTab)) {
      setActiveTab('Todos');
    }
  }, [categories, activeTab]);

  React.useEffect(() => {
    if (selectionMode === 'manual') {
      setActiveTab('Todos');
    }
  }, [selectedProductIds, selectionMode]);

  React.useEffect(() => {
    if ((isPublishedViewer || window.location.search.includes('debug=products')) && gridRef.current) {
      const el = gridRef.current;
      const computedStyle = window.getComputedStyle(el);
      console.log('[PRODUCTS_GRID_LAYOUT_DEBUG]', {
        moduleId,
        cardsCount: filteredProducts.length,
        gridOffsetWidth: el.offsetWidth,
        gridOffsetHeight: el.offsetHeight,
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        className: el.className,
        parentOffsetWidth: el.parentElement?.offsetWidth,
        parentOffsetHeight: el.parentElement?.offsetHeight,
        timestamp: Date.now()
      });
    }
  }, [filteredProducts, isPublishedViewer, isActuallyEditor]); // Added deps to be safe


  // Animation Overrides
  const globalAnimOverride = null;
  const enableQuickview = getVal(null, 'enable_quickview', true);
  const showPagination = getVal(null, 'show_pagination', true);
  const showUrgency = getVal(null, 'show_urgency', false);
  const showStockBar = getVal(null, 'show_stock_bar', false);

  // Element Settings
  const imgBorderRadius = parseF(getVal(`${moduleId}_el_img`, 'border_radius', 16), 16);
  const imgAspectRatio = getVal(`${moduleId}_el_img`, 'aspect_ratio', '1:1');
  const hoverSwap = getVal(`${moduleId}_el_img`, 'hover_swap', true);
  const imgHoverEffect = getVal(`${moduleId}_el_img`, 'hover_effect', 'zoom');
  const badgeColor = getVal(`${moduleId}_el_img`, 'badge_color', '#3B82F6');
  
  const cardStyle = getVal(`${moduleId}_el_product_card`, 'card_style', 'solid');
  const rawCardBg = getVal(`${moduleId}_el_product_card`, 'card_bg', '#FFFFFF');
  const cardBg = resolveThemeColor(rawCardBg, '#FFFFFF', '#1E293B', darkMode);
  const cardShadow = getVal(`${moduleId}_el_product_card`, 'card_shadow', 'sm');
  const cardHoverLift = getVal(`${moduleId}_el_product_card`, 'hover_lift', true);
  const cardBorderColor = resolveThemeColor(undefined, '#E2E8F0', '#334155', darkMode);

  // Product Title Settings
  const productTitleSize = getVal(`${moduleId}_el_title`, 'font_size', 'p');
  const productTitleWeight = getVal(`${moduleId}_el_title`, 'font_weight', 'bold');
  const productTitleAlign = getVal(`${moduleId}_el_title`, 'text_align', 'left');
  const rawTitleColor = getVal(`${moduleId}_el_title`, 'title_color', '#0F172A');
  const titleColor = resolveThemeColor(rawTitleColor, '#0F172A', '#FFFFFF', darkMode);
  
  const currency = getVal(`${moduleId}_el_price`, 'currency', '$');
  const priceSize = getVal(`${moduleId}_el_price`, 'price_size', 't3');
  const priceWeight = getVal(`${moduleId}_el_price`, 'price_weight', 'bold');
  const priceAlign = getVal(`${moduleId}_el_price`, 'price_align', 'left');
  const showSavings = getVal(`${moduleId}_el_price`, 'show_savings', true);
  const rawPriceColorSetting = getVal(`${moduleId}_el_price`, 'price_color', '#0F172A');
  const priceColorSetting = resolveThemeColor(rawPriceColorSetting, '#0F172A', '#FFFFFF', darkMode);
  const saleColorSetting = getVal(`${moduleId}_el_price`, 'sale_color', '#EF4444');

  const ctaText = getVal(`${moduleId}_el_cta`, 'cta_text', 'Añadir');
  const showCtaIcon = getVal(`${moduleId}_el_cta`, 'show_icon', true);
  const ctaBg = getVal(`${moduleId}_el_cta`, 'cta_bg', '#0F172A');
  const ctaColor = getVal(`${moduleId}_el_cta`, 'cta_color', '#FFFFFF');
  const ctaRadius = parseF(getVal(`${moduleId}_el_cta`, 'cta_radius', 12), 12);
  const ctaHoverBg = getVal(`${moduleId}_el_cta`, 'cta_hover_bg', '#2563EB');

  console.log('[PRODUCTS_MODULE_RENDER_INPUT_DEBUG]', {
    runtime: isPublishedViewer ? "published_viewer" : "constructor_canvas",
    moduleId,
    selectionMode,
    selectedIdsReceived: selectedProductIds,
    selectedIdsCount: Array.isArray(selectedProductIds) ? selectedProductIds.length : 0,
    productsPropCount: products?.length || 0,
    catalogProductsCount: (products && products.length > 0) ? products.length : (isDevMode ? MOCK_PRODUCTS.length : 0),
    snapshotProductsCount: Array.isArray(settingsValues[`${moduleId}_el_products_items_products`]) ? settingsValues[`${moduleId}_el_products_items_products`].length : 0,
    isPreviewMode,
    isActuallyEditor,
    timestamp: Date.now()
  });



  // [PRODUCTS_LEGACY_VIEWER_FINAL_RENDER_DEBUG] (FASE 6)
  if (isPublishedViewer || window.location.search.includes('debug=products')) {
    console.log('[PRODUCTS_LEGACY_VIEWER_FINAL_RENDER_DEBUG]', {
      runtime: isPublishedViewer ? "published_viewer" : "constructor_editor",
      moduleId,
      isActuallyEditor,
      isPreviewMode,
      productsPropCount: products?.length || 0,
      propSelectedIdsCount: propSelectedProductIds?.length || 0,
      finalRenderedProductsCount: filteredProducts.length,
      sourceUsed: 'allDisplayProducts_resolver',
      willShowEditorEmptyState: isActuallyEditor && filteredProducts.length === 0,
      timestamp: Date.now()
    });

    // [PRODUCTS_CARD_RENDER_DATA_DEBUG] (FASE 1)
    console.log('[PRODUCTS_CARD_RENDER_DATA_DEBUG]', {
      moduleId,
      finalRenderedProductsCount: filteredProducts.length,
      products: filteredProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
        category: p.category
      }))
    });

    // [PRODUCTS_JSX_SOURCE_DEBUG] (FASE 3)
    console.log('[PRODUCTS_JSX_SOURCE_DEBUG]', {
      moduleId,
      finalRenderedProductsCount: filteredProducts.length,
      jsxProductsVariableName: 'filteredProducts',
      jsxProductsCount: filteredProducts.length,
      jsxProductIds: filteredProducts.map(p => p.id)
    });
  }


  const totalPages = columns > 0 ? Math.ceil(filteredProducts.length / columns) : 1;

  const handleAddToCart = (productId: string) => {
    setAddingToCart(productId);
    setTimeout(() => setAddingToCart(null), 2000);
  };

  const navigateQuickView = (direction: 'prev' | 'next') => {
    if (!selectedProduct) return;
    const currentIndex = filteredProducts.findIndex(p => p.id === selectedProduct.id);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex < 0) nextIndex = filteredProducts.length - 1;
    if (nextIndex >= filteredProducts.length) nextIndex = 0;
    
    setSelectedProduct(filteredProducts[nextIndex]);
  };

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

  const getTypographyStyle = (sizeToken: string, weightToken: string, alignToken?: string) => {
    const size = TYPOGRAPHY_SCALE[sizeToken as keyof typeof TYPOGRAPHY_SCALE] || TYPOGRAPHY_SCALE.p;
    const weight = FONT_WEIGHTS[weightToken as keyof typeof FONT_WEIGHTS] || FONT_WEIGHTS.normal;
    return {
      fontSize: `${size.fontSize}px`,
      lineHeight: size.lineHeight,
      fontWeight: weight.value,
      textAlign: (alignToken && alignToken !== 'inherit') ? alignToken : undefined
    } as React.CSSProperties;
  };

  if ((!products || products.length === 0) && !isActuallyEditor) {
    return null;
  }

  return (
    <SectionAnimation animation={sectionAnimation} speed={globalThemeSectionAnimationSpeed}>
      <section 
        id={moduleId}
        className={`py-12 @md:py-20 @lg:py-24 px-8 w-full transition-colors duration-300 relative ${darkMode ? 'bg-slate-900' : ''}`}
        onClick={(e) => {
          if (isPreviewMode) return;
          e.stopPropagation();
          selectSection(moduleId);
          selectElement(`${moduleId}_global`);
        }}
        style={{ 
          backgroundColor: bgColor,
          backgroundImage: (sectionGradient && typeof bgGradient === 'string' && !bgGradient.includes('NaN')) ? bgGradient : 'none'
        }}
      >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div 
          className={`flex flex-col mb-12 w-full ${titleAlign === 'center' ? 'items-center text-center' : titleAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
        >
          <h2 
            className="mb-4"
            style={{ ...getTypographyStyle(titleSize, titleWeight), color: headerTitleColor }}
          >
            <InlineEditableText
              moduleId={moduleId}
              elementId={`${moduleId}_el_products_header`}
              settingId="title"
              value={sectionTitle}
              isPreviewMode={isPreviewMode}
            >
              <TextRenderer 
                text={sectionTitle}
                highlightType={titleHighlightType}
                highlightColor={titleHighlightColor}
                highlightGradient={titleHighlightGradient}
                highlightBold={titleHighlightBold}
              />
            </InlineEditableText>
          </h2>
          <div className="w-20 h-1.5 bg-primary rounded-full mb-6"></div>
          {sectionDesc && (
            <p 
              className="max-w-2xl"
              style={{ ...getTypographyStyle(subtitleSize, subtitleWeight), color: headerSubtitleColor }}
            >
              <InlineEditableText
                moduleId={moduleId}
                elementId={`${moduleId}_el_products_header`}
                settingId="subtitle"
                value={sectionDesc}
                isPreviewMode={isPreviewMode}
              >
                <TextRenderer 
                  text={sectionDesc}
                  highlightType={subtitleHighlightType}
                  highlightColor={subtitleHighlightColor}
                  highlightGradient={subtitleHighlightGradient}
                  highlightBold={subtitleHighlightBold}
                />
              </InlineEditableText>
            </p>
          )}
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
            <div className="overflow-hidden">
              <motion.div 
                ref={gridRef}
                animate={{ x: layout === 'carousel' ? `-${(parseFloat(carouselIndex as any) || 0) * 100}%` : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`grid ${
                  layout === 'carousel' ? 'flex transition-none' :
                  layout === 'list' ? 'grid-cols-1' :
                  columns === 6 ? 'grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-6' :
                  columns === 4 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4' :
                  columns === 3 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3' :
                  columns === 2 ? 'grid-cols-1 @sm:grid-cols-2' : 'grid-cols-1'
                }`}
                style={{ 
                  gap: layout === 'carousel' ? '0' : `${gap || 0}px`,
                  display: layout === 'carousel' ? 'flex' : 'grid'
                }}
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, idx) => {
                    const hasSale = product.priceReference && product.priceReference > (product.price || 0);
                    const savings = hasSale ? Math.round(((product.priceReference! - product.price!) / product.priceReference!) * 100) : 0;
                    const isAdding = addingToCart === product.id;

                    if (isPublishedViewer || window.location.search.includes('debug=products')) {
                      console.log('[PRODUCTS_CARD_RENDER_ITEM_DEBUG]', {
                        index: idx,
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.imageUrl,
                        willRenderCard: true,
                        timestamp: Date.now()
                      });
                    }

                    return (
                      <motion.div 
                        key={product.id + idx}
                        layout
                        initial={(globalAnimOverride ? globalAnimOverride.hidden : (entranceAnim !== 'none' ? { opacity: 0, y: 20 } : false)) as any}
                        animate={(globalAnimOverride ? globalAnimOverride.visible : (entranceAnim !== 'none' ? { opacity: 1, y: 0 } : false)) as any}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`group flex flex-col transition-all duration-500 min-h-[400px] ${
                          layout === 'list' ? 'flex-row gap-8 items-center' : 
                          layout === 'carousel' ? `w-full shrink-0` : ''
                        } ${cardHoverLift ? 'hover:-translate-y-2' : ''}`}
                        style={{
                          backgroundColor: cardStyle === 'glass' ? 'rgba(255,255,255,0.05)' : cardStyle === 'minimal' ? 'transparent' : cardBg,
                          backdropFilter: cardStyle === 'glass' ? 'blur(12px)' : 'none',
                          borderRadius: `${parseFloat(imgBorderRadius as any) || 0}px`,
                          padding: cardStyle === 'minimal' ? '0' : '16px',
                          margin: layout === 'carousel' ? `0 ${gap/2}px` : '0',
                          boxShadow: cardStyle === 'minimal' ? 'none' : getShadow(cardShadow),
                          borderWidth: cardStyle === 'bordered' ? '1px' : '0px',
                          borderStyle: 'solid',
                          borderColor: cardBorderColor,
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
                              <span className="text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg" style={{ backgroundColor: badgeColor }}>
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
                            className="line-clamp-2 mb-2"
                            style={{ 
                              ...getTypographyStyle(productTitleSize as any, productTitleWeight, productTitleAlign),
                              color: titleColor
                            }}
                          >
                            {product.name}
                          </h3>

                          {/* Urgency & Stock Bar */}
                          {(showUrgency || showStockBar) && (
                            <div className="mb-4">
                              {showUrgency && (parseFloat(product.stock as any) || 0) < 10 && (
                                <div className="flex items-center justify-center gap-1 mb-2 text-rose-500 text-[10px] font-bold uppercase animate-pulse">
                                  <Zap size={10} fill="currentColor" />
                                  ¡Solo quedan {product.stock} unidades!
                                </div>
                              )}
                              {showStockBar && (
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${Math.min(100, (parseFloat(product.stock as any) || 0) * 5)}%` }}
                                    className={`h-full ${(parseFloat(product.stock as any) || 0) < 10 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                  />
                                </div>
                              )}
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
                                style={{ 
                                  ...getTypographyStyle(priceSize as any, priceWeight, priceAlign),
                                  color: hasSale ? saleColorSetting : priceColorSetting 
                                }}
                              >
                                {currency}{(product.price || 0).toFixed(2)}
                              </span>
                            </div>
                            <button 
                              onClick={() => handleAddToCart(product.id)}
                              disabled={isAdding}
                              className={`px-4 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg text-[10px] font-bold uppercase tracking-widest gap-2 relative overflow-hidden`}
                              style={{ 
                                backgroundColor: isAdding ? '#10B981' : ctaBg, 
                                color: ctaColor,
                                borderRadius: `${ctaRadius}px`
                              }}
                            >
                              <AnimatePresence mode="wait">
                                {isAdding ? (
                                  <motion.div key="check" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }} className="flex items-center gap-2">
                                    <Check size={14} />
                                    ¡Listo!
                                  </motion.div>
                                ) : (
                                  <motion.div key="cart" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }} className="flex items-center gap-2">
                                    {showCtaIcon && <ShoppingCart size={14} />}
                                    {ctaText}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>

            {layout === 'carousel' && filteredProducts.length > columns && (
              <>
                <button 
                  onClick={() => setCarouselIndex(prev => Math.max(0, prev - 1))}
                  className={`absolute left-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all z-10 ${carouselIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setCarouselIndex(prev => Math.min(totalPages - 1, prev + 1))}
                  className={`absolute right-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all z-10 ${carouselIndex === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ChevronRight size={24} />
                </button>
                
                {showPagination && (
                  <div className="flex justify-center gap-2 mt-8">
                    {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => setCarouselIndex(i)}
                        className={`h-2 rounded-full transition-all ${carouselIndex === i ? 'w-8 bg-primary' : 'w-2 bg-slate-200'}`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          isActuallyEditor ? (
            <div className={`py-20 text-center border-2 border-dashed rounded-3xl ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'}`}>
              <ShoppingCart className="text-slate-300 w-12 h-12 mx-auto mb-4" />
              <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>No hay productos seleccionados</h3>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Selecciona productos en el panel de configuración para mostrarlos aquí.
              </p>
            </div>
          ) : (
            <div className={`py-20 text-center rounded-3xl ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50/50'}`}>
               <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                No hay productos disponibles por el momento.
              </p>
            </div>
          )
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
              className={`relative w-full max-w-4xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row ${darkMode ? 'bg-slate-900' : 'bg-white'}`}
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all z-20 ${darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <X size={20} />
              </button>
              
              <div className="w-full md:w-1/2 aspect-square relative group">
                <img 
                  src={selectedProduct.imageUrl || 'https://picsum.photos/seed/prod/800/800'} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-y-0 left-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => navigateQuickView('prev')} className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all">
                    <ChevronLeft size={20} />
                  </button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => navigateQuickView('next')} className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 p-8 md:p-12 flex flex-col">
                <span className="text-primary font-bold uppercase tracking-widest text-xs mb-2">{selectedProduct.category}</span>
                <h3 className={`text-3xl font-black mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedProduct.name}</h3>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < Math.floor(selectedProduct.ratingAverage || 0) ? "#FBBF24" : "none"} className={i < Math.floor(selectedProduct.ratingAverage || 0) ? 'text-amber-400' : (darkMode ? 'text-slate-700' : 'text-slate-200')} />
                    ))}
                  </div>
                  <span className="text-sm text-slate-400 font-bold">{selectedProduct.reviewCount} reseñas</span>
                </div>

                <div className={`text-4xl font-black mb-8 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {currency}{selectedProduct.price?.toFixed(2)}
                  {selectedProduct.priceReference && (
                    <span className="text-lg text-slate-400 line-through ml-3 font-medium">
                      {currency}{selectedProduct.priceReference.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className={`leading-relaxed mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {selectedProduct.description || "Este producto de alta calidad ha sido diseñado pensando en la durabilidad y el rendimiento excepcional. Perfecto para quienes buscan lo mejor en su categoría."}
                </p>

                <div className="mt-auto flex gap-4">
                  <button 
                    onClick={() => handleAddToCart(selectedProduct.id)}
                    disabled={addingToCart === selectedProduct.id}
                    className={`flex-1 h-14 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 ${addingToCart === selectedProduct.id ? 'bg-emerald-500' : 'bg-primary hover:bg-blue-700'} text-white`}
                  >
                    {addingToCart === selectedProduct.id ? <Check size={20} /> : <ShoppingCart size={20} />}
                    {addingToCart === selectedProduct.id ? '¡Añadido!' : 'Añadir al Carrito'}
                  </button>
                  <button className={`w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                    <Heart size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </section>
    </SectionAnimation>
  );
};
