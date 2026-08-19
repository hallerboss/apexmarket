import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const slides = [
  {
    img: "https://media.base44.com/images/public/6a8447d4dfbc61d89c33872d/c1a582fac_generated_6bd4c4e4.png",
    title: "Get more with an account",
    sub: "Enjoy exclusive benefits — deals, app-only coupons, and more.",
    cta: "Sign in",
    to: "/login",
  },
  {
    img: "https://media.base44.com/images/public/6a8447d4dfbc61d89c33872d/b4d672465_generated_e014edfb.png",
    title: "Electronic Sale — up to 30% off",
    sub: "A curated archive of objects worth owning, engineered for the modern ritual of commerce.",
    cta: "Shop Now",
    to: "/shop",
  },
  {
    img: "https://media.base44.com/images/public/6a8447d4dfbc61d89c33872d/148dc9c7d_generated_b5b068d8.png",
    title: "New Collection · 2024",
    sub: "Starting at $299.99. Discover this season's most-wanted pieces.",
    cta: "Hot Deals",
    to: "/shop?deals=1",
  },
];

export default function HeroCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  const go = (d) => setI((p) => (p + d + slides.length) % slides.length);

  return (
    <section className="relative w-full h-[340px] md:h-[440px] overflow-hidden bg-secondary">
      {slides.map((s, idx) => (
        <div key={idx} className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <Image src={s.img} alt="" className="w-full h-full" fittingType="fill" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 max-w-2xl">
            <h2 className="text-white text-3xl md:text-5xl font-bold leading-tight">{s.title}</h2>
            <p className="text-white/90 mt-3 text-sm md:text-lg max-w-md">{s.sub}</p>
            <Link
              to={s.to}
              className="mt-6 inline-flex items-center self-start bg-white text-foreground font-bold text-sm px-6 py-3 rounded-md hover:bg-white/90 transition-colors"
            >
              {s.cta}
            </Link>
          </div>
        </div>
      ))}

      {/* pagination dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === i ? "bg-white" : "bg-white/40 hover:bg-white/60"}`}
          />
        ))}
      </div>

      {/* nav controls bottom-right */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        <button onClick={() => go(-1)} aria-label="Previous" className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow hover:bg-white/90">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={() => setPaused(!paused)} aria-label={paused ? "Play" : "Pause"} className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow hover:bg-white/90">
          {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
        <button onClick={() => go(1)} aria-label="Next" className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow hover:bg-white/90">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}