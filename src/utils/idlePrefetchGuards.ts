/** Guards for warming default News / Notices data without clobbering URL-driven state. */

export function skipDefaultNewsPrefetchFromLocation(): boolean {
  const { pathname, search } = window.location;
  if (!pathname.endsWith('/news')) return false;
  const params = new URLSearchParams(search);
  if ((params.get('keyword') ?? '').trim().length > 0) return true;
  const pageRaw = params.get('page');
  const page = pageRaw ? Number(pageRaw) : 1;
  return Number.isFinite(page) && page !== 1;
}

/** Default Notices route is `/notices` with no query; any query encodes filters/sort/page. */
export function skipDefaultNoticesPrefetchFromLocation(): boolean {
  const { pathname, search } = window.location;
  if (!pathname.endsWith('/notices')) return false;
  return search.replace(/^\?/, '').trim().length > 0;
}
