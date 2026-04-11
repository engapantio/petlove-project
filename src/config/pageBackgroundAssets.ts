/**
 * Reference map for images in `/public/images`.
 * - Login / Registration: applied on each page’s scoped `.hero` in `*Page.module.css`.
 * - Main loader: `src/styles/pageHeroBackgrounds.css` (`.appRouteLoading--main`).
 * - Home: scoped `.hero` in `HomePage.module.css`.
 * Add Pet / 404: wire only when those screens are implemented beyond placeholders.
 */

export type PageBackgroundBand = {
  readonly x1: string;
  readonly x2?: string;
};

export type PageResponsiveBackgrounds = {
  readonly mobile: PageBackgroundBand;
  readonly tablet: PageBackgroundBand;
  readonly desktop: PageBackgroundBand;
};

/** Tablet and desktop share one file pair (404). */
export type PageResponsiveWithSharedTabletDesktop = {
  readonly mobile: PageBackgroundBand;
  readonly tabletDesktop: PageBackgroundBand;
};

export const PAGE_RESPONSIVE_BACKGROUNDS = {
  login: {
    mobile: { x1: '/images/Mobile-Login-image.webp', x2: '/images/Mobile-Login-image@2x.webp' },
    tablet: { x1: '/images/Tablet-Login-image.webp', x2: '/images/Tablet-Login-image@2x.webp' },
    desktop: { x1: '/images/Desktop-Login-image.webp', x2: '/images/Desktop-Login-image@2x.webp' },
  },
  registration: {
    mobile: {
      x1: '/images/Mobile-Registration-image.webp',
      x2: '/images/Mobile-Registration-image@2x.webp',
    },
    tablet: {
      x1: '/images/Tablet-Registration-image.webp',
      x2: '/images/Tablet-Registration-image@2x.webp',
    },
    desktop: {
      x1: '/images/Desktop-Registration-image.webp',
      x2: '/images/Desktop-Registration-image@2x.webp',
    },
  },
  home: {
    mobile: { x1: '/images/Mobile-Home-image.webp', x2: '/images/Mobile-Home-image@2x.webp' },
    tablet: { x1: '/images/Tablet-Home-image.webp', x2: '/images/Tablet-Home-image@2x.webp' },
    desktop: { x1: '/images/Desktop-Home-image.webp', x2: '/images/Desktop-Home-image@2x.webp' },
  },
  addPet: {
    mobile: { x1: '/images/Mobile-Add_pet-image.webp', x2: '/images/Mobile-Add_pet-image@2x.webp' },
    tablet: { x1: '/images/Tablet-Add_pet-image.webp', x2: '/images/Tablet-Add_pet-image@2x.webp' },
    desktop: { x1: '/images/Desktop-Add_pet-image.webp', x2: '/images/Desktop-Add_pet-image@2x.webp' },
  },
  mainLoader: {
    mobile: { x1: '/images/Mobile-Main-image.webp', x2: '/images/Mobile-Main-image@2x.webp' },
    tablet: { x1: '/images/Tablet-Main-image.webp', x2: '/images/Tablet-Main-image@2x.webp' },
    desktop: { x1: '/images/Desktop-Main-image.webp', x2: '/images/Desktop-Main-image@2x.webp' },
  },
} as const satisfies Record<string, PageResponsiveBackgrounds>;

export const PAGE_NOT_FOUND_BACKGROUNDS = {
  mobile: { x1: '/images/Mobile-404_zero-image.webp', x2: '/images/Mobile-404_zero-image@2x.webp' },
  tabletDesktop: {
    x1: '/images/Desktop&Tablet-404_zero-image.webp',
    x2: '/images/Desktop&Tablet-404_zero-image@2x.webp',
  },
} as const satisfies PageResponsiveWithSharedTabletDesktop;
