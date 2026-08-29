export const PREVIEW_AUTO_ZOOM_STORAGE_KEY = 'solutium_constructor_preview_auto_zoom_v1';
export const MIN_AUTO_ZOOM = 0.65;
export const MAX_AUTO_ZOOM = 2.5;
export const PREVIEW_AUTO_ZOOM_EPSILON = 0.005;

export type PreviewAutoFocusTarget = {
  id: string;
  type: 'bento' | string;
  preferredPadding?: number;
};

export const canUsePreviewAutoFocus = (enabled: boolean, viewport: string) => enabled && viewport === 'desktop';
export const isCurrentPreviewAutoFocusRequest = (requestedId: string, activeId: string | null) => requestedId === activeId;
export const shouldApplyPreviewAutoZoom = (nextZoom: number, currentZoom: number, allowZoomIn: boolean) => (
  Number.isFinite(nextZoom) && Number.isFinite(currentZoom) &&
  Math.abs(nextZoom - currentZoom) >= PREVIEW_AUTO_ZOOM_EPSILON &&
  (allowZoomIn || nextZoom < currentZoom)
);

type AutoZoomFitInput = {
  targetWidth: number;
  targetHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  currentZoom: number;
  minZoom: number;
  maxZoom: number;
  padding?: number;
  /** target rect is visual; these scales convert it back to logical preview px */
  currentEffectiveScale?: number;
  basePreviewScale?: number;
};

export const readPreviewAutoZoomPreference = (storage?: Pick<Storage, 'getItem'>): boolean => {
  try {
    return storage?.getItem(PREVIEW_AUTO_ZOOM_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
};

export const writePreviewAutoZoomPreference = (enabled: boolean, storage?: Pick<Storage, 'setItem'>) => {
  try {
    storage?.setItem(PREVIEW_AUTO_ZOOM_STORAGE_KEY, String(enabled));
  } catch {
    // Storage can be unavailable in private browsing or restricted previews.
  }
};

export const calculatePreviewAutoZoom = ({
  targetWidth,
  targetHeight,
  viewportWidth,
  viewportHeight,
  currentZoom,
  minZoom,
  maxZoom,
  padding = 48,
  currentEffectiveScale,
  basePreviewScale
}: AutoZoomFitInput) => {
  const safeCurrentZoom = Number.isFinite(currentZoom) ? currentZoom : 1;
  const safeMinZoom = Number.isFinite(minZoom) ? minZoom : MIN_AUTO_ZOOM;
  const safeMaxZoom = Number.isFinite(maxZoom) ? maxZoom : MAX_AUTO_ZOOM;
  if (![targetWidth, targetHeight, viewportWidth, viewportHeight].every(Number.isFinite)
    || targetWidth <= 0 || targetHeight <= 0 || viewportWidth <= 0 || viewportHeight <= 0) return safeCurrentZoom;
  const safePadding = Number.isFinite(padding) ? Math.max(0, padding) : 48;
  const usableWidth = Math.max(1, viewportWidth - (safePadding * 2));
  const usableHeight = Math.max(1, viewportHeight - (safePadding * 2));
  const hasScaleContext = Number.isFinite(currentEffectiveScale) && Number.isFinite(basePreviewScale);
  const safeEffectiveScale = hasScaleContext ? Math.max(0.001, currentEffectiveScale as number) : 1;
  const safeBaseScale = hasScaleContext ? Math.max(0.001, basePreviewScale as number) : 1;
  const logicalTargetWidth = targetWidth / safeEffectiveScale;
  const logicalTargetHeight = targetHeight / safeEffectiveScale;
  const fitRatio = hasScaleContext
    ? Math.min(usableWidth / (logicalTargetWidth * safeBaseScale), usableHeight / (logicalTargetHeight * safeBaseScale))
    : Math.min(usableWidth / targetWidth, usableHeight / targetHeight);
  const desiredEffectiveScale = safeEffectiveScale * fitRatio;
  const desiredUserZoom = hasScaleContext ? desiredEffectiveScale / safeBaseScale : safeCurrentZoom * fitRatio;
  const result = Math.min(safeMaxZoom, Math.max(safeMinZoom, Number(desiredUserZoom.toFixed(2))));
  return Number.isFinite(result) ? result : safeCurrentZoom;
};

export const getCenteredPreviewScroll = ({
  scrollLeft,
  scrollTop,
  clientWidth,
  clientHeight,
  viewportLeft,
  viewportTop,
  targetLeft,
  targetTop,
  targetWidth,
  targetHeight,
  maxScrollLeft = Number.POSITIVE_INFINITY,
  maxScrollTop = Number.POSITIVE_INFINITY
}: {
  scrollLeft: number;
  scrollTop: number;
  clientWidth: number;
  clientHeight: number;
  viewportLeft: number;
  viewportTop: number;
  targetLeft: number;
  targetTop: number;
  targetWidth: number;
  targetHeight: number;
  maxScrollLeft?: number;
  maxScrollTop?: number;
}) => {
  const safe = (value: number) => Number.isFinite(value) ? value : 0;
  return {
    left: Math.min(Number.isFinite(maxScrollLeft) ? Math.max(0, maxScrollLeft) : Number.POSITIVE_INFINITY, Math.max(0, safe(scrollLeft) + safe(targetLeft) - safe(viewportLeft) + (safe(targetWidth) / 2) - (safe(clientWidth) / 2))),
    top: Math.min(Number.isFinite(maxScrollTop) ? Math.max(0, maxScrollTop) : Number.POSITIVE_INFINITY, Math.max(0, safe(scrollTop) + safe(targetTop) - safe(viewportTop) + (safe(targetHeight) / 2) - (safe(clientHeight) / 2)))
  };
};
