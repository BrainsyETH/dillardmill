import { getUnitBySlug } from '@/lib/sanity/queries';
import { EmbedBookingClient } from '@/components/booking/EmbedBookingClient';

interface EmbedBookingPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function toParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function EmbedBookingPage({ searchParams }: EmbedBookingPageProps) {
  const params = (await searchParams) ?? {};
  const slug = toParam(params.unit) ?? 'book-the-farm';
  const checkIn = toParam(params.checkIn);
  const checkOut = toParam(params.checkOut);
  const guestsRaw = toParam(params.guests);
  const guests = guestsRaw ? Number.parseInt(guestsRaw, 10) : undefined;

  const unit = await getUnitBySlug(slug);

  if (!unit) {
    return (
      <div className="flex items-center justify-center min-h-dvh px-6">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-2xl text-brand-forest mb-2">
            Booking unavailable
          </h1>
          <p className="text-brand-stone text-sm">
            We couldn&apos;t find that rental. Please contact us at
            <a href="tel:+13148434321" className="text-brand-copper ml-1">
              (314) 843-4321
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <EmbedBookingClient
      unit={{
        _id: unit._id,
        name: unit.name,
        slug: unit.slug,
        basePrice: unit.basePrice || 0,
        cleaningFee: unit.cleaningFee || 0,
        baseGuests: unit.baseGuests,
        extraGuestFee: unit.extraGuestFee,
        petsAllowed: unit.petsAllowed,
        maxPets: unit.maxPets,
        petFee: unit.petFee,
        minStay: unit.minStay,
        maxGuests: unit.maxGuests || 1,
      }}
      initialCheckIn={checkIn}
      initialCheckOut={checkOut}
      initialGuests={Number.isFinite(guests) ? guests : undefined}
    />
  );
}
