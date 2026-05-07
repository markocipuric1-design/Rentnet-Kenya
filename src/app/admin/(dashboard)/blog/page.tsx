"use client";

import { useEffect, useState, useRef } from "react";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff,
  X, Save, Upload, Search, BookOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  category: string;
  featured: boolean;
  published: boolean;
  read_time: number;
  author_name: string | null;
  created_at: string;
};

const CATEGORIES = ["General", "Market Trends", "Tips", "News", "Investment", "Legal"];

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

const emptyForm = {
  title: "", slug: "", excerpt: "", content: "", category: "General",
  author_name: "", read_time: "3", featured: false, published: false, cover_image_url: "", cover_image_alt: "",
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, content, cover_image_url, cover_image_alt, category, featured, published, read_time, author_name, created_at")
      .order("created_at", { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowEditor(true);
  };

  const openEdit = (post: Post) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      category: post.category,
      author_name: post.author_name ?? "",
      read_time: String(post.read_time),
      featured: post.featured,
      published: post.published,
      cover_image_url: post.cover_image_url ?? "",
      cover_image_alt: post.cover_image_alt ?? "",
    });
    setError("");
    setShowEditor(true);
  };

  const handleTitleChange = (val: string) => {
    setForm((f) => ({ ...f, title: val, slug: editingId ? f.slug : slugify(val) }));
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `covers/${Date.now()}.${ext}`;
    const { error: err } = await supabase.storage.from("blog-images").upload(path, file, { upsert: false });
    if (err) { setError(`Upload failed: ${err.message}`); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(path);
    setForm((f) => ({ ...f, cover_image_url: urlData.publicUrl }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) { setError("Title and slug are required."); return; }
    setSaving(true);
    setError("");
    const supabase = createClient();
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim() || null,
      cover_image_url: form.cover_image_url.trim() || null,
      cover_image_alt: form.cover_image_alt.trim() || null,
      category: form.category,
      author_name: form.author_name.trim() || null,
      read_time: Number(form.read_time) || 3,
      featured: form.featured,
      published: form.published,
      updated_at: new Date().toISOString(),
    };

    let err;
    if (editingId) {
      ({ error: err } = await supabase.from("blog_posts").update(payload).eq("id", editingId));
    } else {
      ({ error: err } = await supabase.from("blog_posts").insert(payload));
    }

    setSaving(false);
    if (err) { setError(err.message); return; }
    setShowEditor(false);
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const supabase = createClient();
    await supabase.from("blog_posts").delete().eq("id", id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleField = async (id: string, field: "published" | "featured", current: boolean) => {
    const supabase = createClient();
    await supabase.from("blog_posts").update({ [field]: !current }).eq("id", id);
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, [field]: !current } : p));
  };

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = "w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all";

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Blog Posts
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{posts.length} total posts</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-primary/20">
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" placeholder="Search posts…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary/50 transition-all" />
      </div>

      {/* Posts table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No posts found</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Published</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Featured</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground line-clamp-1">{post.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{post.category}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{formatDate(post.created_at)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleField(post.id, "published", post.published)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-colors ${post.published ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                      {post.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleField(post.id, "featured", post.featured)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-colors ${post.featured ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                      {post.featured ? <Star className="h-4 w-4 fill-amber-400" /> : <StarOff className="h-4 w-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button onClick={() => openEdit(post)}
                        className="w-8 h-8 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(post.id)}
                        className="w-8 h-8 rounded-lg bg-muted hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditor(false); }}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
              <h2 className="font-bold text-foreground">{editingId ? "Edit Post" : "New Post"}</h2>
              <button onClick={() => setShowEditor(false)}
                className="w-8 h-8 rounded-lg hover:bg-accent text-muted-foreground flex items-center justify-center transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-2.5 rounded-xl">{error}</p>}

              {/* Title + slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Title *</label>
                  <input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className={inputCls} placeholder="Post title" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Slug *</label>
                  <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={inputCls} placeholder="post-slug" />
                </div>
              </div>

              {/* Category + author + read time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Category</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className={inputCls + " cursor-pointer"}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Author</label>
                  <input value={form.author_name} onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
                    className={inputCls} placeholder="Author name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Read time (min)</label>
                  <input type="number" min={1} value={form.read_time}
                    onChange={(e) => setForm((f) => ({ ...f, read_time: e.target.value }))} className={inputCls} />
                </div>
              </div>

              {/* Cover image */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Cover Image</label>
                <div className="flex gap-2">
                  <input value={form.cover_image_url} onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))}
                    className={inputCls + " flex-1"} placeholder="https://… or upload below" />
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-1.5 border border-border hover:bg-accent px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0 disabled:opacity-50">
                    <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload"}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                </div>
                {form.cover_image_url && (
                  <img src={form.cover_image_url} alt="Cover preview" className="mt-2 h-32 w-full object-cover rounded-xl" />
                )}
              </div>

              {/* Cover image alt text */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Cover Image Alt Text</label>
                <input
                  value={form.cover_image_alt}
                  onChange={(e) => setForm((f) => ({ ...f, cover_image_alt: e.target.value }))}
                  className={inputCls}
                  placeholder="Describe the image for accessibility and SEO (e.g. 'Modern apartment block in Westlands, Nairobi')"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Excerpt</label>
                <textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  rows={2} className={inputCls + " resize-none"} placeholder="Short summary shown on the blog listing page" />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Content <span className="normal-case font-normal text-muted-foreground">(Markdown supported)</span>
                </label>
                <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={14} className={inputCls + " resize-y font-mono text-xs"} placeholder="Write your post in Markdown..." />
              </div>

              {/* Toggles */}
              <div className="flex gap-4">
                {(["published", "featured"] as const).map((field) => (
                  <label key={field} className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => setForm((f) => ({ ...f, [field]: !f[field] }))}
                      className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${form[field] ? "bg-primary" : "bg-border"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[field] ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                    <span className="text-sm font-medium text-foreground capitalize">{field}</span>
                  </label>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-border">
                <button onClick={() => setShowEditor(false)}
                  className="flex-1 border border-border hover:bg-accent text-foreground font-semibold py-2.5 rounded-xl text-sm transition-all">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingId ? "Save changes" : "Publish post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
