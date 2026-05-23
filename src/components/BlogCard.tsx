import { CalendarDays, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import type { BlogPost } from "../lib/api";
import { resolveAssetUrl } from "../lib/api";
import { estimateReadingTime, formatDate } from "../lib/utils";

type BlogCardProps = {
  post: BlogPost;
  compact?: boolean;
};

export default function BlogCard({ post, compact = false }: BlogCardProps) {
  if (compact) {
    return (
      <article className="section-block overflow-hidden transition-colors hover:border-electric/30">
        <div className="grid gap-0 sm:grid-cols-[132px_1fr]">
          <div className="aspect-[4/3] overflow-hidden bg-slate-100 sm:aspect-auto">
            <img src={resolveAssetUrl(post.coverImage)} alt={post.title} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col gap-3 p-4">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span>{post.category}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
            </div>
            <div>
              <Link to={`/blog/${post.slug}`} className="text-base font-semibold leading-6 text-ink hover:text-electric">
                {post.title}
              </Link>
              <p className="mt-2 text-sm leading-6 text-slate-600">{post.excerpt}</p>
            </div>
            <Link to={`/blog/${post.slug}`} className="text-sm font-semibold text-electric hover:text-cyan">
              Read article
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="section-block transition-colors hover:border-electric/30">
      <div className="grid gap-4 p-4 md:grid-cols-[168px_1fr_auto] md:items-start">
        <div className="aspect-[16/11] overflow-hidden rounded-xl bg-slate-100">
          <img src={resolveAssetUrl(post.coverImage)} alt={post.title} className="h-full w-full object-cover" />
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            <span>{post.category}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>{post.author}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
          </div>
          <div>
            <Link to={`/blog/${post.slug}`} className="text-lg font-semibold leading-7 text-ink hover:text-electric">
              {post.title}
            </Link>
            <p className="mt-2 text-sm leading-6 text-slate-600">{post.excerpt}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3 md:min-w-[140px] md:flex-col md:items-end md:text-right">
          <div className="flex-1 space-y-1 text-sm text-slate-500">
            <div className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-electric" />
              {formatDate(post.publishedAt ?? post.createdAt)}
            </div>
            <div className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-electric" />
              {estimateReadingTime(post.content)} min read
            </div>
          </div>
          <Link to={`/blog/${post.slug}`} className="text-sm font-semibold text-electric hover:text-cyan">
            Read article
          </Link>
        </div>
      </div>
    </article>
  );
}
