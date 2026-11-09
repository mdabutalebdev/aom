"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/**
 * Carousel — generic embla-backed carousel: prev/next arrows + dot
 * indicators, hidden automatically when there's nothing to scroll. Pass
 * slide content as children; `slideClassName` controls how many are visible
 * per breakpoint (default: ~1 on mobile, 2 on tablet, 4 on desktop).
 */
const Carousel = ({
  children,
  slideClassName = "flex-[0_0_85%] sm:flex-[0_0_46%] lg:flex-[0_0_23%]",
  className = "",
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback((api) => {
    setSelectedIndex(api.selectedScrollSnap());
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const showControls = scrollSnaps.length > 1;

  return (
    <div className={className}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 sm:gap-6">
          {React.Children.map(children, (child) => (
            <div className={`min-w-0 shrink-0 grow-0 ${slideClassName}`}>{child}</div>
          ))}
        </div>
      </div>

      {showControls && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Previous"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-200 text-primary-600 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <FiChevronLeft />
          </button>

          <div className="flex items-center gap-2">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === selectedIndex ? "w-6 bg-primary-600" : "w-2 bg-primary-200"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Next"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-200 text-primary-600 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default Carousel;
