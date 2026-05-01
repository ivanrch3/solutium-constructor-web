
export const DEBUG_RENDER = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug_render') === 'true';

export const logDebug = (tag: string, ...args: any[]) => {
  if (DEBUG_RENDER) {
    console.log(tag, ...args);
  }
};
