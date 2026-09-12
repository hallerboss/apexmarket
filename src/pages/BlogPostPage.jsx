import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import AdSenseAd from "@/components/store/AdSenseAd";

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    setLoading(true);
    base44.entities.BlogPost.filter({ slug, status: "published" }, "-created_date", 1).then((data) => {
      const p = data?.[0] || null;
      setPost(p);
      setLoading(false);
      if (p) {
        base44.entities.BlogPost.update(p.id, { view_count: (p.view_count || 0) + 1 }).catch(() => {});
        base44.entities.BlogPost.filter({ status: "published", category: p.category }, "-created_date", 5).then((posts) => {
          setRelated(posts.filter((r) => r.id !== p.id).slice(0, 3));
        });
      }
    });
  }, [slug]);

  if (loading) {
    return <div className="container-bleed px-5 lg:px-10 py-32 text-center"><div className="w-8 h-8 border-2 border-muted border-t-foreground rounded-full animate-spin mx-auto" /></div>;
  }
  if (!post) {
    return <div className="container-bleed px-5 lg:px-10 py-32 text-center"><p className="serif-text text-xl">Article not found.</p><Link to="/blog" className="btn-mono-outline mt-6 inline-flex">Back to Blog</Link></div>;
  }

  return (
    <div className="pb-24">
      <div className="container-bleed px-5 lg:px-10 py-10 lg:py-16">
        <Link to="/blog" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        <article className="max-w-3xl mx-auto">
          <span className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold">{post.category}</span>
          <h1 className="display-text text-3xl lg:text-5xl mt-2 mb-4">{post.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-8">
            <Calendar className="w-4 h-4" />
            {post.published_date ? new Date(post.published_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
            <span className="mx-1">·</span>
            {post.author}
          </div>

          {post.featured_image && (
            <div className="aspect-[16/9] overflow-hidden bg-secondary mb-8">
              <Image src={post.featured_image} alt={post.title} className="w-full h-full" fittingType="fill" />
            </div>
          )}

          <AdSenseAd />

          {post.excerpt && <p className="serif-text text-xl text-muted-foreground leading-relaxed mb-8">{post.excerpt}</p>}

          <div
            className="prose prose-lg max-w-none [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:text-muted-foreground [&_li]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />

          <AdSenseAd />

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t hairline">
              {post.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 text-xs text-muted-foreground border border-border px-3 py-1.5">
                  <Tag className="w-3 h-3" /> {t}
                </span>
              ))}
            </div>
          )}
        </article>

        {related.length > 0 && (
          <section className="max-w-5xl mx-auto mt-16 pt-12 border-t hairline">
            <h2 className="display-text text-2xl mb-6">Related Articles</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="group">
                  <div className="aspect-[16/10] overflow-hidden bg-secondary mb-3">
                    {p.featured_image && <Image src={p.featured_image} alt={p.title} className="w-full h-full" fittingType="fill" />}
                  </div>
                  <h3 className="text-sm font-semibold group-hover:text-accent transition-colors line-clamp-2">{p.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}