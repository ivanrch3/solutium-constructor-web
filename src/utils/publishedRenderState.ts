export type PublishedRenderState = 'idle' | 'loading' | 'ready' | 'error';

export const canMountPublishedViewer = (
  isExternalRender: boolean,
  state: PublishedRenderState
) => !isExternalRender || state === 'ready';

export const shouldShowConstructorBranding = (isExternalRender: boolean) => !isExternalRender;
