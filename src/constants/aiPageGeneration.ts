export const AI_PAGE_GENERATION_ENABLED = true;
export const AI_REFERENCE_PAGE_GENERATION_ENABLED = false;
export const AI_FORM_PAGE_GENERATION_ENABLED = true;

export type AIPageCreationMode = 'instructions' | 'reference_url';

export const AI_PAGE_CREATION_VISIBLE_MODES: AIPageCreationMode[] = [
  ...(AI_FORM_PAGE_GENERATION_ENABLED ? ['instructions' as const] : []),
  ...(AI_REFERENCE_PAGE_GENERATION_ENABLED ? ['reference_url' as const] : [])
];

export const AI_PAGE_CREATION_DEFAULT_MODE: AIPageCreationMode =
  AI_PAGE_CREATION_VISIBLE_MODES[0] || 'instructions';

export const AI_PAGE_CREATION_HAS_MODE_SELECTOR =
  AI_PAGE_CREATION_VISIBLE_MODES.length > 1;
