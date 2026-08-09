const moderationPath = /^\/moderar\/([^/?#]+)\/?$/;

/**
 * Resolves the moderation token from the public URL represented inside the
 * published Viewer. The Viewer itself is hosted at constructor.solutium.app,
 * so its browser pathname is not the public pathname.
 */
export const resolveSpecialEventModerationToken = (
  pathname: string,
  search: string
): string => {
  const publishedPath = new URLSearchParams(search).get('published_path') || pathname;
  const match = publishedPath.match(moderationPath);
  if (!match) return '';

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};
