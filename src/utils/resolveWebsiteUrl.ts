/**
 * Returns a safe absolute URL for opening in a new tab, or null if invalid / empty.
 */
export const resolveWebsiteUrl = (raw: string | null | undefined): string | null => {
  if (raw == null || typeof raw !== 'string') return null;
  const t = raw.trim();
  if (!t) return null;
  try {
    const href = /^https?:\/\//i.test(t) ? t : `https://${t}`;
    const u = new URL(href);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.href;
  } catch {
    return null;
  }
};
