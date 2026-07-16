'use client';

import { motion } from 'framer-motion';
import RiverConditionsBadge from '@/components/widgets/RiverConditionsBadge';
import {
  rivers,
  buildDirectionsUrl,
  type Outfitter,
  type OutfitterTag,
} from '@/lib/data/outfitters';

function Tag({ tag }: { tag: OutfitterTag }) {
  const styles =
    tag.kind === 'nps'
      ? 'bg-brand-sage/20 text-brand-forest'
      : 'bg-brand-sand text-brand-copper-dark';
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${styles}`}
    >
      {tag.label}
    </span>
  );
}

function OutfitterCard({ outfitter }: { outfitter: Outfitter }) {
  const contact = outfitter.phone ?? outfitter.email;

  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-brand-sand bg-white p-3.5 transition-colors hover:border-brand-forest hover:shadow-sm sm:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 font-semibold text-brand-charcoal">
          <span>{outfitter.name}</span>
          {outfitter.tags?.map((tag) => (
            <Tag key={tag.label} tag={tag} />
          ))}
        </div>
        <div className="mt-1 text-xs text-brand-stone">
          {outfitter.address}
          {contact ? ` · ${contact}` : ''}
        </div>
        <div className="mt-1 text-[11px] leading-relaxed text-brand-copper-dark">
          {outfitter.services}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 sm:min-w-[130px]">
        <span className="self-start rounded-full bg-brand-sage/15 px-2.5 py-1 text-center text-[11px] font-semibold whitespace-nowrap text-brand-forest sm:self-stretch">
          {outfitter.driveTime}
        </span>
        <div className="flex gap-1.5">
          <a
            href={buildDirectionsUrl(outfitter.destination)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-brand-forest px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-[#233826]"
          >
            📍 Directions
          </a>
          {outfitter.website && (
            <a
              href={outfitter.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-brand-sand px-3 py-1.5 text-[11px] font-medium text-brand-copper-dark transition-colors hover:bg-brand-sand/50"
            >
              Site
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FloatingOutfitters() {
  return (
    <div className="space-y-10">
      {rivers.map((river, index) => (
        <motion.section
          key={river.eddySlug}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
        >
          {/* River header — name + live conditions badge */}
          <div className="mb-5 flex flex-col gap-4 border-b border-brand-sand pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="flex items-center gap-2.5 font-serif text-2xl font-semibold text-brand-forest">
                <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand-forest" />
                {river.name}
              </h3>
              <p className="mt-1 text-sm text-brand-stone italic">
                {river.waterClass} · {river.meta}
              </p>
            </div>
            <RiverConditionsBadge
              river={river.eddySlug}
              name={river.name}
              className="sm:shrink-0"
            />
          </div>

          {/* Outfitters */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {river.outfitters.map((outfitter) => (
              <OutfitterCard
                key={`${outfitter.name}-${outfitter.destination}`}
                outfitter={outfitter}
              />
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
