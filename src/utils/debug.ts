
export const isRenderDebugEnabled = () => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return (
    params.get('debug_render') === 'true' ||
    params.get('debug') === 'render' ||
    localStorage.getItem('SOLUTIUM_DEBUG_RENDER') === 'true'
  );
};

export const logDebug = (tag: string, ...args: any[]) => {
  if (isRenderDebugEnabled()) {
    console.log(tag, ...args);
  }
};

export const renderDebugLog = logDebug;
