import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { blogCategories } from "@shared/brand";
import { api, expectApiArray, type BlogPost } from "../lib/api";
import { setPageMeta } from "../lib/utils";
import BlogCard from "../components/BlogCard";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import SectionHeader from "../components/SectionHeader";

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  useEffect(() => {
    setPageMeta("Blog", "Browse SEO-friendly articles on Excel, VBA, Google Sheets, and productivity workflows.");
  }, []);

  const blogQuery = useQuery({
    queryKey: ["blogs", searchParams.toString()],
    queryFn: async () => {
      const response = await api.get<BlogPost[]>("/blogs", {
        params: {
          search: searchParams.get("search") || undefined,
          category: searchParams.get("category") || undefined,
        },
      });
      return expectApiArray<BlogPost>(response.data, "/blogs");
    },
  });

  return (
    <div className="section-gap">
      <div className="container-shell space-y-8">
        <div className="page-header">
          <SectionHeader
            eyebrow="Knowledge Base"
            title="Excel, automation, and productivity content for better digital systems"
            description="Search by topic, filter by category, and skim article context directly from the listing instead of drilling into oversized blog cards."
          />
          <div className="section-block p-4">
            <div className="section-title">Content focus</div>
            <p className="mt-2 page-copy">
              Articles are written to support buyers evaluating Excel templates, VBA tools, Sheets workflows, and business productivity systems.
            </p>
          </div>
        </div>

        <div className="section-block p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1.35fr_1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search topics, formulas, dashboards..." className="pl-11" />
            </label>
            <select
              value={searchParams.get("category") ?? ""}
              onChange={(event) =>
                setSearchParams((current) => {
                  const params = new URLSearchParams(current);
                  if (event.target.value) {
                    params.set("category", event.target.value);
                  } else {
                    params.delete("category");
                  }
                  return params;
                })
              }
            >
              <option value="">All categories</option>
              {blogCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  if (search) {
                    params.set("search", search);
                  } else {
                    params.delete("search");
                  }
                  setSearchParams(params);
                }}
              >
                Search
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setSearchParams(new URLSearchParams());
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        {blogQuery.isLoading ? (
          <Loader label="Loading articles..." />
        ) : blogQuery.data?.length ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div className="text-sm text-slate-500">{blogQuery.data.length} published articles</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Searchable format</div>
            </div>
            <div className="space-y-3">
              {blogQuery.data.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No blog posts match these filters"
            description="Try another keyword or remove the category filter to explore more published content."
          />
        )}
      </div>
    </div>
  );
}
