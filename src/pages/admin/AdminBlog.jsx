import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image as ImageIcon, Upload, X, Plus, Pencil, Trash2, Search, Sparkles, Eye } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Link } from "react-router-dom";

const CATEGORIES = ["Product Updates", "Buying Guides", "News", "Reviews", "Tips & How-To"];

const emptyPost = {
  title: "", slug: "", content: "", excerpt: "", featured_image: "",
  category: "Buying Guides", tags: [], author: "ApexMarket Team",
  seo_title: "", meta_description: "", status: "draft",
};

export default function AdminBlog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCategory, setAiCategory] = useState("Buying Guides");

  const isNew = searchParams.get("new") === "1";

  const load = () => {
    setLoading(true);
    base44.entities.BlogPost.list("-created_date", 100).then((data) => {
      setPosts(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    if (isNew) setEditing({ ...emptyPost });
  }, []);

  useEffect(() => {
    if (isNew) setEditing({ ...emptyPost });
  }, [isNew]);

  const filtered = posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  const startEdit = (p) => {
    setEditing({ ...emptyPost, ...p, tags: p.tags || [] });
    setSearchParams({});
  };

  const startNew = () => {
    setEditing({ ...emptyPost });
    setSearchParams({ new: "1" });
  };

  const save = (e) => {
    e.preventDefault();
    const data = {
      ...editing,
      slug: editing.slug || editing.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      published_date: editing.status === "published" && !editing.published_date
        ? new Date().toISOString().split("T")[0]
        : editing.published_date,
    };
    if (data.id) {
      base44.entities.BlogPost.update(data.id, data).then(() => { load(); setEditing(null); });
    } else {
      base44.entities.BlogPost.create(data).then(() => { load(); setEditing(null); setSearchParams({}); });
    }
  };

  const remove = (id) => {
    if (!confirm("Delete this blog post?")) return;
    base44.entities.BlogPost.delete(id).then(load);
  };

  const uploadImage = async (file) => {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditing((e) => ({ ...e, featured_image: file_url }));
    setUploading(false);
  };

  const generateAI = async () => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generateBlogPost", {
        topic: aiTopic.trim(),
        category: aiCategory,
      });
      const d = res.data?.post || {};
      setEditing((e) => ({
        ...e,
        title: d.title || e.title,
        slug: d.slug || e.slug,
        content: d.content || e.content,
        excerpt: d.excerpt || e.excerpt,
        tags: d.tags || e.tags,
        seo_title: d.seo_title || e.seo_title,
        meta_description: d.meta_description || e.meta_description,
        category: aiCategory,
        status: "draft",
      }));
      setAiTopic("");
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "AI generation failed");
    } finally {
      setGenerating(false);
    }
  };

  if (editing) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="display-text text-2xl text-white">{editing.id ? "Edit Post" : "New Post"}</h2>
          <button onClick={() => { setEditing(null); setSearchParams({}); }} className="text-white hover:text-accent flex items-center gap-1.5 text-sm"><X className="w-4 h-4" /> Cancel</button>
        </div>

        {/* AI Generation Panel */}
        <div className="mb-6 border border-accent/30 bg-accent/5 p-5 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent" />
            <h4 className="text-sm font-bold text-white">AI Article Generator</h4>
            <span className="text-[10px] text-white/50">Searches trending products & generates SEO articles</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={aiCategory} onChange={(e) => setAiCategory(e.target.value)} className="admin-input sm:w-48">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              placeholder="Optional: specific topic (e.g. 'best wireless earbuds 2025')"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") generateAI(); }}
              className="admin-input flex-1"
            />
            <button
              onClick={generateAI}
              disabled={generating}
              className="bg-accent text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] rounded hover:bg-accent/90 flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
            >
              {generating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate Article</>}
            </button>
          </div>
        </div>

        <form onSubmit={save} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div>
              <label className="admin-label">Title</label>
              <input required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Slug</label>
              <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="admin-input" placeholder="auto-generated from title" />
            </div>
            <div>
              <label className="admin-label">Excerpt</label>
              <textarea rows={2} value={editing.excerpt || ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} className="admin-input resize-none" placeholder="Short summary shown in blog listing…" />
            </div>
            <div>
              <label className="admin-label">Content</label>
              <RichTextEditor value={editing.content || ""} onChange={(html) => setEditing({ ...editing, content: html })} minHeight={400} title="Blog post content" placeholder="Write your article or use AI Generate above…" />
            </div>
            <div>
              <label className="admin-label">Tags (comma separated)</label>
              <input value={(editing.tags || []).join(", ")} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} className="admin-input" />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="admin-label">Featured Image</label>
              <div className="mb-3">
                {editing.featured_image ? (
                  <div className="relative aspect-video bg-white/5 overflow-hidden">
                    <img src={editing.featured_image} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setEditing({ ...editing, featured_image: "" })} className="absolute top-1 right-1 bg-black/70 text-white p-1"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <label className="block aspect-video border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-colors text-white hover:text-accent">
                    {uploading ? <div className="w-5 h-5 border-2 border-white/20 border-t-accent rounded-full animate-spin" /> : <><Upload className="w-5 h-5 mb-1" /><span className="text-[10px]">Upload</span></>}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadImage(e.target.files[0])} />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="admin-label">Category</label>
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="admin-input">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-label">Author</label>
              <input value={editing.author || ""} onChange={(e) => setEditing({ ...editing, author: e.target.value })} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Status</label>
              <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="admin-input">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="border-t border-white/10 pt-5">
              <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white mb-4">SEO</h4>
              <div className="space-y-4">
                <div>
                  <label className="admin-label">SEO Title</label>
                  <input value={editing.seo_title || ""} onChange={(e) => setEditing({ ...editing, seo_title: e.target.value })} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Meta Description</label>
                  <textarea rows={2} value={editing.meta_description || ""} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} className="admin-input resize-none" />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-accent text-white py-3 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-accent/90 transition-colors">
              {editing.id ? "Save Changes" : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="display-text text-2xl">Blog Posts</h2>
          <p className="text-sm text-black/50 mt-1">{posts.length} articles published</p>
        </div>
        <button onClick={startNew} className="bg-accent text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-accent/90 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Post
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
        <input placeholder="Search blog posts…" value={search} onChange={(e) => setSearch(e.target.value)} className="admin-input pl-11" />
      </div>

      <div className="bg-white border border-[#e5e7eb]">
        {loading ? (
          <div className="p-12 text-center text-black/40 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-black/40 text-sm">No blog posts found.</div>
        ) : (
          <div className="divide-y divide-[#eef0f2]">
            {filtered.map((p) => (
              <div key={p.id} className="px-5 py-4 flex items-center gap-4 hover:bg-[#fafafa] transition-colors">
                <div className="w-16 h-16 bg-[#f3f4f6] shrink-0 overflow-hidden">
                  {p.featured_image ? <img src={p.featured_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-black/30"><ImageIcon className="w-5 h-5" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <p className="text-xs text-black/50">{p.category} · {p.author} · {p.status === "published" ? "Published" : "Draft"}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  {p.status === "published" && <Link to={`/blog/${p.slug}`} target="_blank" className="p-2 text-black/60 hover:text-accent transition-colors"><Eye className="w-4 h-4" /></Link>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(p)} className="p-2 text-black/60 hover:text-accent transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(p.id)} className="p-2 text-black/60 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}