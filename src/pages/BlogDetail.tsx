import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CalendarDays, Clock3, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api, expectApiObject, expectProductListResponse, resolveAssetUrl, type BlogPost, type Product, type ProductListResponse } from "../lib/api";
import { estimateReadingTime, formatDate, setPageMeta } from "../lib/utils";
import BlogCard from "../components/BlogCard";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";

export default function BlogDetail() {
  const { slug } = useParams();

  const blogQuery = useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const response = await api.get<BlogPost>(`/blogs/${slug}`);
      return expectApiObject<BlogPost>(response.data, `/blogs/${slug}`);
    },
    enabled: Boolean(slug),
  });

  const featuredProductsQuery = useQuery({
    queryKey: ["products", "blog-cta"],
    queryFn: async () => {
      const response = await api.get<ProductListResponse>("/products", {
        params: {
          featured: true,
          sort: "popular",
        },
      });
      return expectProductListResponse(response.data, "/products").items.slice(0, 2);
    },
  });

  useEffect(() => {
    if (blogQuery.data) {
      setPageMeta(blogQuery.data.seoTitle || blogQuery.data.title, blogQuery.data.seoDescription || blogQuery.data.excerpt);
    }
  }, [blogQuery.data]);

  if (blogQuery.isLoading) {
    return <Loader label="Loading article..." />;
  }

  const post = blogQuery.data;

  if (!post) {
    return (
      <div className="section-gap">
        <div className="container-shell">
          <EmptyState title="Article not found" description="The requested blog post is unavailable right now." />
        </div>
      </div>
    );
  }

  return (
    <div className="section-gap">
      <div className="container-shell space-y-8">
        <div className="page-header">
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-electric">
              {post.category}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{post.excerpt}</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <UserRound className="h-4 w-4 text-electric" />
                {post.author}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-electric" />
                {formatDate(post.publishedAt ?? post.createdAt)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-electric" />
                {estimateReadingTime(post.content)} min read
              </span>
            </div>
          </div>
          <div className="section-block p-4">
            <div className="section-title">Article summary</div>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <div>
                <div className="info-label">Published</div>
                <div className="mt-1 font-medium text-slate-700">{formatDate(post.publishedAt ?? post.createdAt)}</div>
              </div>
              <div>
                <div className="info-label">Tags</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-block overflow-hidden">
          <img src={resolveAssetUrl(post.coverImage)} alt={post.title} className="aspect-[16/6] w-full object-cover" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
          <article className="section-block p-5 sm:p-6">
            <div className="space-y-5 text-[15px] leading-8 text-slate-700">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => <h2 className="mt-8 text-2xl font-bold">{children}</h2>,
                  h3: ({ children }) => <h3 className="mt-6 text-xl font-semibold">{children}</h3>,
                  p: ({ children }) => <p>{children}</p>,
                  ul: ({ children }) => <ul className="space-y-2 pl-5">{children}</ul>,
                  li: ({ children }) => <li className="list-disc">{children}</li>,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </article>

          <div className="space-y-4">
            <div className="section-block p-4">
              <div className="section-title">Relevant products</div>
              <h2 className="mt-2 text-xl font-bold">Apply the workflow</h2>
              <p className="mt-2 page-copy">
                Browse templates, dashboards, and automation packs connected to the systems discussed in this article.
              </p>
              <Link to="/products" className="mt-4 inline-flex text-sm font-semibold text-electric hover:text-cyan">
                Browse products
              </Link>
            </div>
            <div className="section-block p-4">
              <div className="section-title">Reading context</div>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <div>
                  <div className="info-label">Author</div>
                  <div className="mt-1 font-medium text-slate-700">{post.author}</div>
                </div>
                <div>
                  <div className="info-label">Category</div>
                  <div className="mt-1 font-medium text-slate-700">{post.category}</div>
                </div>
                <div>
                  <div className="info-label">Reading time</div>
                  <div className="mt-1 font-medium text-slate-700">{estimateReadingTime(post.content)} minutes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {featuredProductsQuery.data?.length ? (
          <section className="space-y-3">
            <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <div className="section-title">Product CTA</div>
                <h2 className="mt-2 text-2xl font-bold">Recommended downloads</h2>
              </div>
              <Link to="/products" className="text-sm font-semibold text-electric">
                View marketplace
              </Link>
            </div>
            <div className="space-y-3">
              {featuredProductsQuery.data.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}

        {post.relatedPosts?.length ? (
          <section className="space-y-3">
            <div className="border-b border-slate-200 pb-3">
              <div className="section-title">Related Posts</div>
              <h2 className="mt-2 text-2xl font-bold">Keep reading</h2>
            </div>
            <div className="space-y-3">
              {post.relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
