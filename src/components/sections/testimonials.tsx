"use client";

import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  {
    name: "Amina Odhiambo", location: "Nairobi", avatar: "AO", rating: 5,
    text: "The fastest apartment search experience I've ever had. The agent responded within an hour and we had a viewing the next morning. I moved into my new place in Westlands within two weeks.",
    property: "Rented an apartment in Westlands",
  },
  {
    name: "Brian Mutua", location: "Mombasa", avatar: "BM", rating: 5,
    text: "We relocated from Nairobi and Rentnet made the whole process effortless. All the information in one place, verified listings and fast agent responses. Signed the agreement in under three weeks.",
    property: "Bought a house in Nyali",
  },
  {
    name: "Grace Wanjiku", location: "Kiambu", avatar: "GW", rating: 5,
    text: "Listing my apartment was incredibly easy. I posted the ad in the evening and had five serious enquiries by morning. Found a reliable tenant in just four days — highly recommend!",
    property: "Listed apartment in Kiambu",
  },
  {
    name: "James Kariuki", location: "Nakuru", avatar: "JK", rating: 4,
    text: "We were looking for a holiday home near Lake Nakuru and the platform offered great options. Accurate filters, honest photos — no unpleasant surprises during the viewing. Excellent experience.",
    property: "Bought a holiday home in Nakuru",
  },
  {
    name: "Fatuma Hassan", location: "Kisumu", avatar: "FH", rating: 5,
    text: "As a first-time buyer I was nervous about the whole process. The Rentnet team walked me through every step, from the search all the way to signing. I couldn't have done it without them!",
    property: "Bought her first home in Kisumu",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < count ? "fill-amber-400 text-amber-400" : "text-border"}`} />
      ))}
    </div>
  );
}

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", slidesToScroll: 1 });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end flex-wrap gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">What our clients say</h2>
            <p className="text-muted-foreground text-sm mt-1">Real experiences from real buyers, sellers and renters across Kenya</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => emblaApi?.scrollPrev()} disabled={!canScrollPrev}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => emblaApi?.scrollNext()} disabled={!canScrollNext}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {reviews.map((r) => (
              <div key={r.name}
                className="flex-none w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.33%-11px)] bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 hover:shadow-lg hover:shadow-primary/8 hover:border-primary/30 transition-all duration-300">
                <Stars count={r.rating} />
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  &ldquo;{r.text}&rdquo;
                </p>
                <div className="border-t border-border pt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {r.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.property}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-center mt-8">
          {reviews.map((_, i) => (
            <button key={i} onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === selectedIndex ? "bg-primary w-6" : "bg-border w-1.5"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
