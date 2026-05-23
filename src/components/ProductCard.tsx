import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../lib/api";
import { resolveAssetUrl } from "../lib/api";
import { cn, formatCurrency, formatDate } from "../lib/utils";
import { buttonStyles } from "./Button";

type ProductCardProps = {
  product: Product;
  compact?: boolean;
};

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  if (compact) {
    return (
      <article className="section-block overflow-hidden transition-colors hover:border-electric/30">
        <div className="grid gap-0 sm:grid-cols-[132px_1fr]">
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 sm:aspect-auto">
            <img src={resolveAssetUrl(product.thumbnailUrl)} alt={product.title} className="h-full w-full object-cover" />
            <div className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-electric">
              {product.fileType}
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span>{product.category}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>v{product.version}</span>
            </div>
            <div>
              <Link to={`/products/${product.slug}`} className="text-base font-semibold leading-6 text-ink hover:text-electric">
                {product.title}
              </Link>
              <p className="mt-2 text-sm leading-6 text-slate-600">{product.shortDescription}</p>
            </div>
            <div className="mt-auto flex items-end justify-between gap-4">
              <div>
                <div className="text-lg font-bold text-ink">{formatCurrency(product.price)}</div>
                {product.compareAtPrice ? (
                  <div className="text-xs text-slate-400 line-through">{formatCurrency(product.compareAtPrice)}</div>
                ) : null}
              </div>
              <Link to={`/products/${product.slug}?checkout=1`} className={buttonStyles({ size: "sm" })}>
                Buy Now
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  const primaryCompatibility = product.compatibility.split(",")[0]?.trim() || "Business-ready";

  return (
    <article className="section-block transition-colors hover:border-electric/30">
      <div className="grid gap-4 p-4 md:grid-cols-[168px_1fr_auto] md:items-start">
        <div className="relative aspect-[16/11] overflow-hidden rounded-xl bg-slate-100">
          <img src={resolveAssetUrl(product.thumbnailUrl)} alt={product.title} className="h-full w-full object-cover" />
          <div className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-electric">
            {product.fileType}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            <span>{product.category}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>v{product.version}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>Updated {formatDate(product.updatedAt)}</span>
          </div>

          <div>
            <Link to={`/products/${product.slug}`} className="text-lg font-semibold leading-7 text-ink hover:text-electric">
              {product.title}
            </Link>
            <p className="mt-2 text-sm leading-6 text-slate-600">{product.shortDescription}</p>
          </div>

          <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
            <div>
              <div className="info-label">Compatibility</div>
              <div className="mt-1 font-medium text-slate-700">{primaryCompatibility}</div>
            </div>
            <div>
              <div className="info-label">Included</div>
              <div className="mt-1 font-medium text-slate-700">{product.includedFiles[0] ?? "Template file"}</div>
            </div>
            <div>
              <div className="info-label">Rating</div>
              <div className="mt-1 inline-flex items-center gap-1 font-medium text-slate-700">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                4.8
              </div>
            </div>
          </div>
        </div>

        <div className={cn("flex gap-3 md:min-w-[160px] md:flex-col md:items-end", "md:text-right")}>
          <div className="flex-1">
            <div className="text-xl font-bold text-ink">{formatCurrency(product.price)}</div>
            {product.compareAtPrice ? (
              <div className="text-xs text-slate-400 line-through">{formatCurrency(product.compareAtPrice)}</div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Link to={`/products/${product.slug}`} className={buttonStyles({ variant: "secondary", size: "sm" })}>
              View Details
            </Link>
            <Link to={`/products/${product.slug}?checkout=1`} className={buttonStyles({ size: "sm" })}>
              Buy Now
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
