import React from 'react';
import { 
  PlusCircle, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Map
} from 'lucide-react';
import { EditorState, WebModule } from '../../types/constructor';
import { Product, Customer, TrustedCompanyLogo } from '../../types/schema';
import { SiteContent } from '../../types';
import { useEditorStore } from '../../store/editorStore';
import { isDarkColor } from './utils';
import { logDebug } from '../../utils/debug';
import { ProductsModule } from './modules/ProductsModule';
import { HeroModule } from './modules/HeroModule';
import { Hero2Module } from './modules/Hero2Module';
import { FeaturesModule } from './modules/FeaturesModule';
import { AboutModule } from './modules/AboutModule';
import { ProcessModule } from './modules/ProcessModule';
import { GalleryModule } from './modules/GalleryModule';
import { VideoModule } from './modules/VideoModule';
import { TestimonialsModule } from './modules/TestimonialsModule';
import { ProductsShowcaseModule } from './modules/ProductsShowcaseModule';
import { StatsModule } from './modules/StatsModule';
import { TeamModule } from './modules/TeamModule';
import { PricingModule } from './modules/PricingModule';
import { FAQModule } from './modules/FAQModule';
import { ContactModule } from './modules/ContactModule';
import { GeniusWebWaModule } from './modules/GeniusWebWaModule';
import { ClientsModule } from './modules/ClientsModule';
import { TrustedLogosModule } from './modules/TrustedLogosModule';
import { CTAModule } from './modules/CTAModule';
import { DynamicCardsModule } from './modules/DynamicCardsModule';
import { NewsletterModule } from './modules/NewsletterModule';
import { HeaderModule } from './modules/HeaderModule';
import { MenuModule } from './modules/MenuModule';
import { FooterModule } from './modules/FooterModule';
import { SpacerModule } from './modules/SpacerModule';
import { BentoModule } from './modules/BentoModule';
import { ComparisonModule } from './modules/ComparisonModule';
import { CompositionSectionModule } from './modules/CompositionSectionModule';
import { ParallaxScrollContext } from './ParallaxBackground';

import { normalizeSocialUrl, getIconForPlatform, resolveFooterSocialLinks, FOOTER_DEFAULTS } from '../../utils/socialUtils';
import {
  buildAutomaticMenuItems,
  isHeaderModuleLike,
  isMenuModuleLike,
  mergeAutomaticMenuItemsWithExisting,
  normalizeConstructorModuleOrder,
  normalizeHeaderPositionValue,
  normalizeMenuPositionValue,
  normalizeSectionAnchorId
} from '../../utils/menuNavigation';
import { resolveAnimationSafeSettings } from '../../utils/constructorAnimationPolicy';

interface CanvasProps {
  editorState: EditorState;
  onAddModule: (module: WebModule) => void;
  products: Product[];
  customers: Customer[];
  trustedCompanyLogos?: TrustedCompanyLogo[];
  isDevMode: boolean;
  logoUrl?: string | null;
  logoWhiteUrl?: string | null;
  viewport: 'desktop' | 'tablet' | 'mobile';
  setViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
  isFullscreen: boolean;
  setIsFullscreen: (f: boolean) => void;
  isPreviewMode: boolean;
  project?: any;
  onSettingChange: (elementOrModuleId: string, settingId: string, value: any) => void;
  reloadKey?: number;
  onOpenBentoGenerator?: () => void;
  siteContentOverride?: SiteContent;
  onRecentlyAddedModuleSettled?: (moduleId: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  editorState, 
  onAddModule, 
  products, 
  customers, 
  trustedCompanyLogos = [],
  isDevMode, 
  logoUrl, 
  logoWhiteUrl, 
  viewport, 
  setViewport, 
  isFullscreen, 
  setIsFullscreen,
  isPreviewMode,
  project,
  onSettingChange,
  reloadKey = 0,
  onOpenBentoGenerator,
  siteContentOverride,
  onRecentlyAddedModuleSettled
}) => {
  const {
    selectSection,
    selectedSectionId,
    siteContent,
    selectedCompositionElementId,
    selectCompositionElement
  } = useEditorStore();
  const renderSiteContent = siteContentOverride || siteContent;
  const orderedSections = React.useMemo(
    () => normalizeConstructorModuleOrder(((renderSiteContent?.sections) || []) as any[]),
    [renderSiteContent?.sections]
  );
  const moduleMeasurementSignature = React.useMemo(
    () => orderedSections.map((section: any) => `${section.id}:${section.type || (section as any).tipo || 'unknown'}`).join('|'),
    [orderedSections]
  );

  const lastModuleRef = React.useRef<HTMLDivElement>(null);
  const prevModulesLength = React.useRef(editorState.addedModules?.length || 0);
  const canvasScrollContainerRef = React.useRef<HTMLDivElement>(null);
  const fullscreenRootRef = React.useRef<HTMLDivElement>(null);
  const renderRootRef = React.useRef<HTMLDivElement>(null);
  const scheduledMeasurementFrameRef = React.useRef<number | null>(null);
  const panStartRef = React.useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const [canvasViewportWidth, setCanvasViewportWidth] = React.useState(0);
  const [renderContentWidth, setRenderContentWidth] = React.useState(0);
  const [renderContentHeight, setRenderContentHeight] = React.useState(0);
  const [measuredSectionHeights, setMeasuredSectionHeights] = React.useState<Record<string, number>>({});
  const [userZoom, setUserZoom] = React.useState(1);
  const [isPanning, setIsPanning] = React.useState(false);
  const [isMinimapHidden, setIsMinimapHidden] = React.useState(false);
  const [isMinimapDragging, setIsMinimapDragging] = React.useState(false);
  const [scrollMetrics, setScrollMetrics] = React.useState({
    scrollLeft: 0,
    scrollTop: 0,
    scrollWidth: 0,
    scrollHeight: 0,
    clientWidth: 0,
    clientHeight: 0
  });
  const [browserViewportWidth, setBrowserViewportWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  const setCanvasRootRef = React.useCallback((node: HTMLDivElement | null) => {
    canvasScrollContainerRef.current = node;
    fullscreenRootRef.current = node;
  }, []);

  const viewportWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  };
  const isFullscreenPreview = isFullscreen && !isPreviewMode;
  const automaticMenuItems = React.useMemo(
    () => {
      const baseItems = buildAutomaticMenuItems({
        modules: editorState.addedModules || [],
        settingsValues: editorState.settingsValues || {}
      });
      const menuModule = (editorState.addedModules || []).find((module) => module.type === 'navegacion' || module.type === 'menu');
      const existingLinks = menuModule
        ? editorState.settingsValues?.[`${menuModule.id}_el_menu_items_links`] || []
        : [];
      return mergeAutomaticMenuItemsWithExisting(baseItems, existingLinks);
    },
    [editorState.addedModules, editorState.settingsValues]
  );

  const isCleanPreviewMode = isPreviewMode || isFullscreen;
  const showEditorChrome = !isCleanPreviewMode;
  const isDesktopCanvas = viewport === 'desktop';
  const useFullBleedDesktopCanvas = showEditorChrome && isDesktopCanvas;
  const useVirtualDesktopPreview = useFullBleedDesktopCanvas && !isFullscreen;
  const isEmbeddedResponsivePreview = showEditorChrome && !isDesktopCanvas && !isFullscreen;
  const responsiveFramePaddingX = isEmbeddedResponsivePreview
    ? (browserViewportWidth < 640 ? 8 : browserViewportWidth < 1024 ? 12 : 24)
    : 0;
  const responsiveFramePaddingY = isEmbeddedResponsivePreview
    ? (browserViewportWidth < 640 ? 12 : 16)
    : 0;
  const responsiveFrameWidth = Math.max(0, canvasViewportWidth - (responsiveFramePaddingX * 2));
  const shouldFillResponsiveWidth = isEmbeddedResponsivePreview && browserViewportWidth < 1024;
  const desktopLogicalWidth = Math.max(1200, browserViewportWidth);
  const desktopPreviewScale = useVirtualDesktopPreview && canvasViewportWidth > 0
    ? Math.min(1, canvasViewportWidth / desktopLogicalWidth)
    : 1;
  const effectivePreviewScale = useVirtualDesktopPreview ? desktopPreviewScale * userZoom : userZoom;
  const targetResponsiveWidth = viewport === 'tablet' ? 768 : 375;
  const fullscreenResponsiveViewportWidth = Math.max(
    1,
    Math.min(
      targetResponsiveWidth,
      Math.max(0, canvasViewportWidth - 32)
    )
  );
  const fullscreenViewportWidth = viewport === 'desktop'
    ? '100%'
    : `${fullscreenResponsiveViewportWidth}px`;
  const effectiveResponsiveViewportWidth = isDesktopCanvas
    ? 0
    : Math.max(
        1,
        shouldFillResponsiveWidth
          ? (responsiveFrameWidth || targetResponsiveWidth)
          : Math.min(targetResponsiveWidth, responsiveFrameWidth || targetResponsiveWidth)
      );
  const previewBaseWidth = useVirtualDesktopPreview
    ? desktopLogicalWidth
    : viewport === 'tablet'
      ? effectiveResponsiveViewportWidth || 768
      : viewport === 'mobile'
        ? effectiveResponsiveViewportWidth || 375
        : Math.max(canvasViewportWidth || renderContentWidth || browserViewportWidth, 1);
  const canUsePreviewZoom = viewport === 'desktop' && (showEditorChrome || (isFullscreen && !isPreviewMode));
  const isUserZoomed = canUsePreviewZoom && userZoom !== 1;
  const canPanPreview = canUsePreviewZoom && userZoom > 1;
  const zoomPercent = Math.round(userZoom * 100);
  const zoomLimitsByViewport = React.useMemo(() => ({
    desktop: { min: 0.65, max: 2.5 },
    tablet: { min: 0.75, max: 2 },
    mobile: { min: 0.85, max: 1.8 }
  }), []);
  const zoomLimits = zoomLimitsByViewport[viewport];
  const minimapWidth = 164;
  const minimapHeight = 104;
  const hasMinimapScrollableArea =
    scrollMetrics.scrollWidth > scrollMetrics.clientWidth + 1 ||
    scrollMetrics.scrollHeight > scrollMetrics.clientHeight + 1;
  const showMinimap =
    canUsePreviewZoom &&
    !isMinimapHidden &&
    userZoom > 1 &&
    hasMinimapScrollableArea &&
    scrollMetrics.scrollWidth > 0 &&
    scrollMetrics.scrollHeight > 0;
  const minimapViewport = React.useMemo(() => {
    if (!scrollMetrics.scrollWidth || !scrollMetrics.scrollHeight) {
      return { x: 0, y: 0, width: minimapWidth, height: minimapHeight };
    }

    return {
      x: Math.max(0, (scrollMetrics.scrollLeft / scrollMetrics.scrollWidth) * minimapWidth),
      y: Math.max(0, (scrollMetrics.scrollTop / scrollMetrics.scrollHeight) * minimapHeight),
      width: Math.min(minimapWidth, Math.max(12, (scrollMetrics.clientWidth / scrollMetrics.scrollWidth) * minimapWidth)),
      height: Math.min(minimapHeight, Math.max(12, (scrollMetrics.clientHeight / scrollMetrics.scrollHeight) * minimapHeight))
    };
  }, [scrollMetrics]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateBrowserViewportWidth = () => setBrowserViewportWidth(window.innerWidth);
    updateBrowserViewportWidth();
    window.addEventListener('resize', updateBrowserViewportWidth);
    return () => window.removeEventListener('resize', updateBrowserViewportWidth);
  }, []);

  React.useEffect(() => {
    const scrollNode = canvasScrollContainerRef.current;
    if (!scrollNode || typeof ResizeObserver === 'undefined') return;

    const updateCanvasViewportWidth = () => {
      const nextWidth = scrollNode.clientWidth || scrollNode.getBoundingClientRect().width || 0;
      setCanvasViewportWidth((previousWidth) => (
        previousWidth === nextWidth ? previousWidth : nextWidth
      ));
    };

    updateCanvasViewportWidth();
    const observer = new ResizeObserver(updateCanvasViewportWidth);
    observer.observe(scrollNode);
    return () => observer.disconnect();
  }, [isFullscreen, isPreviewMode]);

  React.useEffect(() => {
    const renderNode = renderRootRef.current;
    if (!renderNode || typeof ResizeObserver === 'undefined') return;

    const updateRenderContentSize = () => {
      const nextWidth = renderNode.offsetWidth || 0;
      const nextHeight = renderNode.offsetHeight || 0;
      setRenderContentWidth((previousWidth) => (
        previousWidth === nextWidth ? previousWidth : nextWidth
      ));
      setRenderContentHeight((previousHeight) => (
        previousHeight === nextHeight ? previousHeight : nextHeight
      ));
    };
    updateRenderContentSize();
    const observer = new ResizeObserver(updateRenderContentSize);
    observer.observe(renderNode);
    return () => observer.disconnect();
  }, [viewport, isFullscreen, isPreviewMode, reloadKey, editorState.addedModules?.length]);

  const updateMeasuredSectionHeights = React.useCallback(() => {
    const root = renderRootRef.current;
    if (!root) return;

    const nextHeights: Record<string, number> = {};
    root.querySelectorAll<HTMLElement>('[data-module-id]').forEach((node) => {
      const moduleId = node.dataset.moduleId;
      if (!moduleId) return;
      const measuredHeight = Math.round(node.getBoundingClientRect().height);
      if (measuredHeight > 0) {
        nextHeights[moduleId] = measuredHeight;
      }
    });

    setMeasuredSectionHeights((previousHeights) => {
      const previousKeys = Object.keys(previousHeights);
      const nextKeys = Object.keys(nextHeights);
      if (
        previousKeys.length === nextKeys.length &&
        nextKeys.every((key) => previousHeights[key] === nextHeights[key])
      ) {
        return previousHeights;
      }
      return nextHeights;
    });
  }, []);

  const scheduleMeasuredSectionHeightsUpdate = React.useCallback(() => {
    if (scheduledMeasurementFrameRef.current !== null) return;
    scheduledMeasurementFrameRef.current = window.requestAnimationFrame(() => {
      scheduledMeasurementFrameRef.current = null;
      updateMeasuredSectionHeights();
    });
  }, [updateMeasuredSectionHeights]);

  React.useEffect(() => {
    return () => {
      if (scheduledMeasurementFrameRef.current !== null) {
        window.cancelAnimationFrame(scheduledMeasurementFrameRef.current);
        scheduledMeasurementFrameRef.current = null;
      }
    };
  }, []);

  React.useLayoutEffect(() => {
    scheduleMeasuredSectionHeightsUpdate();
  }, [scheduleMeasuredSectionHeightsUpdate, moduleMeasurementSignature, viewport, isFullscreen, isPreviewMode, reloadKey]);

  React.useEffect(() => {
    const root = renderRootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;

    scheduleMeasuredSectionHeightsUpdate();

    const observer = new ResizeObserver(() => {
      scheduleMeasuredSectionHeightsUpdate();
    });

    observer.observe(root);
    root.querySelectorAll<HTMLElement>('[data-module-id]').forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
      if (scheduledMeasurementFrameRef.current !== null) {
        window.cancelAnimationFrame(scheduledMeasurementFrameRef.current);
        scheduledMeasurementFrameRef.current = null;
      }
    };
  }, [scheduleMeasuredSectionHeightsUpdate, moduleMeasurementSignature, reloadKey]);

  const updateScrollMetrics = React.useCallback(() => {
    const node = canvasScrollContainerRef.current;
    if (!node) return;
    const nextMetrics = {
      scrollLeft: node.scrollLeft,
      scrollTop: node.scrollTop,
      scrollWidth: node.scrollWidth,
      scrollHeight: node.scrollHeight,
      clientWidth: node.clientWidth,
      clientHeight: node.clientHeight
    };
    setScrollMetrics((previousMetrics) => (
      previousMetrics.scrollLeft === nextMetrics.scrollLeft &&
      previousMetrics.scrollTop === nextMetrics.scrollTop &&
      previousMetrics.scrollWidth === nextMetrics.scrollWidth &&
      previousMetrics.scrollHeight === nextMetrics.scrollHeight &&
      previousMetrics.clientWidth === nextMetrics.clientWidth &&
      previousMetrics.clientHeight === nextMetrics.clientHeight
        ? previousMetrics
        : nextMetrics
    ));
  }, []);

  React.useEffect(() => {
    updateScrollMetrics();
  }, [updateScrollMetrics, renderContentWidth, renderContentHeight, userZoom, viewport, isFullscreen]);

  React.useEffect(() => {
    const node = canvasScrollContainerRef.current;
    if (!node || !canUsePreviewZoom) return;

    window.requestAnimationFrame(() => {
      const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
      const maxScrollTop = Math.max(0, node.scrollHeight - node.clientHeight);

      if (userZoom <= 1) {
        node.scrollLeft = Math.round(maxScrollLeft / 2);
      } else {
        node.scrollLeft = Math.min(maxScrollLeft, Math.max(0, node.scrollLeft));
      }

      node.scrollTop = Math.min(maxScrollTop, Math.max(0, node.scrollTop));
      updateScrollMetrics();
    });
  }, [
    canvasViewportWidth,
    renderContentWidth,
    renderContentHeight,
    canUsePreviewZoom,
    updateScrollMetrics,
    userZoom
  ]);

  React.useEffect(() => {
    if (!isUserZoomed) {
      setIsMinimapHidden(false);
      setIsPanning(false);
      const node = canvasScrollContainerRef.current;
      if (node) {
        window.requestAnimationFrame(() => {
          node.scrollLeft = Math.max(0, (node.scrollWidth - node.clientWidth) / 2);
          updateScrollMetrics();
        });
      }
    }
  }, [isUserZoomed, updateScrollMetrics]);

  React.useEffect(() => {
    setUserZoom((currentZoom) => {
      const clampedZoom = Math.min(zoomLimits.max, Math.max(zoomLimits.min, currentZoom));
      return clampedZoom === currentZoom ? currentZoom : Number(clampedZoom.toFixed(2));
    });
  }, [viewport, zoomLimits.max, zoomLimits.min]);

  const clampZoom = (nextZoom: number) => Math.min(zoomLimits.max, Math.max(zoomLimits.min, Number(nextZoom.toFixed(2))));
  const setZoomAroundCenter = (nextZoom: number) => {
    setUserZoom((currentZoom) => {
      const node = canvasScrollContainerRef.current;
      const clampedZoom = clampZoom(nextZoom);
      if (node && currentZoom !== clampedZoom) {
        const centerXRatio = node.scrollWidth > 0
          ? (node.scrollLeft + node.clientWidth / 2) / node.scrollWidth
          : 0.5;
        const centerYRatio = node.scrollHeight > 0
          ? (node.scrollTop + node.clientHeight / 2) / node.scrollHeight
          : 0.5;
        window.requestAnimationFrame(() => {
          const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
          const maxScrollTop = Math.max(0, node.scrollHeight - node.clientHeight);
          node.scrollLeft = Math.min(maxScrollLeft, Math.max(0, centerXRatio * node.scrollWidth - node.clientWidth / 2));
          node.scrollTop = Math.min(maxScrollTop, Math.max(0, centerYRatio * node.scrollHeight - node.clientHeight / 2));
          updateScrollMetrics();
        });
      }
      return clampedZoom;
    });
  };

  const isPreviewPanBlocked = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return true;
    return Boolean(target.closest(
      'button, input, textarea, select, a, [contenteditable="true"], [role="button"], .react-resizable-handle, [data-no-preview-pan="true"]'
    ));
  };

  const handlePreviewPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!canPanPreview || isPreviewPanBlocked(event.target)) return;
    const node = canvasScrollContainerRef.current;
    if (!node) return;
    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: node.scrollLeft,
      scrollTop: node.scrollTop
    };
    setIsPanning(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePreviewPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    const node = canvasScrollContainerRef.current;
    if (!node) return;
    node.scrollLeft = panStartRef.current.scrollLeft - (event.clientX - panStartRef.current.x);
    node.scrollTop = panStartRef.current.scrollTop - (event.clientY - panStartRef.current.y);
    updateScrollMetrics();
    event.preventDefault();
  };

  const stopPreviewPan = (event?: React.PointerEvent<HTMLDivElement>) => {
    if (event) event.currentTarget.releasePointerCapture?.(event.pointerId);
    setIsPanning(false);
  };

  const moveViewportFromMinimap = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = canvasScrollContainerRef.current;
    if (!node) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const xRatio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const yRatio = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    node.scrollLeft = Math.max(0, (xRatio * node.scrollWidth) - node.clientWidth / 2);
    node.scrollTop = Math.max(0, (yRatio * node.scrollHeight) - node.clientHeight / 2);
    updateScrollMetrics();
  };

  React.useEffect(() => {
    const modulesLength = editorState.addedModules?.length || 0;
    const didAddModule = modulesLength > prevModulesLength.current;
    prevModulesLength.current = modulesLength;
    if (didAddModule) {
      const targetId = editorState.recentlyAddedModuleId || editorState.expandedModuleId;
      if (targetId) {
        let cancelled = false;
        let attempts = 0;
        let stableFrames = 0;
        let previousRect: { top: number; height: number } | null = null;
        const maxAttempts = 10;

        const scrollToInsertedModule = () => {
          if (cancelled) return;
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            const currentRect = {
              top: Math.round(rect.top),
              height: Math.round(rect.height)
            };
            const isStable =
              previousRect &&
              Math.abs(previousRect.top - currentRect.top) <= 1 &&
              Math.abs(previousRect.height - currentRect.height) <= 1;

            stableFrames = isStable ? stableFrames + 1 : 0;
            previousRect = currentRect;

            if (stableFrames < 2 && attempts < maxAttempts) {
              attempts += 1;
              requestAnimationFrame(scrollToInsertedModule);
              return;
            }

            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
            onRecentlyAddedModuleSettled?.(targetId);
            return;
          }

          attempts += 1;
          if (attempts >= maxAttempts) {
            onRecentlyAddedModuleSettled?.(targetId);
            return;
          }

          window.setTimeout(() => {
            requestAnimationFrame(scrollToInsertedModule);
          }, 50);
        };

        requestAnimationFrame(scrollToInsertedModule);
        return () => {
          cancelled = true;
        };
      }
    }
  }, [editorState.addedModules?.length, editorState.recentlyAddedModuleId, editorState.expandedModuleId, onRecentlyAddedModuleSettled]);

  React.useEffect(() => {
    if (editorState.recentlyAddedModuleId === editorState.expandedModuleId) return;
    if (editorState.expandedModuleId) {
      const element = document.getElementById(editorState.expandedModuleId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [editorState.expandedModuleId]);

  React.useEffect(() => {
    if (!isFullscreen || isPreviewMode) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen, isPreviewMode]);

  React.useEffect(() => {
    if (!isFullscreen || isPreviewMode) return;

    const handleFullscreenEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleFullscreenEscape);
    return () => window.removeEventListener('keydown', handleFullscreenEscape);
  }, [isFullscreen, isPreviewMode, setIsFullscreen]);

  return (
    <ParallaxScrollContext.Provider value={isCleanPreviewMode ? null : canvasScrollContainerRef}>
      <div
        ref={setCanvasRootRef}
        id="constructor-canvas-scroll-container"
        onScroll={updateScrollMetrics}
        onPointerDown={handlePreviewPointerDown}
        onPointerMove={handlePreviewPointerMove}
        onPointerUp={stopPreviewPan}
        onPointerLeave={stopPreviewPan}
        className={`flex-1 ${canPanPreview ? 'overflow-auto' : 'overflow-y-scroll overflow-x-hidden'} custom-scrollbar preview-scrollbar transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-[120] bg-surface' : ''} ${isCleanPreviewMode ? 'p-0' : ''}`}
        style={{
          scrollbarGutter: 'stable',
          backgroundColor: isCleanPreviewMode ? 'var(--builder-surface)' : 'var(--builder-surface-muted)',
          cursor: canPanPreview ? (isPanning ? 'grabbing' : 'grab') : undefined
        }}
      >
      <div id="top" />
      {isFullscreenPreview && (
        <div className="sticky top-0 z-[140] flex justify-center border-b border-border/50 bg-surface/95 px-4 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-surface/90 p-1.5 shadow-xl">
            <div className="flex items-center gap-1 rounded-xl bg-secondary/50 p-1">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`p-2 rounded-lg transition-all ${viewport === 'desktop' ? 'text-primary bg-surface shadow-sm' : 'text-text/40 hover:text-primary'}`}
              title="Vista escritorio"
              aria-label="Vista escritorio"
            >
              <Monitor size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              className={`p-2 rounded-lg transition-all ${viewport === 'tablet' ? 'text-primary bg-surface shadow-sm' : 'text-text/40 hover:text-primary'}`}
              title="Vista tablet"
              aria-label="Vista tablet"
            >
              <Tablet size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`p-2 rounded-lg transition-all ${viewport === 'mobile' ? 'text-primary bg-surface shadow-sm' : 'text-text/40 hover:text-primary'}`}
              title="Vista móvil"
              aria-label="Vista móvil"
            >
              <Smartphone size={16} />
            </button>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="rounded-xl p-2 text-text/50 transition-all hover:bg-secondary hover:text-rose-500"
              title="Salir de pantalla completa"
              aria-label="Salir de pantalla completa"
            >
              <Minimize size={18} />
            </button>
          </div>
        </div>
      )}
      <div
        className={`flex min-h-full ${useVirtualDesktopPreview ? 'relative justify-start' : 'justify-center transition-all duration-500'} ${isFullscreen ? 'px-4 pb-6 pt-4' : isPreviewMode ? 'p-0' : isDesktopCanvas ? 'p-0' : ''}`}
        style={useVirtualDesktopPreview ? {
          width: `${Math.ceil(previewBaseWidth * effectivePreviewScale)}px`,
          minHeight: renderContentHeight ? `${Math.ceil(renderContentHeight * effectivePreviewScale)}px` : undefined
        } : (canUsePreviewZoom && userZoom !== 1 ? {
          width: `${Math.ceil(previewBaseWidth * userZoom)}px`,
          minHeight: renderContentHeight ? `${Math.ceil(renderContentHeight * userZoom)}px` : undefined
        } : {
          paddingLeft: responsiveFramePaddingX ? `${responsiveFramePaddingX}px` : undefined,
          paddingRight: responsiveFramePaddingX ? `${responsiveFramePaddingX}px` : undefined,
          paddingTop: responsiveFramePaddingY ? `${responsiveFramePaddingY}px` : undefined,
          paddingBottom: responsiveFramePaddingY ? `${responsiveFramePaddingY}px` : undefined
        })}
      >
        <div 
          ref={renderRootRef}
          id="constructor-canvas-render"
          data-preview-root="true"
          className={`bg-surface relative @container ${
            isCleanPreviewMode ? 'w-full max-w-none border-none rounded-none shadow-none' :
            useFullBleedDesktopCanvas ? 'w-full max-w-none min-h-full rounded-none border-none shadow-none' : 'transition-all duration-500 ease-in-out rounded-2xl border border-border/50 shadow-2xl'
          } ${viewport === 'mobile' && showEditorChrome ? 'rounded-[3rem] border-[8px] border-slate-900 shadow-[0_0_0_2px_rgba(0,0,0,0.1)]' : ''} ${viewport === 'tablet' && showEditorChrome ? 'rounded-[2rem] border-[12px] border-slate-900 shadow-[0_0_0_2px_rgba(0,0,0,0.1)]' : ''}`}
          style={{ 
            width: isPreviewMode ? '100%' : (
              useVirtualDesktopPreview
                ? `${desktopLogicalWidth}px`
                : isFullscreen
                  ? fullscreenViewportWidth
                  : viewport === 'desktop'
                    ? viewportWidths[viewport]
                    : `${effectiveResponsiveViewportWidth}px`
            ),
            maxWidth: isPreviewMode ? 'none' : (
              useVirtualDesktopPreview
                ? `${desktopLogicalWidth}px`
                : isFullscreen
                  ? (viewport === 'desktop' ? 'none' : fullscreenViewportWidth)
                  : viewport === 'desktop'
                    ? 'none'
                    : `${effectiveResponsiveViewportWidth}px`
            ),
            minHeight: isFullscreenPreview ? '100%' : (isCleanPreviewMode ? '100vh' : (isDesktopCanvas ? '100%' : viewport === 'mobile' ? '667px' : '1024px')),
            transform: canUsePreviewZoom && effectivePreviewScale !== 1 ? `scale(${effectivePreviewScale})` : undefined,
            transformOrigin: canUsePreviewZoom ? 'top left' : 'top center',
            position: useVirtualDesktopPreview ? 'absolute' : 'relative',
            top: useVirtualDesktopPreview ? 0 : undefined,
            left: useVirtualDesktopPreview ? 0 : undefined,
            boxSizing: 'border-box'
          }}
        >
          {viewport === 'mobile' && showEditorChrome && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-10 h-1 bg-slate-800 rounded-full" />
            </div>
          )}
          <div className="w-full" key={reloadKey}>
            {(!orderedSections || orderedSections.length === 0) && showEditorChrome ? (
              <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
                <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mb-6 text-text/20">
                  <PlusCircle size={40} />
                </div>
                <h3 className="text-xl font-bold text-text mb-2">Tu página está vacía</h3>
                <p className="text-text/40 max-w-xs mx-auto mb-8">
                  Empieza añadiendo módulos desde el catálogo lateral para construir tu sitio web.
                </p>
              </div>
            ) : (
              orderedSections.map((section, index) => {
                const isLast = index === orderedSections.length - 1;
                
                const isMenuSection = isMenuModuleLike(section as any);
                const isHeaderSection = isHeaderModuleLike(section as any);

                // Determine if this module wrapper should be sticky/fixed
                const modulePos =
                  editorState.settingsValues?.[`${section.id}_global_position`] ??
                  section.settings[`${section.id}_global_position`];
                const menuSticky =
                  editorState.settingsValues?.[`${section.id}_global_sticky`] ??
                  section.settings[`${section.id}_global_sticky`];
                const normalizedMenuPosition = isMenuSection
                  ? normalizeMenuPositionValue(modulePos, menuSticky)
                  : null;
                const normalizedHeaderPosition = isHeaderSection
                  ? normalizeHeaderPositionValue(modulePos, menuSticky)
                  : null;
                const hasExplicitPosition = modulePos !== undefined && modulePos !== null && modulePos !== '';
                const isSticky = isMenuSection
                  ? normalizedMenuPosition === 'fixed'
                  : isHeaderSection
                    ? normalizedHeaderPosition === 'fixed'
                  : modulePos === 'sticky' || (!hasExplicitPosition && menuSticky === true);
                const isFixed = isMenuSection
                  ? normalizedMenuPosition === 'fixed'
                  : isHeaderSection
                    ? normalizedHeaderPosition === 'fixed'
                  : modulePos === 'fixed';
                const wrapperHandlesFloating = isMenuSection
                  ? normalizedMenuPosition === 'fixed'
                  : isHeaderSection
                    ? normalizedHeaderPosition === 'fixed'
                  : (isSticky || isFixed);

                // Calculate cumulative top offset for stacking floating modules
                let topOffset = 0;
                if (wrapperHandlesFloating) {
                  for (let i = 0; i < index; i++) {
                    const prev = orderedSections[i];
                    const prevPos =
                      editorState.settingsValues?.[`${prev.id}_global_position`] ??
                      prev.settings[`${prev.id}_global_position`];
                    const prevSticky =
                      editorState.settingsValues?.[`${prev.id}_global_sticky`] ??
                      prev.settings[`${prev.id}_global_sticky`];
                    const isPrevMenu = isMenuModuleLike(prev as any);
                    const isPrevHeader = isHeaderModuleLike(prev as any);
                    const isPrevFloating = isPrevMenu
                      ? normalizeMenuPositionValue(prevPos, prevSticky) === 'fixed'
                      : isPrevHeader
                        ? normalizeHeaderPositionValue(prevPos, prevSticky) === 'fixed'
                      : prevPos === 'sticky' || prevPos === 'fixed' || prevSticky === true;
                    
                    if (isPrevFloating) {
                      topOffset += measuredSectionHeights[prev.id] || 0;
                    }
                  }
                }

                // Higher z-index for earlier modules to ensure top bar is always on top
                const stackingZIndex = 110 - index;

                const theme = renderSiteContent.theme;
                
                const invert = theme.invertedAlternatingMode || false;
                const isDarkForced = theme.alternatingDarkMode 
                  ? (invert ? (index % 2 === 0) : (index % 2 !== 0)) 
                  : false;
                const isThemeForced = theme.alternatingThemeMode 
                  ? (invert ? (index % 2 === 0) : (index % 2 !== 0)) 
                  : false;
                
                // Create overrides for this specific module
                const moduleOverrides: Record<string, any> = {};
                
                if (isDarkForced) {
                  moduleOverrides[`${section.id}_global_dark_mode`] = true;
                  moduleOverrides[`${section.id}_global_bg_color`] = '#0F172A';
                  moduleOverrides[`${section.id}_global_bg_type`] = 'color';
                } else if (isThemeForced) {
                  const projectBg = theme.themeBackgroundColor || theme.secondaryColor;
                  const isDark = isDarkColor(projectBg);
                  
                  moduleOverrides[`${section.id}_global_dark_mode`] = isDark;
                  moduleOverrides[`${section.id}_global_bg_color`] = projectBg;
                  moduleOverrides[`${section.id}_global_bg_type`] = 'color';
                }

                const hasExplicitModuleAnimation =
                  section.settings?.[`${section.id}_global_entrance_anim`] !== undefined ||
                  editorState.settingsValues?.[`${section.id}_global_entrance_anim`] !== undefined;

                // NOTE:
                // `theme.globalAnimationType` is still a legacy Canvas-only visual default for modules
                // that do not yet persist an explicit animation key. Published/Viewer should rely on
                // persisted module settings, so we never let this temporary theme default override an
                // explicit module animation. The new `section_animation` contract intentionally does
                // not participate in this legacy override path.
                if (!hasExplicitModuleAnimation && theme.globalAnimationType && theme.globalAnimationType !== 'custom') {
                  moduleOverrides[`${section.id}_global_entrance_anim`] = theme.globalAnimationType;
                }

                  // SIP v11.4: Dynamic enrichment for live preview (Constructor)
                  if (section.type === 'footer') {
                    const defaults = FOOTER_DEFAULTS;

                    const getPlainValueLocal = (val: any) => {
                      if (val && typeof val === 'object' && 'value' in val && !Array.isArray(val)) {
                        return val.value;
                      }
                      return val;
                    };

                    const isDefault = (val: any, d: string | string[]) => {
                      const cleanVal = getPlainValueLocal(val);
                      if (Array.isArray(d)) return !cleanVal || d.includes(cleanVal);
                      return !cleanVal || cleanVal === d;
                    };

                    // Enrich if missing or default in settingsValues + section.settings
                    const currentEmail = getPlainValueLocal(editorState.settingsValues[`${section.id}_el_footer_contact_email`] || section.settings[`${section.id}_el_footer_contact_email`]);
                    if (isDefault(currentEmail, defaults.email) && project?.email) {
                      moduleOverrides[`${section.id}_el_footer_contact_email`] = project.email;
                      moduleOverrides[`${section.id}_el_footer_contact_show_contact`] = true;
                    }

                    const currentPhone = getPlainValueLocal(editorState.settingsValues[`${section.id}_el_footer_contact_phone`] || section.settings[`${section.id}_el_footer_contact_phone`]);
                    if (isDefault(currentPhone, defaults.phone) && project?.whatsapp) {
                      moduleOverrides[`${section.id}_el_footer_contact_phone`] = project.whatsapp;
                      moduleOverrides[`${section.id}_el_footer_contact_show_contact`] = true;
                    }

                    const currentAddress = getPlainValueLocal(editorState.settingsValues[`${section.id}_el_footer_contact_address`] || section.settings[`${section.id}_el_footer_contact_address`]);
                    if (isDefault(currentAddress, defaults.address) && project?.address) {
                      moduleOverrides[`${section.id}_el_footer_contact_address`] = project.address;
                      moduleOverrides[`${section.id}_el_footer_contact_show_contact`] = true;
                    }

                    const currentBio = getPlainValueLocal(editorState.settingsValues[`${section.id}_el_footer_brand_bio`] || section.settings[`${section.id}_el_footer_brand_bio`]);
                    if (isDefault(currentBio, defaults.bio) && (project?.industry || project?.name)) {
                      const bioVal = project?.industry || `Servicios profesionales de ${project?.name || 'nuestro negocio'}`;
                      moduleOverrides[`${section.id}_el_footer_brand_bio`] = bioVal;
                    }

                    const currentCopy = getPlainValueLocal(editorState.settingsValues[`${section.id}_el_footer_bottom_copyright`] || section.settings[`${section.id}_el_footer_bottom_copyright`]);
                    if (isDefault(currentCopy, defaults.copyright)) {
                      moduleOverrides[`${section.id}_el_footer_bottom_copyright`] = `© ${new Date().getFullYear()} ${project?.name || 'Solutium'}. Todos los derechos reservados.`;
                    }
                    
                    // Social links
                    const currentSocials = getPlainValueLocal(editorState.settingsValues[`${section.id}_el_footer_social_social_links`] || section.settings[`${section.id}_el_footer_social_social_links`]);
                    const resolvedSocialLinks = resolveFooterSocialLinks(currentSocials, project?.socials);
                    moduleOverrides[`${section.id}_el_footer_social_social_links`] = resolvedSocialLinks;

                    // Brand Logo
                    const currentLogo = getPlainValueLocal(editorState.settingsValues[`${section.id}_el_footer_brand_logo_img`] || section.settings[`${section.id}_el_footer_brand_logo_img`]);
                    if (isDefault(currentLogo, defaults.logos) && project?.logoUrl) {
                      moduleOverrides[`${section.id}_el_footer_brand_logo_img`] = project.logoUrl;
                      moduleOverrides[`${section.id}_el_footer_brand_show_logo`] = true;
                    }
                  }

                  if (section.type === 'contact') {
                    const getPlainValueLocal = (val: any) => {
                      if (val && typeof val === 'object' && 'value' in val && !Array.isArray(val)) {
                        return val.value;
                      }
                      return val;
                    };

                    const isDefault = (val: any, d: string | string[]) => {
                      const cleanVal = getPlainValueLocal(val);
                      if (Array.isArray(d)) return !cleanVal || d.includes(cleanVal);
                      return !cleanVal || cleanVal === d;
                    };

                    const contactDefaults = {
                      email: 'hola@tuempresa.com',
                      phone: '+34 900 000 000',
                      address: 'Calle Innovación 123, Madrid, España',
                      whatsappNumber: ''
                    };

                    const currentEmail = getPlainValueLocal(editorState.settingsValues[`${section.id}_el_contact_info_email`] || section.settings[`${section.id}_el_contact_info_email`]);
                    if (isDefault(currentEmail, contactDefaults.email) && project?.email) {
                      moduleOverrides[`${section.id}_el_contact_info_email`] = project.email;
                    }

                    const currentPhone = getPlainValueLocal(editorState.settingsValues[`${section.id}_el_contact_info_phone`] || section.settings[`${section.id}_el_contact_info_phone`]);
                    if (isDefault(currentPhone, contactDefaults.phone) && project?.whatsapp) {
                      moduleOverrides[`${section.id}_el_contact_info_phone`] = project.whatsapp;
                    }

                    const currentWhatsapp = getPlainValueLocal(editorState.settingsValues[`${section.id}_el_contact_form_whatsapp_number`] || section.settings[`${section.id}_el_contact_form_whatsapp_number`]);
                    if (isDefault(currentWhatsapp, contactDefaults.whatsappNumber) && project?.whatsapp) {
                      moduleOverrides[`${section.id}_el_contact_form_whatsapp_number`] = project.whatsapp;
                    }

                    const currentAddress = getPlainValueLocal(editorState.settingsValues[`${section.id}_el_contact_info_address`] || section.settings[`${section.id}_el_contact_info_address`]);
                    if (isDefault(currentAddress, contactDefaults.address) && project?.address) {
                      moduleOverrides[`${section.id}_el_contact_info_address`] = project.address;
                    }
                  }

                // PROTOCOLO SOLUTIUM v7.5: Reconstrucción de settingsValues para el Canvas
                // Fusionamos:
                // 1. editorState.settingsValues (Estado vivo del editor - Prioridad Alta)
                // 2. section.settings (Estado del store/db - Fallback)
                // 3. moduleOverrides (Tematización global/alternante - Prioridad Máxima)
                const finalSettings = resolveAnimationSafeSettings({
                  ...section.settings, 
                  ...editorState.settingsValues,
                  ...moduleOverrides 
                });

                if (!isCleanPreviewMode) {
                   logDebug('[CANVAS_SECTION_RENDER_DEBUG]', {
                      moduleId: section.id,
                      type: section.type,
                      templateId: section.templateId,
                      isVisible: !(section as any).hidden,
                      hasElements: section.elements?.length
                   });
                }

                logDebug('[CANVAS_MENU_DETECTION_DEBUG]', {
                  moduleId: section.id,
                  moduleType: section.type,
                  moduleTipo: (section as any).tipo,
                  willRenderAsMenu:
                    section.type === 'menu' ||
                    section.type === 'navegacion' ||
                    (section as any).tipo === 'menu' ||
                    (section as any).tipo === 'navegacion',
                  hasMenuLinks: Boolean(finalSettings?.[`${section.id}_el_menu_items_links`]),
                  linksCount: Array.isArray(finalSettings?.[`${section.id}_el_menu_items_links`])
                    ? finalSettings?.[`${section.id}_el_menu_items_links`].length
                    : null,
                  logoText: finalSettings?.[`${section.id}_el_menu_logo_logo_text`],
                  logoType: finalSettings?.[`${section.id}_el_menu_logo_logo_type`]
                });

                return (
                  <div 
                    key={section.id} 
                    id={normalizeSectionAnchorId(section.id)}
                    data-module-id={section.id}
                    ref={isLast ? lastModuleRef : null} 
                    onClick={(e) => {
                      if (isCleanPreviewMode) return;
                      e.stopPropagation();
                      selectSection(section.id);
                    }}
                    className={`w-full group relative outline-none transition-all duration-300 ${wrapperHandlesFloating ? 'sticky' : 'relative'} ${
                      (showEditorChrome && selectedSectionId === section.id)
                        ? 'ring-2 ring-blue-500 ring-inset shadow-2xl z-50 cursor-pointer' 
                        : showEditorChrome ? 'hover:ring-1 hover:ring-blue-300/50 ring-inset cursor-pointer' : ''
                    }`}
                    style={{ 
                      top: wrapperHandlesFloating ? `${topOffset}px` : undefined,
                      zIndex: wrapperHandlesFloating ? stackingZIndex : (selectedSectionId === section.id ? 50 : 1)
                    }}
                  >
                    {/* Indicador de Selección */}
                    {selectedSectionId === section.id && showEditorChrome && (
                      <div className="absolute -left-1 top-0 bottom-0 w-1 bg-blue-500 z-50 rounded-full selection-indicator" />
                    )}
                    {section.type === 'products' && (
                      <ProductsModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        products={products}
                        isDevMode={isDevMode}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'hero' && (
                      <HeroModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        logoUrl={logoUrl}
                        logoWhiteUrl={logoWhiteUrl}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'hero2' && (
                      <Hero2Module 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'features' && (
                      <FeaturesModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'about' && (
                      <AboutModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'process' && (
                      <ProcessModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'gallery' && (
                      <GalleryModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        content={section.content}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'video' && (
                      <VideoModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'testimonials' && (
                      <TestimonialsModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'products_showcase' && (
                      <ProductsShowcaseModule 
                        moduleId={section.id}
                        content={section.content}
                        settingsValues={finalSettings}
                        products={products}
                        isActuallyEditor={!isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'stats' && (
                      <StatsModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'team' && (
                      <TeamModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'pricing' && (
                      <PricingModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'faq' && (
                      <FAQModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'contact' && (
                      <ContactModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'genius_web_wa' && (
                      <GeniusWebWaModule
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        renderMode={isCleanPreviewMode ? 'preview' : 'editor'}
                      />
                    )}
                    {section.type === 'clients' && (
                      <ClientsModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        customers={customers}
                        isDevMode={isDevMode}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'trusted_logos' && (
                      <TrustedLogosModule
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        companies={trustedCompanyLogos}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'cta' && (
                      <CTAModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'dynamic_cards' && (
                      <DynamicCardsModule
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'newsletter' && (
                      <NewsletterModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'conversion' && (section.templateId === 'mod_header_1' || section.id.startsWith('mod_header_1')) && (
                      <HeaderModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {(section.type === 'navegacion' || section.type === 'menu') && (
                      <MenuModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        logoUrl={logoUrl}
                        logoWhiteUrl={logoWhiteUrl}
                        isPreviewMode={isCleanPreviewMode}
                        isEditorCanvas={!isCleanPreviewMode}
                        isFullscreenPreview={isFullscreenPreview}
                        constructorViewport={viewport}
                        automaticMenuItems={automaticMenuItems}
                        stackedTopOffset={topOffset}
                      />
                    )}
                    {(section.type === 'footer') && (
                      <FooterModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        logoUrl={logoUrl}
                        logoWhiteUrl={logoWhiteUrl}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {(section.type === 'navegacion') && (section.templateId === 'mod_footer_1' || section.id.startsWith('mod_footer_1')) && (
                      <FooterModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        logoUrl={logoUrl}
                        logoWhiteUrl={logoWhiteUrl}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {section.type === 'spacer' && (
                      <SpacerModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isCleanPreviewMode}
                      />
                    )}
                    {(section.type === 'bento' || section.templateId === 'mod_bento_1' || section.id.startsWith('mod_bento_1') || (section.type === 'content' && section.templateId === 'mod_bento_1')) && (
                      <BentoModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        content={section.content}
                        onSettingChange={onSettingChange}
                        isPreviewMode={isCleanPreviewMode}
                        previewScale={effectivePreviewScale}
                        constructorViewport={viewport}
                        onOpenBentoGenerator={onOpenBentoGenerator}
                      />
                    )}
                    {section.type === 'composition_section' && (
                      <CompositionSectionModule
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        content={section.content}
                        isPreviewMode={isCleanPreviewMode}
                        selectedElementId={showEditorChrome && selectedSectionId === section.id ? selectedCompositionElementId : null}
                        onElementSelect={showEditorChrome ? (elementId) => {
                          selectCompositionElement(section.id, elementId);
                        } : undefined}
                      />
                    )}
                    {/* Fallback debug for unrendered modules */}
                    {!['products', 'products_showcase', 'hero', 'hero2', 'features', 'about', 'process', 'gallery', 'video', 'testimonials', 'stats', 'team', 'pricing', 'faq', 'contact', 'genius_web_wa', 'clients', 'trusted_logos', 'cta', 'dynamic_cards', 'newsletter', 'conversion', 'navegacion', 'menu', 'footer', 'spacer', 'bento', 'composition_section', 'comparative'].includes(section.type) && (
                      <div className="p-8 border-2 border-dashed border-rose-200 rounded-2xl bg-rose-50 text-rose-500 text-center">
                        <p className="font-bold">Módulo no reconocido: {section.type}</p>
                        <p className="text-xs opacity-60">ID: {section.id} | Template: {section.templateId}</p>
                      </div>
                    )}
                    {section.type === 'comparative' && (
                      <ComparisonModule 
                        moduleId={section.id}
                        settingsValues={finalSettings}
                        preview={isCleanPreviewMode}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      {canUsePreviewZoom && (
        <div
          className="fixed bottom-5 right-5 z-[130] flex flex-col items-end gap-3"
          data-no-preview-pan="true"
        >
          {showMinimap && (
            <div
              className="rounded-2xl border border-border/60 bg-surface/90 p-2 shadow-xl backdrop-blur-md"
              data-no-preview-pan="true"
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-text/50">
                  <Map size={11} />
                  Mapa
                </div>
                <button
                  type="button"
                  onClick={() => setIsMinimapHidden(true)}
                  className="rounded-md px-1.5 py-0.5 text-[9px] font-bold text-text/35 transition hover:bg-secondary hover:text-text"
                  title="Ocultar minimapa"
                  aria-label="Ocultar minimapa"
                >
                  ocultar
                </button>
              </div>
              <div
                className="relative overflow-hidden rounded-xl border border-primary/15 bg-secondary/70"
                style={{ width: minimapWidth, height: minimapHeight }}
                onPointerDown={(event) => {
                  setIsMinimapDragging(true);
                  event.currentTarget.setPointerCapture?.(event.pointerId);
                  moveViewportFromMinimap(event);
                }}
                onPointerMove={(event) => {
                  if (isMinimapDragging) moveViewportFromMinimap(event);
                }}
                onPointerUp={(event) => {
                  setIsMinimapDragging(false);
                  event.currentTarget.releasePointerCapture?.(event.pointerId);
                }}
                onPointerLeave={() => setIsMinimapDragging(false)}
              >
                <div className="absolute inset-2 rounded-lg border border-text/10 bg-surface/70" />
                <div
                  className="absolute rounded-md border-2 border-primary bg-primary/15 shadow-sm"
                  style={{
                    left: minimapViewport.x,
                    top: minimapViewport.y,
                    width: minimapViewport.width,
                    height: minimapViewport.height
                  }}
                />
              </div>
            </div>
          )}
          <div className="flex items-center gap-1 rounded-2xl border border-border/60 bg-surface/90 p-1.5 shadow-xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => setZoomAroundCenter(userZoom - 0.1)}
              className="rounded-xl p-2 text-text/60 transition hover:bg-secondary hover:text-primary disabled:opacity-30"
              disabled={userZoom <= zoomLimits.min}
              title="Alejar preview"
              aria-label="Alejar preview"
            >
              <ZoomOut size={15} />
            </button>
            <button
              type="button"
              onClick={() => setZoomAroundCenter(1)}
              className="min-w-14 rounded-xl px-2 py-2 text-[10px] font-black text-text/70 transition hover:bg-secondary hover:text-primary"
              title="Restablecer zoom"
              aria-label="Restablecer zoom"
            >
              {zoomPercent}%
            </button>
            <button
              type="button"
              onClick={() => setZoomAroundCenter(userZoom + 0.1)}
              className="rounded-xl p-2 text-text/60 transition hover:bg-secondary hover:text-primary disabled:opacity-30"
              disabled={userZoom >= zoomLimits.max}
              title="Acercar preview"
              aria-label="Acercar preview"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              onClick={() => setZoomAroundCenter(1)}
              className="rounded-xl p-2 text-text/40 transition hover:bg-secondary hover:text-primary"
              title="Reset 100%"
              aria-label="Reset 100%"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      )}
      </div>
    </ParallaxScrollContext.Provider>
  );
};
