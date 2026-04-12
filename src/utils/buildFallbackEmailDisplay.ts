/**
 * Display-only email when API omits email: sanitized `companyName` + "@gmail.com".
 * Not used as a real mailto target.
 */
export const buildFallbackEmailDisplay = (companyName: string): string => {
  const local = companyName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9._+-]/g, '');

  const safe = local.length > 0 ? local : 'company';
  return `${safe}@gmail.com`;
};
