export default function SectionHeader({ eyebrow, title, link, linkLabel = "View All" }) {
  return (
    <div className="flex items-end justify-between mb-8 lg:mb-12">
      <div>
        {eyebrow && <p className="text-[11px] uppercase tracking-[0.25em] text-accent font-semibold mb-3">{eyebrow}</p>}
        <h2 className="display-text text-3xl lg:text-5xl">{title}</h2>
      </div>
      {link && (
        <a href={link} className="hidden md:flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-semibold hover:text-accent transition-colors group">
          {linkLabel}
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </a>
      )}
    </div>
  );
}