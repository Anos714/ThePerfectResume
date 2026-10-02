import { Star, Quote } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  hue: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "The AI copilot rewrote my bullet points in seconds and they actually sounded like me — but sharper. I landed three interviews in a week.",
    name: "Sarah Mitchell",
    role: "Product Designer",
    initials: "SM",
    hue: "from-brand-400 to-brand-600",
  },
  {
    quote:
      "I've tried every resume builder out there. Nothing comes close to the pixel-perfect output here. It exported exactly as designed.",
    name: "James Okafor",
    role: "Backend Engineer",
    initials: "JO",
    hue: "from-fuchsia-400 to-fuchsia-600",
  },
  {
    quote:
      "The ATS check is a game changer. It flagged small issues that were silently killing my applications before.",
    name: "Priya Sharma",
    role: "Marketing Lead",
    initials: "PS",
    hue: "from-sky-400 to-sky-600",
  },
  {
    quote:
      "From zero to a polished resume in under 15 minutes. The templates are genuinely beautiful and I didn't touch a design tool.",
    name: "Daniel Reyes",
    role: "Frontend Developer",
    initials: "DR",
    hue: "from-emerald-400 to-emerald-600",
  },
  {
    quote:
      "Finally a builder that respects my time. Live preview, smart suggestions, one-click export — it just works.",
    name: "Amelia Chen",
    role: "Data Analyst",
    initials: "AC",
    hue: "from-amber-400 to-amber-600",
  },
  {
    quote:
      "The best part is the detail. Every spacing, every font — it feels like a senior designer hand-built it.",
    name: "Lucas Meyer",
    role: "Growth Manager",
    initials: "LM",
    hue: "from-rose-400 to-rose-600",
  },
];

export function Testimonials() {
  const doubled = [...testimonials, ...testimonials];

  return (
    <section
      id="testimonials"
      className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-72 -translate-y-1/2 bg-brand-600/10 blur-[120px]" />
      <Container className="relative">
        <Reveal>
          <SectionHeading
            eyebrow="Testimonials"
            title={
              <>
                Loved by <span className="text-gradient">job seekers</span>
              </>
            }
            description="Thousands of people have built their perfect resume with us. Here's what they're saying."
          />
        </Reveal>
      </Container>

      <Reveal className="mt-16">
        <div className="group relative">
          <Fade />
          <div className="flex w-max animate-marquee gap-4 pr-4 group-hover:[animation-play-state:paused]">
            {doubled.map((t, i) => (
              <TestimonialCard key={`${t.name}-${i}`} testimonial={t} />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="glass w-[320px] shrink-0 rounded-3xl p-6 sm:w-[380px] sm:p-7">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-amber-400 text-amber-400"
            />
          ))}
        </div>
        <Quote className="h-6 w-6 text-white/15" />
      </div>
      <blockquote className="mt-5 text-[15px] leading-relaxed text-foreground/90">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br text-sm font-semibold text-white",
            testimonial.hue,
          )}
        >
          {testimonial.initials}
        </span>
        <div>
          <div className="text-sm font-semibold">{testimonial.name}</div>
          <div className="text-xs text-muted">{testimonial.role}</div>
        </div>
      </figcaption>
    </figure>
  );
}

function Fade() {
  return (
    <>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-32" />
    </>
  );
}
