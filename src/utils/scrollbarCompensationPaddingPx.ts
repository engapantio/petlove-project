/**
 * Pixels to add to `body` padding when hiding overflow so the viewport does not
 * jump when the classic scrollbar disappears.
 *
 * When `html` has `scrollbar-gutter: stable` (see `src/styles/global.css`), the
 * browser already reserves gutter width — adding scrollbar width again would
 * shift the layout when modals/menus lock scroll.
 */
export const scrollbarCompensationPaddingPx = (): number => {
  const html = document.documentElement;
  const gutter = window
    .getComputedStyle(html)
    .getPropertyValue('scrollbar-gutter')
    .trim()
    .toLowerCase();

  if (gutter.includes('stable')) {
    return 0;
  }

  const delta = window.innerWidth - html.clientWidth;
  return delta > 0 ? delta : 0;
};
