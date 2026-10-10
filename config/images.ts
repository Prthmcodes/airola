// Site photography. New images live in public/images/ as WebP, each with a 1200px-wide "-1200" variant.
// Set `ready: true` once both files for a slot are in public/images/; until then the current image is used.

export interface SiteImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  srcSet?: string;
  sizes?: string;
  // WebP candidates for a <picture> source, used with the JPG/PNG src as the fallback
  webpSrcSet?: string;
}

interface ImageSlot {
  ready: boolean;
  next: { file: string; width: number; height: number; alt: string };
  fallback: SiteImage;
}

// Resized WebP copies of the current photos (same artwork), in public/images/<stem>-<width>.webp
export const webpSet = (stem: string, widths: number[]) => widths.map(w => `/images/${stem}-${w}.webp ${w}w`).join(', ');

const slots = {
  // TODO: image pending (public/images/hero-guest-ready-bedroom.webp + -1200 variant)
  hero: {
    ready: false,
    next: { file: 'hero-guest-ready-bedroom', width: 2400, height: 1350, alt: 'A bright, freshly made guest-ready bedroom in a London short-let' },
    fallback: { src: '/hero-bg.jpg', width: 1252, height: 834, alt: 'Professional cleaning team', webpSrcSet: webpSet('hero-bg', [640, 960, 1252]) },
  },
  // TODO: image pending (public/images/why-host-ready-detail.webp + -1200 variant)
  why: {
    ready: false,
    next: { file: 'why-host-ready-detail', width: 1600, height: 1066, alt: 'A staged short-let kitchen counter with a welcome tray' },
    fallback: { src: '/why-choose.jpg', width: 1600, height: 1066, alt: 'Professional cleaners at work', webpSrcSet: webpSet('why-choose', [480, 800, 1200, 1600]) },
  },
  // TODO: image pending (public/images/how-photo-proof-illustrative.webp + -1200 variant)
  how: {
    ready: false,
    next: { file: 'how-photo-proof-illustrative', width: 1200, height: 1500, alt: 'Illustration of a phone showing a photo update of tidy rooms' },
    fallback: { src: '/how-works.jpg', width: 1600, height: 1066, alt: 'Cleaning professional using a vacuum on a sofa', webpSrcSet: webpSet('how-works', [480, 800, 1200, 1600]) },
  },
} satisfies Record<string, ImageSlot>;

const resolve = ({ ready, next, fallback }: ImageSlot, sizes: string): SiteImage => {
  if (!ready) return { ...fallback, sizes };
  const src = `/images/${next.file}.webp`;
  return {
    src,
    width: next.width,
    height: next.height,
    alt: next.alt,
    // A 1200px-wide original needs no separate variant in the srcset.
    ...(next.width > 1200 && { srcSet: `/images/${next.file}-1200.webp 1200w, ${src} ${next.width}w`, sizes }),
  };
};

export const SITE_IMAGES = {
  hero: resolve(slots.hero, '100vw'),
  why: resolve(slots.why, '(min-width: 1024px) 50vw, 100vw'),
  how: resolve(slots.how, '(min-width: 1024px) 50vw, 100vw'),
};
