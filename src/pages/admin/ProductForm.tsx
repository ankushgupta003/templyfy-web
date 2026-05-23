import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, UploadCloud, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { productCategories, productFileTypes } from "@shared/brand";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import { api, getApiErrorMessage, resolveAssetUrl, type Product } from "../../lib/api";
import { fromTextareaValue, setPageMeta, toTextareaValue } from "../../lib/utils";
import { productFormSchema } from "../../lib/validation";

type ProductFormValues = {
  title: string;
  slug?: string;
  shortDescription: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  fileType: string;
  compatibility: string;
  version: string;
  featuresText: string;
  includedFilesText: string;
  requirements: string;
  isActive: boolean;
  isFeatured: boolean;
};

const defaultValues: ProductFormValues = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: productCategories[0],
  price: 199,
  compareAtPrice: undefined,
  fileType: productFileTypes[0],
  compatibility: "Microsoft Excel 2019+, Microsoft 365, Windows/Mac where applicable",
  version: "1.0.0",
  featuresText: "",
  includedFilesText: "",
  requirements: "",
  isActive: true,
  isFeatured: false,
};

export default function ProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setPageMeta(isEditing ? "Edit Product" : "Create Product", "Manage Templyfy digital product details and uploads.");
  }, [isEditing]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  const productQuery = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: async () => {
      const response = await api.get<Product>(`/admin/products/${id}`);
      return response.data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (!productQuery.data) {
      return;
    }

    form.reset({
      title: productQuery.data.title,
      slug: productQuery.data.slug,
      shortDescription: productQuery.data.shortDescription,
      description: productQuery.data.description,
      category: productQuery.data.category,
      price: productQuery.data.price,
      compareAtPrice: productQuery.data.compareAtPrice ?? undefined,
      fileType: productQuery.data.fileType,
      compatibility: productQuery.data.compatibility,
      version: productQuery.data.version,
      featuresText: toTextareaValue(productQuery.data.features),
      includedFilesText: toTextareaValue(productQuery.data.includedFiles),
      requirements: productQuery.data.requirements,
      isActive: productQuery.data.isActive,
      isFeatured: productQuery.data.isFeatured,
    });
    setExistingGalleryImages(productQuery.data.galleryImages ?? []);
  }, [form, productQuery.data]);

  const thumbnailPreview = useMemo(() => {
    if (thumbnailFile) {
      return URL.createObjectURL(thumbnailFile);
    }

    return productQuery.data?.thumbnailUrl ? resolveAssetUrl(productQuery.data.thumbnailUrl) : "";
  }, [productQuery.data?.thumbnailUrl, thumbnailFile]);

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("slug", values.slug ?? "");
      formData.append("shortDescription", values.shortDescription);
      formData.append("description", values.description);
      formData.append("category", values.category);
      formData.append("price", String(values.price));
      if (values.compareAtPrice) {
        formData.append("compareAtPrice", String(values.compareAtPrice));
      }
      formData.append("fileType", values.fileType);
      formData.append("compatibility", values.compatibility);
      formData.append("version", values.version);
      formData.append("features", JSON.stringify(fromTextareaValue(values.featuresText)));
      formData.append("includedFiles", JSON.stringify(fromTextareaValue(values.includedFilesText)));
      formData.append("requirements", values.requirements);
      formData.append("isActive", String(values.isActive));
      formData.append("isFeatured", String(values.isFeatured));
      formData.append("existingGalleryImages", JSON.stringify(existingGalleryImages));

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }
      if (digitalFile) {
        formData.append("digitalFile", digitalFile);
      }
      galleryFiles.forEach((file) => formData.append("gallery", file));

      if (isEditing) {
        const response = await api.put(`/admin/products/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      }

      const response = await api.post("/admin/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      navigate("/admin/products");
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error));
    },
  });

  const firstValidationError = Object.values(form.formState.errors).find(
    (error) => Boolean((error as { message?: string } | undefined)?.message),
  ) as { message?: string } | undefined;

  if (productQuery.isLoading) {
    return <Loader label="Loading product..." />;
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="section-title">{isEditing ? "Edit product" : "Create product"}</div>
          <h1 className="mt-2 text-2xl font-bold">{isEditing ? "Update product details and protected assets" : "Add a new digital product"}</h1>
          <p className="mt-3 page-copy">
            Keep product information, pricing, compatibility, delivery assets, and listing visibility organized from one compact editor.
          </p>
        </div>
        <div className="flex items-start justify-end">
          <Button variant="secondary" onClick={() => navigate("/admin/products")}>
            Back to products
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
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="section-block p-5 sm:p-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-xl font-bold">Core details</h2>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
                <input {...form.register("title")} placeholder="Product title" />
                {form.formState.errors.title ? <p className="mt-2 text-sm text-red-600">{form.formState.errors.title.message}</p> : null}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Slug</label>
                <input {...form.register("slug")} placeholder="Optional custom slug" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
                <select {...form.register("category")}>
                  {productCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Short description</label>
                <textarea rows={3} {...form.register("shortDescription")} placeholder="Short catalog description" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Full description</label>
                <textarea rows={5} {...form.register("description")} placeholder="Detailed product description" />
              </div>
            </div>
          </div>

          <div className="section-block p-5 sm:p-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-xl font-bold">Pricing and delivery</h2>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Price (INR)</label>
                <input type="number" {...form.register("price")} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Compare at price</label>
                <input type="number" {...form.register("compareAtPrice")} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">File type</label>
                <select {...form.register("fileType")}>
                  {productFileTypes.map((fileType) => (
                    <option key={fileType} value={fileType}>
                      {fileType}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Version</label>
                <input {...form.register("version")} placeholder="1.0.0" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Compatibility</label>
                <textarea rows={3} {...form.register("compatibility")} placeholder="Compatibility notes" />
              </div>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input type="checkbox" className="h-4 w-4" {...form.register("isActive")} />
                <span className="text-sm font-medium text-slate-700">Active product</span>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input type="checkbox" className="h-4 w-4" {...form.register("isFeatured")} />
                <span className="text-sm font-medium text-slate-700">Featured on storefront</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="section-block p-5 sm:p-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-xl font-bold">Features and included files</h2>
            </div>
            <div className="mt-5 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Features</label>
                <textarea rows={6} {...form.register("featuresText")} placeholder="One feature per line" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Included files</label>
                <textarea rows={6} {...form.register("includedFilesText")} placeholder="One included item per line" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Requirements</label>
                <textarea rows={5} {...form.register("requirements")} placeholder="Product requirements and setup notes" />
              </div>
            </div>
          </div>

          <div className="section-block p-5 sm:p-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-xl font-bold">Uploads</h2>
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-dashed border-slate-300 p-4">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <ImagePlus className="h-5 w-5 text-electric" />
                  Thumbnail image
                </div>
                <input type="file" accept="image/*" className="mt-4" onChange={(event) => setThumbnailFile(event.target.files?.[0] ?? null)} />
                {thumbnailPreview ? <img src={thumbnailPreview} alt="Thumbnail preview" className="mt-4 aspect-[4/3] w-full rounded-xl object-cover" /> : null}
              </div>

              <div className="rounded-xl border border-dashed border-slate-300 p-4">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <UploadCloud className="h-5 w-5 text-electric" />
                  Protected digital file
                </div>
                <input type="file" className="mt-4" onChange={(event) => setDigitalFile(event.target.files?.[0] ?? null)} />
                <p className="mt-3 text-sm text-slate-500">
                  {digitalFile?.name ?? (isEditing ? "Leave empty to keep current file." : "Required for new products.")}
                </p>
              </div>

              <div className="rounded-xl border border-dashed border-slate-300 p-4">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <ImagePlus className="h-5 w-5 text-electric" />
                  Gallery images
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="mt-4"
                  onChange={(event) => setGalleryFiles(Array.from(event.target.files ?? []))}
                />
                {existingGalleryImages.length ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {existingGalleryImages.map((image) => (
                      <div key={image} className="relative overflow-hidden rounded-xl border border-slate-200">
                        <img src={resolveAssetUrl(image)} alt="Gallery" className="aspect-[4/3] w-full object-cover" />
                        <button
                          type="button"
                          className="absolute right-3 top-3 rounded-full border border-slate-200 bg-white/95 p-2 text-slate-700"
                          onClick={() => setExistingGalleryImages((current) => current.filter((item) => item !== image))}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate("/admin/products")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
