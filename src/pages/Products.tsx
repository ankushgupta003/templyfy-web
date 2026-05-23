import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { productCategories } from "@shared/brand";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import SectionHeader from "../components/SectionHeader";
import { api, expectProductListResponse, type ProductListResponse } from "../lib/api";
import { setPageMeta } from "../lib/utils";
import Button from "../components/Button";

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "price_asc", label: "Price low to high" },
  { value: "price_desc", label: "Price high to low" },
  { value: "popular", label: "Popular" },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formState, setFormState] = useState({
    search: searchParams.get("search") ?? "",
    category: searchParams.get("category") ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    sort: searchParams.get("sort") ?? "latest",
  });

  useEffect(() => {
    setPageMeta(
      "Digital Products Marketplace",
      "Browse Excel templates, VBA tools, Google Sheets resources, dashboards, and business productivity downloads.",
    );
  }, []);

  useEffect(() => {
    setFormState({
      search: searchParams.get("search") ?? "",
      category: searchParams.get("category") ?? "",
      minPrice: searchParams.get("minPrice") ?? "",
      maxPrice: searchParams.get("maxPrice") ?? "",
      sort: searchParams.get("sort") ?? "latest",
    });
  }, [searchParams]);

  const productsQuery = useQuery({
    queryKey: ["products", searchParams.toString()],
    queryFn: async () => {
      const response = await api.get<ProductListResponse>("/products", {
        params: {
          search: searchParams.get("search") || undefined,
          category: searchParams.get("category") || undefined,
          minPrice: searchParams.get("minPrice") || undefined,
          maxPrice: searchParams.get("maxPrice") || undefined,
          sort: searchParams.get("sort") || "latest",
        },
      });

      return expectProductListResponse(response.data, "/products");
    },
  });

  const updateParams = (next: typeof formState) => {
    const params = new URLSearchParams();

    if (next.search) {
      params.set("search", next.search);
    }
    if (next.category) {
      params.set("category", next.category);
    }
    if (next.minPrice) {
      params.set("minPrice", next.minPrice);
    }
    if (next.maxPrice) {
      params.set("maxPrice", next.maxPrice);
    }
    if (next.sort && next.sort !== "latest") {
      params.set("sort", next.sort);
    }

    setSearchParams(params);
  };

  return (
    <div className="section-gap">
      <div className="container-shell space-y-8">
        <div className="page-header">
          <SectionHeader
            eyebrow="Marketplace"
            title="Digital templates, automation tools, and spreadsheet resources"
            description="A denser catalog built for quick evaluation. Scan category, compatibility, included files, pricing, and checkout options without jumping through oversized cards."
          />
          <div className="section-block p-4">
            <div className="section-title">Delivery note</div>
            <p className="mt-2 page-copy">
              Files stay private on the backend and are delivered after verified Razorpay payment through a secure email link.
            </p>
          </div>
        </div>

        <div className="section-block p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_0.9fr_0.7fr_0.7fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={formState.search}
                onChange={(event) => setFormState((current) => ({ ...current, search: event.target.value }))}
                placeholder="Search products, dashboards, calculators..."
                className="pl-11"
              />
            </label>
            <select
              value={formState.category}
              onChange={(event) => setFormState((current) => ({ ...current, category: event.target.value }))}
            >
              <option value="">All categories</option>
              {productCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              value={formState.minPrice}
              onChange={(event) => setFormState((current) => ({ ...current, minPrice: event.target.value }))}
              placeholder="Min"
            />
            <input
              type="number"
              min={0}
              value={formState.maxPrice}
              onChange={(event) => setFormState((current) => ({ ...current, maxPrice: event.target.value }))}
              placeholder="Max"
            />
            <div className="flex gap-2">
              <Button size="md" onClick={() => updateParams(formState)}>
                Apply
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  const reset = { search: "", category: "", minPrice: "", maxPrice: "", sort: "latest" };
                  setFormState(reset);
                  updateParams(reset);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        {productsQuery.isLoading ? (
          <Loader label="Loading products..." />
        ) : productsQuery.data?.items.length ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div className="text-sm text-slate-500">{productsQuery.data.total} products found</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Faster comparison
              </div>
            </div>
            <div className="space-y-3">
              {productsQuery.data.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No matching products found"
            description="Try adjusting the search, category, or price filters to explore other digital products in the marketplace."
          />
        )}
      </div>
    </div>
  );
}
