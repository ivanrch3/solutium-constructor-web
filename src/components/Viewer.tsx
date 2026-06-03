import React, { useEffect, useState } from 'react';
import { PublishedSite } from '../types/schema';
import { HeroModule } from './constructor/modules/HeroModule';
import { Hero2Module } from './constructor/modules/Hero2Module';
import { FeaturesModule } from './constructor/modules/FeaturesModule';
import { AboutModule } from './constructor/modules/AboutModule';
import { ProductsShowcaseModule } from './constructor/modules/ProductsShowcaseModule';
import { ProcessModule } from './constructor/modules/ProcessModule';
import { GalleryModule } from './constructor/modules/GalleryModule';
import { TestimonialsModule } from './constructor/modules/TestimonialsModule';
import { StatsModule } from './constructor/modules/StatsModule';
import { TeamModule } from './constructor/modules/TeamModule';
import { PricingModule } from './constructor/modules/PricingModule';
import { FAQModule } from './constructor/modules/FAQModule';
import { ContactModule } from './constructor/modules/ContactModule';
import { ProductsModule } from './constructor/modules/ProductsModule';
import { ClientsModule } from './constructor/modules/ClientsModule';
import { TrustedLogosModule } from './constructor/modules/TrustedLogosModule';
import { CTAModule } from './constructor/modules/CTAModule';
import { DynamicCardsModule } from './constructor/modules/DynamicCardsModule';
import { HeaderModule } from './constructor/modules/HeaderModule';
import { FooterModule } from './constructor/modules/FooterModule';
import { NewsletterModule } from './constructor/modules/NewsletterModule';
import { VideoModule } from './constructor/modules/VideoModule';
import { SpacerModule } from './constructor/modules/SpacerModule';
import { MenuModule } from './constructor/modules/MenuModule';
import { BentoModule } from './constructor/modules/BentoModule';
import { ComparisonModule } from './constructor/modules/ComparisonModule';
import { CompositionSectionModule } from './constructor/modules/CompositionSectionModule';
import { AlertCircle } from 'lucide-react';
import { logDebug } from '../utils/debug';
import { bridgeModuleContent } from '../utils/hydrationBridge';
import { getProducts } from '../services/dataService';
import { Customer, Product, TrustedCompanyLogo } from '../types/schema';
import { buildAutomaticMenuItems, resolveMenuMode } from '../utils/menuNavigation';
import { buildProjectThemeCssVariables, normalizeProjectBrandColors } from '../utils/projectTheme';

interface ViewerProps {
  site: PublishedSite;
  onBack?: () => void;
  catalogProducts?: Product[];
  catalogCustomers?: Customer[];
  trustedCompanyLogos?: TrustedCompanyLogo[];
  useSecureCatalogContext?: boolean;
}

export const Viewer: React.FC<ViewerProps> = ({
  site,
  onBack,
  catalogProducts: secureCatalogProducts = [],
  catalogCustomers: secureCatalogCustomers = [],
  trustedCompanyLogos: secureTrustedCompanyLogos = [],
  useSecureCatalogContext = false
}) => {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(secureCatalogProducts);
  const queryParams = new URLSearchParams(window.location.search);
  const effectiveProjectId = site.projectId || (site as any).project_id || (site as any).satellite_id;
  
  // [SIP v12.5] Robust Editor Detection
  const isConstructorMode = (
    (queryParams.get('mode') === 'constructor' || queryParams.get('renderMode') === 'editor') ||
    (!!window.name && window.name.includes('supabase_url') && window.name.includes('session_token')) ||
    (window.location.hostname.includes('localhost') && !queryParams.get('siteId'))
  );
  
  const isPublishedViewer = !isConstructorMode && !!site.siteId;

  useEffect(() => {
    (window as any).__SOLUTIUM_READ_ONLY_RENDER__ = true;

    return () => {
      try {
        delete (window as any).__SOLUTIUM_READ_ONLY_RENDER__;
      } catch {
        (window as any).__SOLUTIUM_READ_ONLY_RENDER__ = false;
      }
    };
  }, []);

  useEffect(() => {
    // [SATELLITE_PRODUCTS_PAYLOAD_RECEIVE_DEBUG] (FASE 3)
    const isDebug = window.location.search.includes('debug=products');
    if (isDebug || window.location.search.includes('debug_render=true')) {
      const sections = extractSections(site.content);
      const prodSec = sections.find((s: any) => (s.type || s.tipo) === 'products');

      logDebug('[SATELLITE_PRODUCTS_PAYLOAD_RECEIVE_DEBUG]', {
        messageType: 'HANDSHAKE_HYDRATION',
        origin: window.location.origin,
        sectionsCount: sections.length,
        productsSectionFound: !!prodSec,
        sectionId: prodSec?.id,
        moduleId: prodSec?.id,
        type: prodSec?.type || prodSec?.tipo,
        contentProductsCount: prodSec?.content?.products?.length || prodSec?.content?.productos?.length || 0,
        settingsSnapshotCount: prodSec?.settings?.[`${prodSec?.id}_el_products_items_products`]?.length || 0,
        selectedIdsCount: prodSec?.settings?.[`${prodSec?.id}_el_products_config_select_products`]?.length || 0,
        firstProductName: prodSec?.content?.products?.[0]?.name || prodSec?.content?.productos?.[0]?.name,
        timestamp: new Date().toISOString()
      });
    }

    // [PUBLISHED_SITE_CONTRACT_LOAD_DEBUG] (FASE 3)
    if (window.location.search.includes('debug=products') || window.location.search.includes('debug_render=true')) {
      logDebug('[PUBLISHED_SITE_CONTRACT_LOAD_DEBUG]', {
        siteId: site.siteId || (site as any).id,
        projectId: effectiveProjectId,
        hasContent: !!site.content,
        contentType: typeof site.content,
        contentKeys: site.content ? Object.keys(site.content) : [],
        sectionsCount: (site.content as any)?.sections?.length || (site.content as any)?.pages?.[0]?.sections?.length || 0,
        rawContentPreview: site.content ? JSON.stringify(site.content).substring(0, 200) : 'none'
      });
    }

    // [PRODUCTS_LIVE_RUNTIME_DEBUG] (Fase 1)
    logDebug('[PRODUCTS_LIVE_RUNTIME_DEBUG]', {
      siteId: site.siteId,
      projectId: effectiveProjectId,
      isConstructorMode,
      windowNamePreview: window.name ? window.name.substring(0, 50) : 'empty',
      hasContractContent: !!site.content,
      sectionsCount: (site.content as any)?.sections?.length || 0,
      timestamp: new Date().toISOString()
    });

    if (useSecureCatalogContext) {
      setCatalogProducts(Array.isArray(secureCatalogProducts) ? secureCatalogProducts : []);
      logDebug('[VIEWER_SECURE_CATALOG_CONTEXT_APPLIED]', {
        productsCount: secureCatalogProducts?.length || 0
      });
      return;
    }

    if (effectiveProjectId) {
      logDebug('[VIEWER_DB_FETCH] Buscando productos del catálogo del proyecto:', effectiveProjectId);
      getProducts(0, 100, effectiveProjectId).then(products => {
        logDebug(`[VIEWER_DB_FETCH] ${products?.length || 0} productos cargados desde la DB.`);
        setCatalogProducts(products || []);
      }).catch(err => {
        console.warn('[VIEWER_DB_FETCH] Error cargando catálogo:', err);
      });
    }
  }, [effectiveProjectId, isConstructorMode, secureCatalogProducts, useSecureCatalogContext]);

  // SIP v5.0: Respect the Master Switch
  if (site.isActive === false) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-surface p-12 rounded-3xl shadow-xl border border-border max-w-md w-full flex flex-col items-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-text mb-4">Sitio deshabilitado</h1>
          <p className="text-text/60 mb-8 leading-relaxed">
            Este sitio ha sido deshabilitado por el administrador. Por favor, contacta con soporte si crees que esto es un error.
          </p>
          {onBack && (
            <button 
              onClick={onBack}
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
            >
              Volver al Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  const { content } = site;
  
  // SIP v5.5 (Protocolo 10.2) - Integrity Check
  const extractSections = (c: any) => {
    if (Array.isArray(c?.sections)) return c.sections;
    if (Array.isArray((c as any)?.pages?.[0]?.sections)) return (c as any).pages[0].sections;
    if (Array.isArray((c as any)?.content?.sections)) return (c as any).content.sections;
    if (Array.isArray(c)) return c;
    return [];
  };

  const sections = extractSections(content);
  const theme = content?.theme || (content as any)?.pages?.[0]?.theme || { primaryColor: '#3B82F6', fontFamily: 'sans-serif' };
  const resolvedTheme = normalizeProjectBrandColors(theme);
  const aggregatedSectionSettings = React.useMemo(
    () =>
      sections.reduce((acc, section: any) => {
        const moduleId = section?.id;
        const settings = section?.settings || {};
        if (!moduleId) {
          return acc;
        }

        Object.entries(settings).forEach(([key, value]) => {
          if (key.startsWith(moduleId)) {
            acc[key] = value;
          } else {
            acc[`${moduleId}_${key}`] = value;
          }
        });

        return acc;
      }, {} as Record<string, any>),
    [sections]
  );
  const automaticMenuItems = React.useMemo(
    () =>
      buildAutomaticMenuItems({
        modules: sections.map((section: any) => ({
          id: section.id,
          type: section.type || section.tipo || '',
          name: section.name || section.label || section.type || section.tipo || section.id
        })),
        settingsValues: aggregatedSectionSettings
      }),
    [aggregatedSectionSettings, sections]
  );

  useEffect(() => {
    if (window.location.search.includes('debug=products') || window.location.search.includes('debug_render=true')) {
      logDebug('[PUBLISHED_SECTIONS_EXTRACTION_DEBUG]', {
        hasRootSections: Array.isArray(content?.sections),
        hasPagesSections: Array.isArray((content as any)?.pages?.[0]?.sections),
        hasNestedContentSections: Array.isArray((content as any)?.content?.sections),
        isContentArray: Array.isArray(content),
        extractedSectionsCount: sections.length
      });
    }
  }, [content, sections.length]);

  if (!content || (sections.length === 0 && !isConstructorMode)) {
    const isDebug = window.location.search.includes('debug=products') || window.location.search.includes('debug_render=true');
    console.error('❌ [VIEWER] Error de Integridad o Secciones Vacías.', {
      hasContent: !!content,
      sectionsCount: sections.length,
      isDebug
    });
    const publicTitle = 'No se pudo cargar este sitio.';
    const publicMessage = 'Intenta recargar la pagina en unos segundos.';
    
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-surface p-12 rounded-3xl shadow-xl border border-border max-w-md w-full flex flex-col items-center border-rose-200">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold text-text mb-4">
            {isPublishedViewer
              ? publicTitle
              : sections.length === 0
                ? 'No se encontraron secciones'
                : 'Error de carga'}
          </h1>
          <p className="text-text/60 mb-8 leading-relaxed text-sm">
            {isPublishedViewer
              ? publicMessage
              : sections.length === 0 
                ? 'Este sitio parece estar vacio. Asegurate de haber guardado y publicado tus cambios.'
                : 'La integridad del sitio no pudo ser validada. (Protocolo 10.2).'}
          </p>
          {isDebug && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg text-left text-[10px] font-mono overflow-auto max-h-40 w-full">
              <div className="font-bold text-slate-500 mb-1 underline">DEBUG INFO:</div>
              <div>siteId: {site.siteId || 'none'}</div>
              <div>projectId: {site.projectId || 'none'}</div>
              <div>contentKeys: {Object.keys(content || {}).join(', ')}</div>
              <div>extractedCount: {sections.length}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // const { theme, sections } = content; // Eliminado por extracción robusta arriba

  return (
    <div 
      className="min-h-screen bg-surface @container"
      style={{ 
        ...buildProjectThemeCssVariables(resolvedTheme),
        fontFamily: theme.fontFamily || 'sans-serif'
      } as React.CSSProperties}
    >
      {sections.map((section, index) => {
        const moduleId = section.id;
        // SOP: Fallback entre 'type' y 'tipo' para máxima compatibilidad
        const type = section.type || section.tipo; 
        const settings = section.settings || {};
        const content = section.content || {};

        if (!moduleId) {
          console.warn('⚠️ [VIEWER] Saltando sección sin ID.');
          return null;
        }

        // [VIEWER_SECTION_ROUTING_DEBUG] (AUDIT POINT 2)
        const normalizedType = type?.toLowerCase()
          ?.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
          ?.replace(/\s+/g, '_') // Espacios por guiones bajos
          ?.replace(/-/g, '_'); // Guiones por guiones bajos
          
        const componentResolved = [
          'products_showcase', 'product_showcase', 'products-showcase', 
          'showcase_products', 'catalog_v2', 'catalogo_v2', 'catalogo'
        ].includes(normalizedType);

        if (window.location.search.includes('debug_render=true') || window.location.search.includes('debug=products')) {
          logDebug('[VIEWER_SECTION_ROUTING_DEBUG]', {
            index,
            sectionId: moduleId,
            type: section.type,
            moduleType: (section as any).moduleType,
            normalizedType,
            componentResolved,
            visible: (section as any).visible !== false,
            contentKeys: section.content ? Object.keys(section.content) : [],
            settingsKeys: section.settings ? Object.keys(section.settings) : [],
            title: section.content?.title || section.content?.titulo || section.settings?.[`${moduleId}_global_header_title`]
          });
        }

        // DIAGNÓSTICO PROFUNDO
        const isRenderMode = window.location.search.includes('mode=render') || window.location.search.includes('external_render=true');
        if (isRenderMode) {
          logDebug('[VIEWER_SECTION_DEBUG]', {
            moduleId,
            type,
            hasContent: !!section.content,
            contentKeys: section.content ? Object.keys(section.content) : [],
            title: section.content?.title,
            subtitle: section.content?.subtitle,
            settingsKeys: section.settings ? Object.keys(section.settings) : []
          });
        }

        // SIP v5.5: Adapt settings for modules that expect moduleId prefix
        // Now using relativeKey-preserving contract (Protocolo 12.0)
        const settingsValues = Object.entries(settings).reduce((acc, [key, value]) => {
          // If the key is already prefixed with the moduleId, use it as is
          if (key.startsWith(moduleId)) {
            acc[key] = value;
          } else {
            // Reconstruct the full key by prepending the moduleId (e.g., el_hero_title -> mod_123_el_hero_title)
            acc[`${moduleId}_${key}`] = value;
            
            // Fallback: If it's a legacy flat key (e.g., 'title'), we still set it 
            // the module might have logic to handle both or we might need it for global_ defaults
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);

        // SIP v5.5 (Protocolo 10.5) - Centralized Hydration Bridge
        const finalSettingsValues = bridgeModuleContent({
          type,
          moduleId,
          content,
          settings,
          existingDeepValues: settingsValues
        });

        // Debug diagnostic for rendered sections
        if (isRenderMode && (type === 'hero' || type === 'features')) {
          logDebug('[SOLUTIUM_RENDER_DEBUG]', {
            type,
            moduleId,
            contentTitle: content?.title,
            finalTitle: finalSettingsValues[`${moduleId}_el_${type === 'hero' ? 'hero_typography' : 'features_header'}_title`],
            iframeUrl: window.location.href
          });
        }

        switch (normalizedType) {
          case 'header':
          case 'conversion':
            return <HeaderModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'hero':
            return <HeroModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'hero2':
            return <Hero2Module key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'features':
            return <FeaturesModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'about':
            return <AboutModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'products_showcase':
          case 'product_showcase':
          case 'showcase_products':
          case 'catalog_v2':
          case 'catalogo_v2':
          case 'catalogo':
            return (
              <ProductsShowcaseModule 
                key={moduleId} 
                moduleId={moduleId} 
                content={section.content}
                settingsValues={finalSettingsValues} 
                products={catalogProducts} 
                isPublishedViewer={isPublishedViewer} 
              />
            );
          case 'process':
            return <ProcessModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'gallery':
            return <GalleryModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} content={content} />;
          case 'testimonials':
            return <TestimonialsModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'stats':
            return <StatsModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'team':
            return <TeamModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'pricing':
            return <PricingModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'faq':
            return <FAQModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'contact':
            return <ContactModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'products':
          case 'product_grid':
          case 'product':
             // [PRODUCTS_LEGACY_VIEWER_RESOLUTION_DEBUG]
             logDebug('[PRODUCTS_LEGACY_VIEWER_RESOLUTION_DEBUG]', {
               runtime: isPublishedViewer ? "published_viewer" : "constructor",
               moduleId,
               hasContentProducts: !!(section.content?.products || section.content?.productos),
               contentCount: (section.content?.products?.length || section.content?.productos?.length || 0),
               hasSettingsSnapshot: !!finalSettingsValues[`${moduleId}_el_products_items_products`]
             });

             // [FASE 1] Datos brutos de la sección
             const selectProductsRaw = section.settings?.[`${moduleId}_el_products_config_select_products`] || section.settings?.select_products;
             const rawSelectionMode =
               finalSettingsValues[`${moduleId}_el_products_config_selection_mode`] ||
               section.settings?.[`${moduleId}_el_products_config_selection_mode`] ||
               section.settings?.selection_mode ||
               section.settings?.selectionMode ||
               section.content?.selectionMode ||
               section.content?.selection_mode ||
               'auto';
             const selectionMode = String(rawSelectionMode || 'auto').toLowerCase();
             const isManualSelectionMode = ['manual', 'selected', 'selection', 'featured', 'custom'].includes(selectionMode);
            
            // [VIEWER_PUBLISHED_CONTRACT_PRODUCTS_FORENSIC]
            if (isPublishedViewer || window.location.search.includes('debug=products')) {
              logDebug('[VIEWER_PUBLISHED_CONTRACT_PRODUCTS_FORENSIC]', {
                currentView: isConstructorMode ? 'constructor' : 'viewer',
                isPublishedViewer,
                siteId: site.siteId,
                projectId: effectiveProjectId,
                sectionsCount: site.content?.sections?.length || 0,
                productSections: site.content?.sections?.filter((s: any) => s.type === 'products' || s.type === 'product_grid').map((s: any) => ({
                  sectionId: s.id,
                  type: s.type,
                  contentKeys: s.content ? Object.keys(s.content) : [],
                  settingsKeys: s.settings ? Object.keys(s.settings) : [],
                  hasContentProducts: !!(s.content?.products || s.content?.productos || s.content?.items),
                  contentProductsCount: (s.content?.products?.length || s.content?.productos?.length || s.content?.items?.length || 0),
                  hasSelectedProductIds: !!s.content?.productIds,
                  selectedProductIdsCount: s.content?.productIds?.length || 0,
                  rawContentProductsPreview: s.content?.products?.[0]?.name || s.content?.productos?.[0]?.name
                }))
              });
              
              logDebug('[VIEWER_PRODUCTS_PATCH_VERSION]', {
                version: "products-snapshot-v2",
                timestamp: new Date().toISOString(),
                currentView: isConstructorMode ? 'constructor' : 'viewer',
                isPublishedViewer
              });
            }

            logDebug('[PRODUCTS_VIEWER_SECTION_RAW_DEBUG]', {
              runtime: isConstructorMode ? "constructor_preview" : "published_viewer",
              sectionId: section.id,
              moduleId,
              sectionType: type,
              contentProductsCount: section.content?.products?.length || 0,
              contentProductosCount: section.content?.productos?.length || 0,
              contentItemsCount: section.content?.items?.length || 0,
              settingsKeys: section.settings ? Object.keys(section.settings).length : 0,
              settingsValuesKeys: Object.keys(finalSettingsValues).length,
              selectionMode,
              selectProductsRaw: Array.isArray(selectProductsRaw) ? selectProductsRaw.length : 0,
              productsPropCount: catalogProducts?.length || 0,
              firstContentProduct: section.content?.products?.[0] || section.content?.productos?.[0]
            });

            // [FASE 2] RESOLUCIÓN PRIORITARIA EN VIVO
            // Fallback order: content.products -> content.productos -> content.items -> settings snapshot -> settings manual
            const snapshotProducts =
              section.content?.products ||
              section.content?.productos ||
              section.content?.items ||
              finalSettingsValues[`${moduleId}_el_products_items_products`] ||
              section.settings?.[`${moduleId}_el_products_items_products`] ||
              [];
            const explicitSelectedProductIds =
              finalSettingsValues[`${moduleId}_el_products_config_select_products`] ||
              section.settings?.[`${moduleId}_el_products_config_select_products`] ||
              section.settings?.select_products ||
              section.settings?.selectedProductIds ||
              section.content?.productIds ||
              section.content?.selectedProductIds ||
              [];

            let finalProducts: Product[] = [];
            let resolutionSource = "none";
            let skippedSupabaseFetch = false;

            if (isPublishedViewer) {
              if (catalogProducts.length > 0) {
                const manualIdsSource = Array.isArray(explicitSelectedProductIds) && explicitSelectedProductIds.length > 0
                  ? explicitSelectedProductIds
                  : (Array.isArray(snapshotProducts) ? snapshotProducts.map((product: any) => product?.id).filter(Boolean) : []);
                const manualIds = new Set(manualIdsSource.map((id: any) => String(id)).filter(Boolean));

                if (isManualSelectionMode) {
                  finalProducts = manualIds.size > 0
                    ? catalogProducts.filter((product) => manualIds.has(String(product.id)))
                    : [];
                  resolutionSource = manualIds.size > 0 ? "published_catalog_manual_selected" : "published_catalog_manual_empty";
                } else {
                  finalProducts = catalogProducts;
                  resolutionSource = "published_catalog_auto_all";
                }
              } else {
                finalProducts = [];
                resolutionSource = "published_catalog_empty";
              }
              skippedSupabaseFetch = true;
            } else {
              // Comportamiento híbrido para constructor o si no hay snapshot en el content
              const productMap = new Map<string, Product>();
              
              // 1. Snapshot si existe (prioridad media)
              if (Array.isArray(snapshotProducts) && snapshotProducts.length > 0) {
                snapshotProducts.forEach((p: any) => { if (p?.id) productMap.set(p.id, p); });
                resolutionSource = "snapshot_available";
              }
              
              // 2. Catálogo Supabase (Solo si estamos en el constructor o si falló el snapshot)
              // En el viewer publicado NO deberíamos llegar aquí si el snapshot existe
              if ((isConstructorMode || productMap.size === 0) && catalogProducts.length > 0) {
                catalogProducts.forEach((p) => { if (p.id) productMap.set(p.id, p); });
                if (productMap.size > 0 && resolutionSource === "none") resolutionSource = "catalog_fetch";
              }
              
              finalProducts = Array.from(productMap.values());
              if (resolutionSource === "none") resolutionSource = isConstructorMode ? "constructor_empty" : "viewer_fallback_empty";
            }

            logDebug('[PRODUCTS_LEGACY_VIEWER_RESOLUTION_DEBUG]', {
              runtime: isPublishedViewer ? "published_viewer" : "constructor_preview",
              moduleId,
              sectionType: type,
              contentProductsCount: (section.content?.products?.length || section.content?.productos?.length || section.content?.items?.length || 0),
              settingsSnapshotCount: Array.isArray(finalSettingsValues[`${moduleId}_el_products_items_products`]) ? finalSettingsValues[`${moduleId}_el_products_items_products`].length : 0,
              finalProductsCount: finalProducts.length,
              finalProductIds: finalProducts.map(p => p.id),
              source: resolutionSource,
              selectionMode,
              skippedSupabaseFetch,
              ignoredManualSelectionFilter: isPublishedViewer && finalProducts.length > 0,
              forceSnapshotRender: isPublishedViewer && finalProducts.length > 0
            });

            if (isPublishedViewer || window.location.search.includes('debug=products')) {
              logDebug('[PRODUCTS_LEGACY_LIVE_COMPONENT_MOUNT_DEBUG]', {
                runtime: isPublishedViewer ? "published_viewer" : "constructor",
                moduleId,
                componentMounted: true,
                finalProductsCount: finalProducts.length,
                timestamp: Date.now()
              });
            }

            return (
              <ProductsModule 
                key={moduleId} 
                moduleId={moduleId} 
                settingsValues={finalSettingsValues} 
                products={finalProducts} 
                selectedProductIds={isPublishedViewer && finalProducts.length > 0 ? finalProducts.map(p => p.id) : undefined}
                isPreviewMode={isConstructorMode} 
                forceSnapshotRender={isPublishedViewer && finalProducts.length > 0}
                skipEmptyManualFilter={isPublishedViewer && finalProducts.length > 0}
              />
            );
          case 'bento':
            return (
              <BentoModule 
                key={moduleId}
                moduleId={moduleId} 
                settingsValues={finalSettingsValues} 
                content={content}
                isPreviewMode={true}
              />
            );
          case 'composition_section':
            return (
              <CompositionSectionModule
                key={moduleId}
                moduleId={moduleId}
                settingsValues={finalSettingsValues}
                content={content}
                isPreviewMode={true}
              />
            );
          case 'comparative':
            return <ComparisonModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} preview={true} />;
          case 'clients':
            return (
              <ClientsModule
                key={moduleId}
                moduleId={moduleId}
                settingsValues={finalSettingsValues}
                customers={useSecureCatalogContext ? secureCatalogCustomers : []}
              />
            );
          case 'trusted_logos':
            const trustedLogosSnapshot =
              (Array.isArray(section.content?.companies) ? section.content.companies : null) ||
              (Array.isArray(section.content?.logos) ? section.content.logos : null) ||
              (Array.isArray(finalSettingsValues[`${moduleId}_el_trusted_logos_items_companies`])
                ? finalSettingsValues[`${moduleId}_el_trusted_logos_items_companies`]
                : null) ||
              [];

            return (
              <TrustedLogosModule
                key={moduleId}
                moduleId={moduleId}
                settingsValues={finalSettingsValues}
                companies={useSecureCatalogContext ? secureTrustedCompanyLogos : []}
                snapshotCompanies={trustedLogosSnapshot as TrustedCompanyLogo[]}
                isPreviewMode={isConstructorMode}
              />
            );
          case 'cta':
            return <CTAModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'dynamic_cards':
            return <DynamicCardsModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} isPreviewMode={isConstructorMode} />;
          case 'newsletter':
            return <NewsletterModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'video':
            return <VideoModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'spacer':
            return <SpacerModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'menu':
          case 'navegacion':
            // SIP v5.5 (Protocolo 12.0): Specialized routing for dual-type modules
            if (moduleId.startsWith('mod_footer_1')) {
              return <FooterModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
            }
            return (
              <MenuModule
                key={moduleId}
                moduleId={moduleId}
                settingsValues={finalSettingsValues}
                menuMode={resolveMenuMode(moduleId, finalSettingsValues)}
                automaticMenuItems={automaticMenuItems}
              />
            );
          case 'footer':
            const isDebug = window.location.search.includes('debug_render=true');
            if (isDebug) {
              logDebug('[FOOTER_RENDER_DEBUG]', {
                moduleId,
                moduleType: type,
                receivedContentKeys: content ? Object.keys(content) : [],
                columnsCount: finalSettingsValues[`${moduleId}_el_footer_nav_columns`]?.length || 0,
                socialLinksCount: finalSettingsValues[`${moduleId}_el_footer_social_social_links`]?.length || 0,
                brandBio: finalSettingsValues[`${moduleId}_el_footer_brand_bio`],
                logoImg: finalSettingsValues[`${moduleId}_el_footer_brand_logo_img`],
                willRender: true
              });
            }
            return <FooterModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          default:
            return null;
        }
      })}

      {onBack && (
        <button 
          onClick={onBack}
          className="fixed bottom-8 right-8 bg-surface/80 backdrop-blur-md border border-border p-3 rounded-full shadow-xl hover:bg-surface transition-all z-50 text-text/60 hover:text-primary"
          title="Cerrar vista previa"
        >
          <AlertCircle className="w-6 h-6 rotate-180" />
        </button>
      )}
    </div>
  );
};
