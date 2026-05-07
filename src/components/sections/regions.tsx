"use client";

import { FadeIn } from "@/components/ui/fade-in";

const cities = [
  {
    name: "Nairobi",
    count: "4,200+",
    image: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=600&q=80",
  },
  {
    name: "Mombasa",
    count: "1,850+",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80",
  },
  {
    name: "Kisumu",
    count: "980+",
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80",
  },
  {
    name: "Nakuru",
    count: "760+",
    image: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600&q=80",
  },
  {
    name: "Eldoret",
    count: "640+",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80",
  },
  {
    name: "Thika",
    count: "520+",
    image: "https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=600&q=80",
  },
  {
    name: "Nyeri",
    count: "410+",
    image: "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=600&q=80",
  },
  {
    name: "Kisii",
    count: "320+",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80",
  },
];

export function Regions() {
  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="flex justify-between items-end flex-wrap gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">Search by city</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Rentnet listings across Kenya
            </p>
          </div>
          <a href="/listings" className="text-sm font-semibold text-primary hover:underline underline-offset-4">
            All cities →
          </a>
        </FadeIn>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {cities.map((city, i) => (
            <FadeIn key={city.name} delay={i * 0.06} direction="up">
            <a
              href={`/listings?city=${encodeURIComponent(city.name)}`}
              className="group relative rounded-2xl overflow-hidden cursor-pointer block"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-bold text-sm leading-tight">{city.name}</p>
                <p className="text-white/70 text-xs mt-0.5">{city.count} properties</p>
              </div>

              {/* Purple hover ring */}
              <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 ring-primary transition-all duration-300" />
            </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
