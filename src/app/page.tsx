import HomeClient, {
  type HomeUnit,
  type HomeReview,
  type HomeImage,
} from './HomeClient';
import {
  getAllUnits,
  getFeaturedReviews,
  getAllGalleryImages,
} from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/client';
import { getUnitUrl } from '@/lib/utils/slugToUrl';
import type { RentalUnit, SanityImage } from '@/lib/sanity/schemas';

// Fallback tiles used when Sanity returns no units (keeps the homepage
// meaningful in dev / empty-dataset environments).
const FALLBACK_UNITS: HomeUnit[] = [
  {
    name: 'Cozy Cottage',
    description:
      'Full kitchen, washer/dryer, perfect for couples or small families seeking comfort in nature',
    href: '/cozycottage',
    features: ['Full Kitchen', 'Washer/Dryer', 'Sleeps 4'],
    gradient: 'from-brand-sage/30 to-brand-sage/10',
  },
  {
    name: 'The Original Airstream',
    description:
      'Vintage glamping at its finest with outdoor soaking tub and private deck under the stars',
    href: '/airstream',
    features: ['Outdoor Tub', 'Private Deck', 'Vintage Charm'],
    gradient: 'from-brand-copper/20 to-brand-copper/5',
  },
  {
    name: 'The Sebastian',
    description:
      'Rustic charm meets modern comfort with outdoor clawfoot tubs and room for the family',
    href: '/sebastian',
    features: ['Clawfoot Tubs', 'Sleeps 4', 'Forest Views'],
    gradient: 'from-brand-sky/20 to-brand-sky/5',
  },
];

const CARD_GRADIENTS = [
  'from-brand-sage/30 to-brand-sage/10',
  'from-brand-copper/20 to-brand-copper/5',
  'from-brand-sky/20 to-brand-sky/5',
];

function unitToTile(unit: RentalUnit, index: number): HomeUnit {
  const image = unit.featuredImage?.image ?? unit.images?.[0]?.image;
  const imageUrl = image ? urlFor(image).width(800).height(600).url() : undefined;
  const imageAlt =
    unit.featuredImage?.alt ?? unit.images?.[0]?.alt ?? unit.name;

  const features: string[] = [];
  if (unit.maxGuests) features.push(`Sleeps ${unit.maxGuests}`);
  if (unit.bedrooms) {
    features.push(`${unit.bedrooms} ${unit.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}`);
  }
  const topAmenity = unit.amenities?.[0]?.name;
  if (topAmenity && features.length < 3) features.push(topAmenity);

  return {
    name: unit.name,
    href: getUnitUrl(unit.slug.current),
    description: unit.shortDescription ?? '',
    features: features.slice(0, 3),
    imageUrl,
    imageAlt,
    gradient: CARD_GRADIENTS[index % CARD_GRADIENTS.length],
  };
}

async function loadUnits(): Promise<HomeUnit[]> {
  try {
    const all = await getAllUnits();
    const picked = all
      .filter((u) => u.slug.current !== 'book-the-farm')
      .sort((a, b) => {
        if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
        return 0;
      })
      .slice(0, 3);
    if (picked.length === 0) return FALLBACK_UNITS;
    return picked.map(unitToTile);
  } catch {
    return FALLBACK_UNITS;
  }
}

async function loadReview(): Promise<HomeReview | null> {
  try {
    const reviews = await getFeaturedReviews();
    const first = reviews[0];
    if (!first) return null;
    return {
      text: first.reviewText,
      guestName: first.guestName,
      rating: first.rating,
    };
  } catch {
    return null;
  }
}

interface GalleryEntry {
  unitName: string;
  unitSlug: string;
  images: Array<{
    image: SanityImage;
    caption?: string;
    alt?: string;
    featured?: boolean;
  }> | null;
}

async function loadImagery(): Promise<{
  heroImage: HomeImage | null;
  experienceImages: HomeImage[];
}> {
  try {
    const gallery = (await getAllGalleryImages()) as GalleryEntry[];
    const flat = gallery.flatMap((g) =>
      (g.images ?? []).map((img) => ({
        image: img.image,
        alt: img.alt ?? g.unitName,
        featured: !!img.featured,
      }))
    );

    // Hero: first featured image, else the first image overall.
    const heroSource = flat.find((i) => i.featured) ?? flat[0];
    const heroImage: HomeImage | null = heroSource
      ? {
          url: urlFor(heroSource.image).width(2000).height(1200).fit('crop').url(),
          alt: heroSource.alt,
        }
      : null;

    // Experience grid: up to 4 distinct images, featured first.
    const ordered = [...flat].sort(
      (a, b) => Number(b.featured) - Number(a.featured)
    );
    const picks = ordered
      .filter((i) => i !== heroSource) // avoid reusing the hero shot
      .slice(0, 4);
    const experienceImages: HomeImage[] = picks.map((i) => ({
      url: urlFor(i.image).width(800).height(800).fit('crop').url(),
      alt: i.alt,
    }));

    return { heroImage, experienceImages };
  } catch {
    return { heroImage: null, experienceImages: [] };
  }
}

export default async function Page() {
  const [units, review, imagery] = await Promise.all([
    loadUnits(),
    loadReview(),
    loadImagery(),
  ]);
  return (
    <HomeClient
      units={units}
      review={review}
      heroImage={imagery.heroImage}
      experienceImages={imagery.experienceImages}
    />
  );
}
