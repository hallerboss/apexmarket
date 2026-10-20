import { useRef, useState } from "react";
import { Image } from "@/components/ui/image";

// The zoomed layer is rendered at 200% of the frame so the requested image
// resolution is high enough to stay sharp when magnified.
const ZOOM = 2;

export default function ProductImageZoom({ src, alt, className = "" }) {
  const frameRef = useRef(null);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [canHover] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches
  );

  const track = (e) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    setOrigin({
      x: Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
    });
  };

  // Offset that keeps the point under the cursor fixed while magnified.
  const tx = zoomed ? -0.5 * (origin.x - 50) : 0;
  const ty = zoomed ? -0.5 * (origin.y - 50) : 0;

  return (
    <div
      ref={frameRef}
      className={`relative overflow-hidden bg-secondary group ${className}`}
      onMouseEnter={(e) => {
        if (!canHover) return;
        track(e);
        setZoomed(true);
      }}
      onMouseMove={(e) => {
        if (canHover && zoomed) track(e);
      }}
      onMouseLeave={() => {
        if (!canHover) return;
        setZoomed(false);
        setOrigin({ x: 50, y: 50 });
      }}
      onClick={(e) => {
        if (canHover) return;
        track(e);
        setZoomed((z) => !z);
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 w-[200%] h-[200%] transition-transform duration-200 ease-out"
        style={{
          transform: `translate(calc(-50% + ${tx}%), calc(-50% + ${ty}%)) scale(${zoomed ? 1 : 1 / ZOOM})`,
        }}
      >
        {src && <Image src={src} alt={alt} className="w-full h-full" fittingType="fill" />}
      </div>

      <span className="pointer-events-none absolute bottom-3 right-3 z-10 hidden lg:block bg-black/60 text-white text-[10px] uppercase tracking-[0.15em] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {zoomed ? "Move to explore" : "Hover to zoom"}
      </span>
      <span className="pointer-events-none absolute bottom-3 right-3 z-10 lg:hidden bg-black/60 text-white text-[10px] uppercase tracking-[0.15em] px-2 py-1">
        {zoomed ? "Tap to reset" : "Tap to zoom"}
      </span>
    </div>
  );
}