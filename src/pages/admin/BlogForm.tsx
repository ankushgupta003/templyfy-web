import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { blogCategories } from "@shared/brand";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import { api, getApiErrorMessage, resolveAssetUrl, type BlogPost } from "../../lib/api";
import { setPageMeta } from "../../lib/utils";
import { blogFormSchema } from "../../lib/validation";

type BlogFormValues = {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category: string;
  tagsText: string;
  author: string;
  status: "DRAFT" | "PUBLISHED";
  seoTitle: string;
  seoDescription: string;
};

const defaultValues: BlogFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: blogCategories[0],
  tagsText: "",
  author: "Templyfy Team",
  status: "DRAFT",
  seoTitle: "",
  seoDescription: "",
};

export default function BlogForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setPageMeta(isEditing ? "Edit Blog Post" : "Create Blog Post", "Manage published and draft content for Templyfy.");
  }, [isEditing]);

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues,
  });

  const blogQuery = useQuery({
    queryKey: ["admin", "blog", id],
    queryFn: async () => {
      const response = await api.get<BlogPost>(`/admin/blogs/${id}`);
      return response.data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (!blogQuery.data) {
      return;
    }

    form.reset({
      title: blogQuery.data.title,
      slug: blogQuery.data.slug,
      excerpt: blogQuery.data.excerpt,
      content: blogQuery.data.content,
      category: blogQuery.data.category,
      tagsText: blogQuery.data.tags.join(", "),
      author: blogQuery.data.author,
      status: blogQuery.data.status,
      seoTitle: blogQuery.data.seoTitle,
      seoDescription: blogQuery.data.seoDescription,
    });
  }, [blogQuery.data, form]);

  const coverPreview = useMemo(() => {
    if (coverFile) {
      return URL.createObjectURL(coverFile);
    }

    return blogQuery.data?.coverImage ? resolveAssetUrl(blogQuery.data.coverImage) : "";
  }, [blogQuery.data?.coverImage, coverFile]);

  const mutation = useMutation({
    mutationFn: async (values: BlogFormValues) => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("slug", values.slug ?? "");
      formData.append("excerpt", values.excerpt);
      formData.append("content", values.content);
      formData.append("category", values.category);
      formData.append("tags", values.tagsText);
      formData.append("author", values.author);
      formData.append("status", values.status);
      formData.append("seoTitle", values.seoTitle);
      formData.append("seoDescription", values.seoDescription);
      if (coverFile) {
        formData.append("coverImage", coverFile);
      }

      if (isEditing) {
        const response = await api.put(`/admin/blogs/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      }

      const response = await api.post("/admin/blogs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      navigate("/admin/blog");
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error));
    },
  });

  const firstValidationError = Object.values(form.formState.errors).find(
    (error) => Boolean((error as { message?: string } | undefined)?.message),
  ) as { message?: string } | undefined;

  if (blogQuery.isLoading) {
    return <Loader label="Loading blog post..." />;
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="section-title">{isEditing ? "Edit blog post" : "Create blog post"}</div>
          <h1 className="mt-2 text-2xl font-bold">{isEditing ? "Update article content and SEO details" : "Publish a new article"}</h1>
          <p className="mt-3 page-copy">
            Write, optimize, and publish search-focused content in a tighter editor built for admin workflow instead of oversized content cards.
          </p>
        </div>
        <div className="flex items-start justify-end">
          <Button variant="secondary" onClick={() => navigate("/admin/blog")}>
            Back to blog
          </Button>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
      ) : null}
      {firstValidationError?.message ? (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {firstValidationError.message}
        </div>
      ) : null}

      <form className="space-y-6" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <div className="section-block p-5 sm:p-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-xl font-bold">Content</h2>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
                <input {...form.register("title")} placeholder="Blog title" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Slug</label>
                <input {...form.register("slug")} placeholder="Optional custom slug" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
                <select {...form.register("category")}>
                  {blogCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Excerpt</label>
                <textarea rows={4} {...form.register("excerpt")} placeholder="Short article summary" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Content (Markdown)</label>
                <textarea rows={14} {...form.register("content")} placeholder="Write markdown content here" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="section-block p-5 sm:p-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-bold">Publishing and SEO</h2>
              </div>
              <div className="mt-5 grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Author</label>
                  <input {...form.register("author")} placeholder="Author name" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
                  <select {...form.register("status")}>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Tags</label>
                  <textarea rows={3} {...form.register("tagsText")} placeholder="Comma or line separated tags" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">SEO title</label>
                  <input {...form.register("seoTitle")} placeholder="SEO title" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">SEO description</label>
                  <textarea rows={4} {...form.register("seoDescription")} placeholder="SEO description" />
                </div>
              </div>
            </div>

            <div className="section-block p-5 sm:p-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-bold">Cover image</h2>
              </div>
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-4">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <ImagePlus className="h-5 w-5 text-electric" />
                  Article cover
                </div>
                <input type="file" accept="image/*" className="mt-4" onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)} />
                {coverPreview ? <img src={coverPreview} alt="Cover preview" className="mt-4 aspect-[16/9] w-full rounded-xl object-cover" /> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : isEditing ? "Update Post" : "Create Post"}
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate("/admin/blog")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
