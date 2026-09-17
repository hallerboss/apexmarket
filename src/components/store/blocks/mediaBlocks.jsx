import { Link } from "react-router-dom";
import { PlayCircle } from "lucide-react";
import { Image } from "@/components/ui/image";

const IMG_H = { sm: "h-40", md: "h-64", lg: "h-96", xl: "h-[36rem]" };
const COL = { 2: "grid-cols-2", 3: "grid-cols-2 lg:grid-cols-3", 4: "grid-cols-2 lg:grid-cols-4" };

function ImageBlock({ block }) {
  if (!block.url) {
    return <div className={`w-full ${IMG_H[block.height || "md"]} bg-secondary`} />;
  }
  return (
    <Image
      src={block.url}
      alt={block.alt || ""}
      className={`w-full ${IMG_H[block.height || "md"]}`}
      fittingType="fill"
    />
  );
}

function Gallery({ block }) {
  const images = (block.images || []).filter(Boolean);
  if (!images.length) {
    return <div className="border-2 border-dashed border-border py-12 text-center text-sm text-muted-foreground">Add images in the block settings.</div>;
  }
  return (
    <div>
      {block.title && <h3 className="display-text text-2xl mb-6">{block.title}</h3>}
      <div className={`grid ${COL[block.columns || 3]} gap-3`}>
        {images.map((src, i) => (
          <Image key={i} src={src} alt="" className={`w-full ${IMG_H[block.height || "md"]}`} fittingType="fill" />
        ))}
      </div>
    </div>
  );
}

function youtubeId(url) {
  const m = String(url || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

function Video({ block }) {
  const id = youtubeId(block.url);
  if (!block.url) {
    return <div className="border-2 border-dashed border-border py-16 text-center text-sm text-muted-foreground"><PlayCircle className="w-6 h-6 mx-auto mb-2" />Paste a video URL in the settings.</div>;
  }
  return (
    <div>
      {block.title && <h3 className="display-text text-2xl mb-6">{block.title}</h3>}
      <div className="relative w-full aspect-video bg-foreground">
        {id ? (
          <iframe
            src={`https://www.youtube.com/embed/${id}`}
            title={block.title || "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <video src={block.url} controls className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>
    </div>
  );
}

function MapBlock({ block }) {
  const query = block.address || "";
  return (
    <iframe
      title="Map"
      src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
      loading="lazy"
      className={`w-full ${IMG_H[block.height || "md"]} border-0`}
    />
  );
}

function Hotspot({ block }) {
  if (!block.image) {
    return <div className="border-2 border-dashed border-border py-12 text-center text-sm text-muted-foreground">Upload a lifestyle image in the settings, then place hotspots on it.</div>;
  }
  return (
    <div>
      {block.title && <h3 className="display-text text-2xl mb-6">{block.title}</h3>}
      <div className="relative">
        <Image src={block.image} alt="" className={`w-full ${IMG_H.md}`} fittingType="fill" />
        {(block.points || []).map((p, i) => (
          <a
            key={i}
            href={p.href || "#"}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <span className="block w-4 h-4 rounded-full bg-white ring-2 ring-foreground" />
            <span className="absolute left-1/2 -translate-x-1/2 top-6 whitespace-nowrap bg-foreground text-background text-[11px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {p.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function Social({ block }) {
  return (
    <div>
      {block.title && <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4">{block.title}</h3>}
      <div className="flex flex-wrap justify-center gap-2">
        {(block.links || []).map((l, i) => (
          <Link
            key={i}
            to={l.href || "#"}
            className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] border border-foreground/20 hover:bg-foreground hover:text-background transition-colors capitalize"
          >
            {l.network}
          </Link>
        ))}
      </div>
    </div>
  );
}

export const MEDIA_BLOCKS = {
  image: ImageBlock,
  gallery: Gallery,
  video: Video,
  map: MapBlock,
  hotspot: Hotspot,
  social: Social,
};