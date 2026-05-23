import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search, Trash2 } from "lucide-react";
import { blogCategories } from "@shared/brand";
import Button, { buttonStyles } from "../../components/Button";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import { api, getApiErrorMessage, type BlogPost } from "../../lib/api";
import { formatDate, setPageMeta } from "../../lib/utils";

export default function AdminBlogPosts() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    setPageMeta("Admin Blog", "Manage blog posts, publishing status, and SEO content.");
  }, []);

  const postsQuery = useQuery({
    queryKey: ["admin", "blogs", search, category, status],
    queryFn: async () => {
      const response = await api.get<BlogPost[]>("/admin/blogs", {
        params: {
          search: search || undefined,
          category: category || undefined,
          status: status || undefined,
        },
      });
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/blogs/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] });
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error));
    },
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="section-title">Content management</div>
          <h1 className="mt-2 text-2xl font-bold">Blog posts</h1>
          <p className="mt-3 page-copy">
            Manage search-focused content, publishing status, and SEO-ready blog metadata from a tighter editorial workflow.
          </p>
        </div>
        <div className="flex items-start justify-end">
          <Link to="/admin/blog/new" className={buttonStyles({ size: "lg" })}>
            <Plus className="mr-2 h-4 w-4" />
            Create post
          </Link>
        </div>
      </div>

      <div className="section-block p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.35fr_0.8fr_0.8fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search blog posts..." className="pl-11" />
          </label>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {blogCategories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
      ) : null}

      {postsQuery.isLoading ? (
        <Loader label="Loading blog posts..." />
      ) : postsQuery.data?.length ? (
        <div className="data-list">
          {postsQuery.data.map((post) => (
            <div key={post.id} className="data-row xl:grid-cols-[1fr_auto] xl:items-start">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <span>{post.category}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>{post.author}</span>
                  <span className={`rounded-full px-2 py-1 ${post.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {post.status}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-ink">{post.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{post.excerpt}</p>
                </div>
                <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                  <div>
                    <div className="info-label">Slug</div>
                    <div className="mt-1 font-medium text-slate-700">{post.slug}</div>
                  </div>
                  <div>
                    <div className="info-label">Updated</div>
                    <div className="mt-1 font-medium text-slate-700">{formatDate(post.updatedAt)}</div>
                  </div>
                  <div>
                    <div className="info-label">Tags</div>
                    <div className="mt-1 font-medium text-slate-700">{post.tags.slice(0, 3).join(", ") || "None"}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 xl:justify-end">
                <Link to={`/admin/blog/${post.id}/edit`} className={buttonStyles({ variant: "secondary", size: "sm" })}>
                  Edit
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Delete "${post.title}"?`)) {
                      deleteMutation.mutate(post.id);
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No blog posts found" description="Create your first article or adjust the current filters." />
      )}
    </div>
  );
}
