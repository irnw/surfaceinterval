"use client";

import { useEffect, useState } from "react";

export default function GalleryLightbox({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (activeIndex === null) return;

      if (e.key === "Escape") {
        setActiveIndex(null);
      }

      if (e.key === "ArrowRight") {
        setActiveIndex((prev) =>
          prev === null ? prev : (prev + 1) % images.length
        );
      }

      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) =>
          prev === null ? prev : (prev - 1 + images.length) % images.length
        );
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, images.length]);

  if (!images.length) return null;

  return (
    <>
      <div className="gallery-grid">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            className="gallery-tile"
            onClick={() => setActiveIndex(index)}
          >
            <img src={image} alt={`${title} ${index + 1}`} />
          </button>
        ))}
      </div>

      {activeIndex !== null ? (
        <div
          className="lightbox-overlay"
          onClick={() => setActiveIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setActiveIndex(null)}
            >
              Close
            </button>

            <button
              type="button"
              className="lightbox-nav lightbox-prev"
              onClick={() =>
                setActiveIndex((prev) =>
                  prev === null ? prev : (prev - 1 + images.length) % images.length
                )
              }
            >
              ‹
            </button>

            <img
              className="lightbox-image"
              src={images[activeIndex]}
              alt={`${title} ${activeIndex + 1}`}
            />

            <button
              type="button"
              className="lightbox-nav lightbox-next"
              onClick={() =>
                setActiveIndex((prev) =>
                  prev === null ? prev : (prev + 1) % images.length
                )
              }
            >
              ›
            </button>

            <div className="lightbox-counter">
              {activeIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}