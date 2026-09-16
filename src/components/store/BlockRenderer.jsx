import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import BlockProductGrid from "@/components/store/BlockProductGrid";

const FONT = { heading: "font-heading", body: "font-body", serif: "font-serif" };
const ALIGN = { left: "text-left", center: "text-center", right: "text-right" };
const PAD = { none: "py-0", sm: "py-6", md: "py-12", lg: "py-16", xl: "py-24" };
const HEAD = { sm: "text-xl", md: "text-2xl", lg: "text-3xl", xl: "text-4xl", "2xl": "text-5xl" };
const BODY = { sm: "text-sm", md: "text-base", lg: "text-lg", xl: "text-xl", "2xl": "text-2xl" };
const IMG_H = { sm: "h-40", md: "h-64", lg: "h-96", xl: "h-[36rem]" };
const SPACER_H = { sm: "h-8", md: "h-16", lg: "h-24", xl: "h-40" };

export default function BlockRenderer({ block }) {
  if (!block) return null;

  const align = block.align || "left";
  const wrapStyle = {};
  if (block.bgColor) wrapStyle.background = block.bgColor;
  if (block.textColor) wrapStyle.color = block.textColor;

  if (block.type === "hero") {
    return (
      <section className={`relative flex items-center overflow-hidden bg-foreground ${IMG_H[block.height || "lg"]}`} style={wrapStyle}>
        {block.image && <Image src={block.image} alt="" className="absolute inset-0 w-full h-full" fittingType="fill" />}
        {block.image && <div className="absolute inset-0 bg-black/45" />}
        <div className={`relative z-10 w-full container-bleed px-5 lg:px-10 ${ALIGN[align]}`}>
          <h1 className="display-text text-4xl lg:text-6xl mb-4 text-white">{block.title}</h1>
          {block.subtitle && (
            <p className={`serif-text text-lg lg:text-xl text-white/85 max-w-2xl ${align === "center" ? "mx-auto" : "inline-block"}`}>
              {block.subtitle}
            </p>
          )}
          {block.ctaText && (
            <Link to={block.ctaHref || "/shop"} className="btn-mono bg-accent text-white mt-8 inline-flex">
              {block.ctaText}
            </Link>
          )}
        </div>
      </section>
    );
  }

  if (block.type === "spacer") {
    return <div className={SPACER_H[block.height || "md"]} style={wrapStyle} aria-hidden="true" />;
  }

  let body = null;
  switch (block.type) {
    case "heading":
      body = (
        <h2 className={`${FONT[block.fontFamily || "heading"]} ${HEAD[block.fontSize || "lg"]} font-bold leading-tight`} style={{ color: block.color || undefined }}>
          {block.text}
        </h2>
      );
      break;
    case "text":
      body = (
        <p className={`${FONT[block.fontFamily || "serif"]} ${BODY[block.fontSize || "md"]} leading-relaxed max-w-3xl ${align === "center" ? "mx-auto" : ""}`} style={{ color: block.color || undefined }}>
          {block.text}
        </p>
      );
      break;
    case "image":
      body = block.url ? (
        <Image src={block.url} alt={block.alt || ""} className={`w-full ${IMG_H[block.height || "md"]} object-cover`} fittingType="fill" />
      ) : (
        <div className={`w-full ${IMG_H[block.height || "md"]} bg-secondary`} />
      );
      break;
    case "button":
      body = (
        <Link to={block.href || "#"} className="btn-mono inline-flex" style={{ background: block.bgColor || "#111111", color: block.textColor || "#ffffff" }}>
          {block.label}
        </Link>
      );
      break;
    case "divider":
      body = <hr className="border-t" style={{ borderColor: block.color || undefined }} />;
      break;
    case "products":
      body = (
        <div>
          {block.title && <h2 className="display-text text-3xl lg:text-4xl mb-8">{block.title}</h2>}
          <BlockProductGrid category={block.category} limit={block.limit || 4} columns={block.columns || 4} />
        </div>
      );
      break;
    default:
      body = null;
  }

  return (
    <section className={`w-full ${PAD[block.pad || "md"]} ${ALIGN[align]}`} style={wrapStyle}>
      <div className="container-bleed px-5 lg:px-10">{body}</div>
    </section>
  );
}