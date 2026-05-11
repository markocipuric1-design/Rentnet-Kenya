import { ArrowRight } from "lucide-react";

interface AdBannerProps {
  label?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  cta: string;
  href?: string;
  accent?: string;
  logo?: React.ReactNode;
  logoImage?: string;
  badge?: string;
}

export function AdBanner({
  label = "Ad",
  eyebrow,
  title,
  description,
  cta,
  href = "#",
  logo,
  logoImage,
  badge,
}: AdBannerProps) {
  return (
    <div className="px-6 py-4">
      <div className="max-w-6xl mx-auto">
        <a
          href={href}
          className="group relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-card border border-border rounded-2xl px-5 sm:px-6 py-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
        >
          {/* Dot pattern */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.52_0.27_293/0.035)_1px,transparent_1px)] bg-[length:20px_20px]" />
          </div>

          {/* Logo / icon slot */}
          {logoImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoImage} alt="" className="relative flex-shrink-0 w-14 h-14 rounded-2xl object-cover" />
          ) : logo ? (
            <div className="relative flex-shrink-0 w-14 h-14 rounded-2xl bg-accent flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-300">
              {logo}
            </div>
          ) : null}

          {/* Text */}
          <div className="relative flex-1 text-center sm:text-left">
            {eyebrow && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">
                {eyebrow}
              </span>
            )}
            <h3 className="font-bold text-foreground text-base leading-snug group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-lg">
              {description}
            </p>
          </div>

          {/* AD label + Badge + CTA — stacked so label never overlaps button */}
          <div className="relative flex flex-col items-end gap-2 flex-shrink-0">
            <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest border border-border px-2 py-0.5 rounded-md">
              {label}
            </span>
            <div className="flex items-center gap-3">
              {badge && (
                <span className="hidden md:block text-xs font-semibold bg-accent text-primary px-3 py-1.5 rounded-full">
                  {badge}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold text-sm px-5 py-2.5 rounded-xl group-hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
                {cta} <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
              </span>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
