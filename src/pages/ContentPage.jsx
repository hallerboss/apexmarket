import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import ReactMarkdown from "react-markdown";

export default function ContentPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Page.filter({ slug }).then((pages) => {
      setPage(pages[0]);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="container-bleed px-5 lg:px-10 py-32 text-center"><div className="w-8 h-8 border-2 border-muted border-t-foreground rounded-full animate-spin mx-auto" /></div>;
  if (!page) return <div className="container-bleed px-5 lg:px-10 py-32 text-center"><h1 className="display-text text-4xl mb-4">Page Not Found</h1></div>;

  return (
    <div>
      {page.featured_image && (
        <div className="aspect-[16/6] overflow-hidden bg-secondary">
          <Image src={page.featured_image} alt={page.title} className="w-full h-full object-cover" fittingType="fill" />
        </div>
      )}
      <article className="container-bleed px-5 lg:px-10 py-16 lg:py-24 max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.25em] text-accent font-semibold mb-4">{page.slug}</p>
        <h1 className="display-text text-5xl lg:text-6xl mb-8">{page.title}</h1>
        {page.excerpt && <p className="serif-text text-xl text-muted-foreground leading-relaxed mb-10">{page.excerpt}</p>}
        <div className="prose prose-lg max-w-none serif-text text-muted-foreground leading-relaxed [&_p]:mb-5 [&_h2]:display-text [&_h2]:text-2xl [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_a]:text-accent">
          <ReactMarkdown>{page.content || "No content yet."}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}