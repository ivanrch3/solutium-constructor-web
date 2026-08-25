export type HeroLayoutOrder = {
  mobile: ['content', 'visual'] | ['visual', 'content'];
  desktop: ['content', 'visual'] | ['visual', 'content'];
};

export const resolveHeroLayoutOrder = (layout: unknown): HeroLayoutOrder =>
  layout === 'reverse'
    ? { mobile: ['visual', 'content'], desktop: ['visual', 'content'] }
    : { mobile: ['content', 'visual'], desktop: ['content', 'visual'] };
