"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PropertyPhoto } from "@/lib/content/property";
import { getUnitUrl } from "@/lib/utils/slugToUrl";

export function Lightbox({
  images,
  index,
  onChange,
  onClose,
}: {
  images: PropertyPhoto[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const current = images[index];
  useEffect(() => {
    const el = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    el?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      el?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  if (!current) return null;
  const move = (n: number) =>
    onChange((index + n + images.length) % images.length);
  return (
    <dialog
      ref={dialog}
      aria-label="Property photographs"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          move(-1);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          move(1);
        }
      }}
      className="photo-dialog"
    >
      <div className="flex justify-between items-center p-4 sm:px-8">
        <span aria-live="polite">
          {index + 1} / {images.length}
        </span>
        <button
          autoFocus
          className="min-h-12 px-4 border border-white/40"
          onClick={onClose}
        >
          Close ×
        </button>
      </div>
      <div className="relative min-h-0 flex-1 mx-4 sm:mx-16">
        <Image
          src={current.src}
          alt={current.alt}
          fill
          sizes="95vw"
          className="object-contain"
        />
      </div>
      <div className="flex items-center gap-4 justify-between p-4 sm:px-8">
        <button
          className="min-h-12 px-4 border border-white/40"
          aria-label="Previous photograph"
          onClick={() => move(-1)}
        >
          ←
        </button>
        <div className="text-center text-sm" aria-live="polite">
          <p>{current.caption || current.alt}</p>
          {current.unitSlug && (
            <Link
              className="underline block mt-1"
              href={getUnitUrl(current.unitSlug)}
            >
              View this stay
            </Link>
          )}
        </div>
        <button
          className="min-h-12 px-4 border border-white/40"
          aria-label="Next photograph"
          onClick={() => move(1)}
        >
          →
        </button>
      </div>
    </dialog>
  );
}
