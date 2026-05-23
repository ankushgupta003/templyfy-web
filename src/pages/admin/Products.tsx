import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search, Trash2 } from "lucide-react";
import { productCategories } from "@shared/brand";
import Button, { buttonStyles } from "../../components/Button";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import { api, expectApiArray, getApiErrorMessage, resolveAssetUrl, type Product } from "../../lib/api";
import { formatCurrency, formatDate, setPageMeta } from "../../lib/utils";

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    setPageMeta("Admin Products", "Manage digital products, uploads, and catalog visibility.");
  }, []);

  const productsQuery = useQuery({
    queryKey: ["admin", "products", search, category, status],
    queryFn: async () => {
      const response = await api.get<Product[]>("/admin/products", {
        params: {
          search: search || undefined,
          category: category || undefined,
          status: status || undefined,
        },
      });
      return expectApiArray<Product>(response.data, "/admin/products");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/products/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error));
    },
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="section-title">Catalog management</div>
          <h1 className="mt-2 text-2xl font-bold">Products</h1>
          <p className="mt-3 page-copy">
            Manage product metadata, visibility, pricing, and protected file assets from a denser operations list.
          </p>
        </div>
        <div className="flex items-start justify-end">
          <Link to="/admin/products/new" className={buttonStyles({ size: "lg" })}>
            <Plus className="mr-2 h-4 w-4" />
            Create product
          </Link>
        </div>
      </div>

      <div className="section-block p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.35fr_0.8fr_0.8fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="pl-11" />
          </label>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {productCategories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
      ) : null}

      {productsQuery.isLoading ? (
        <Loader label="Loading products..." />
      ) : productsQuery.data?.length ? (
        <div className="data-list">
          {productsQuery.data.map((product) => (
            <div key={product.id} className="data-row lg:grid-cols-[92px_1fr_auto] lg:items-start">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img src={resolveAssetUrl(product.thumbnailUrl)} alt={product.title} className="aspect-[4/3] w-full object-cover" />
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <span>{product.fileType}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>{product.category}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>Updated {formatDate(product.updatedAt)}</span>
                  <span className={`rounded-full px-2 py-1 ${product.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                  {product.isFeatured ? <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">Featured</span> : null}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-ink">{product.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{product.shortDescription}</p>
                </div>
                <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-4">
                  <div>
                    <div className="info-label">Price</div>
                    <div className="mt-1 font-medium text-slate-700">{formatCurrency(product.price)}</div>
                  </div>
                  <div>
                    <div className="info-label">Version</div>
                    <div className="mt-1 font-medium text-slate-700">{product.version}</div>
                  </div>
                  <div>
                    <div className="info-label">Compatibility</div>
                    <div className="mt-1 font-medium text-slate-700">{product.compatibility.split(",")[0]}</div>
                  </div>
                  <div>
                    <div className="info-label">Slug</div>
                    <div className="mt-1 font-medium text-slate-700">{product.slug}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Link to={`/admin/products/${product.id}/edit`} className={buttonStyles({ variant: "secondary", size: "sm" })}>
                  Edit
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Delete "${product.title}"?`)) {
                      deleteMutation.mutate(product.id);
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
        <EmptyState title="No products found" description="Create your first digital product or adjust the current filters." />
      )}
    </div>
  );
}
