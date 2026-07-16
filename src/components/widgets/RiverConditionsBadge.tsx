'use client';

import { useEffect } from 'react';

/**
 * RiverConditionsBadge
 *
 * Embeds Eddy's official "Condition Badge" for a river (eddy.guide) — a live
 * flow / gauge / runnability badge.
 *
 * Mirrors Eddy's official embed snippet (from the widget "Code" tab):
 *   - a self-sizing <iframe> at https://eddy.guide/embed/badge/<slug>?theme=…
 *     (this is Eddy's dedicated embed URL, which permits framing — unlike the
 *     configurator page at /embed?widget=badge&river=…, which sends
 *     `frame-ancestors 'none'` and cannot be iframed)
 *   - a window "message" listener that resizes each badge to the height (and
 *     width) Eddy posts back. Installed once per page.
 */

const EDDY_BADGE_BASE = 'https://eddy.guide/embed/badge/';

interface EddyResizeMessage {
  type?: string;
  height?: number;
  width?: number;
}

/** Install Eddy's auto-resize listener once per page (mirrors Eddy's official script). */
function useEddyEmbedResizer() {
  useEffect(() => {
    const w = window as typeof window & { __eddyEmbedResizer?: number };
    if (w.__eddyEmbedResizer) return;
    w.__eddyEmbedResizer = 1;

    const onMessage = (e: MessageEvent) => {
      const d = e.data as EddyResizeMessage | null;
      if (!d || d.type !== 'eddy-embed:resize' || typeof d.height !== 'number') return;
      const frames = document.querySelectorAll<HTMLIFrameElement>('iframe[data-eddy-embed]');
      frames.forEach((frame) => {
        if (frame.contentWindow === e.source) {
          frame.style.height = `${d.height}px`;
          if (typeof d.width === 'number') frame.style.width = `${d.width}px`;
        }
      });
    };

    window.addEventListener('message', onMessage);
    // Left installed for the page lifetime — badges may resize repeatedly, and a
    // single shared listener serves every badge on the page.
  }, []);
}

export interface RiverConditionsBadgeProps {
  /** Eddy river slug, e.g. "huzzah" */
  river: string;
  /** Display name, used for the accessible iframe title */
  name: string;
  /** Eddy badge theme */
  theme?: 'light' | 'dark';
  className?: string;
}

export default function RiverConditionsBadge({
  river,
  name,
  theme = 'light',
  className = '',
}: RiverConditionsBadgeProps) {
  useEddyEmbedResizer();
  const src = `${EDDY_BADGE_BASE}${encodeURIComponent(river)}?theme=${theme}`;

  return (
    <iframe
      src={src}
      data-eddy-embed=""
      title={`${name} — Condition Badge from Eddy`}
      loading="lazy"
      width={280}
      className={className}
      style={{
        border: 'none',
        overflow: 'hidden',
        display: 'inline-block',
        verticalAlign: 'middle',
        maxWidth: '100%',
      }}
    />
  );
}
