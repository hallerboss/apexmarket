import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { CONTENT_BLOCKS } from "@/components/store/blocks/contentBlocks";
import { COMMERCE_BLOCKS } from "@/components/store/blocks/commerceBlocks";
import { MEDIA_BLOCKS } from "@/components/store/blocks/mediaBlocks";
import { LAYOUT_BLOCKS } from "@/components/store/blocks/layoutBlocks";

const REGISTRY = {
  ...CONTENT_BLOCKS,
  ...COMMERCE_BLOCKS,
  ...MEDIA_BLOCKS,
  ...LAYOUT_BLOCKS,
};

const ALIGN = { left: "text-left", center: "text-center", right: "text-right" };
const PAD = { none: "py-0", sm: "py-6", md: "py-12", lg: "py-16", xl: "py-24" };
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

  const Block = REGISTRY[block.type];
  if (!Block) return null;

  return (
    <section className={`w-full ${PAD[block.pad || "md"]} ${ALIGN[align]}`} style={wrapStyle}>
      <div className="container-bleed px-5 lg:px-10">
        <Block block={block} />
      </div>
    </section>
  );
}