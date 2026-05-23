import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Check,
  Clock3,
  Download,
  FileCode2,
  Laptop2,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  api,
  getApiErrorMessage,
  resolveAssetUrl,
  type CheckoutOrderResponse,
  type CheckoutVerificationResponse,
  type Product,
} from "../lib/api";
import { checkoutSchema } from "../lib/validation";
import { formatCurrency, formatDate, setPageMeta } from "../lib/utils";
import { useRazorpay } from "../hooks/useRazorpay";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import Button, { buttonStyles } from "../components/Button";
import EmptyState from "../components/EmptyState";

type CheckoutFormValues = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

export default function ProductDetail() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isReady, openCheckout } = useRazorpay();
  const checkoutOpen = searchParams.get("checkout") === "1";

  const productQuery = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const response = await api.get<Product>(`/products/${slug}`);
      return response.data;
    },
    enabled: Boolean(slug),
  });

  const product = productQuery.data;

  useEffect(() => {
    if (product) {
      setPageMeta(product.title, product.shortDescription);
    }
  }, [product]);

  const productImages = useMemo(() => {
    if (!product) {
      return [];
    }

    return [product.thumbnailUrl, ...(product.galleryImages ?? [])];
  }, [product]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (payload: CheckoutFormValues) => {
      const response = await api.post<CheckoutOrderResponse>("/checkout/create-order", {
        ...payload,
        productId: product?.id,
      });
      return response.data;
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (payload: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }) => {
      const response = await api.post<CheckoutVerificationResponse>("/checkout/verify-payment", payload);
      return response.data;
    },
  });

  const openCheckoutModal = () => {
    const params = new URLSearchParams(searchParams);
    params.set("checkout", "1");
    setSearchParams(params);
  };

  const closeCheckoutModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("checkout");
    setSearchParams(params);
  };

  const handleCheckout = form.handleSubmit(async (values) => {
    if (!product) {
      return;
    }

    if (!isReady) {
      form.setError("customerEmail", {
        message: "Payment checkout is still loading. Please try again in a moment.",
      });
      return;
    }

    try {
      const order = await createOrderMutation.mutateAsync(values);

      openCheckout(
        {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.razorpayOrderId,
          name: "Templyfy",
          description: product.title,
          prefill: {
            name: values.customerName,
            email: values.customerEmail,
            contact: values.customerPhone,
          },
          notes: {
            productId: product.id,
          },
          theme: {
            color: "#2563EB",
          },
          modal: {
            ondismiss: () => {
              navigate(`/checkout/failed?product=${product.slug}&reason=cancelled`);
            },
          },
          handler: async (response) => {
            try {
              const verification = await verifyPaymentMutation.mutateAsync({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              navigate(
                `/checkout/success?orderNumber=${encodeURIComponent(verification.orderNumber)}&product=${encodeURIComponent(
                  verification.productName,
                )}&email=${encodeURIComponent(verification.customerEmail)}`,
              );
            } catch (error) {
              navigate(`/checkout/failed?product=${product.slug}&reason=${encodeURIComponent(getApiErrorMessage(error))}`);
            }
          },
        },
        () => {
          navigate(`/checkout/failed?product=${product.slug}&reason=failed`);
        },
      );
    } catch (error) {
      form.setError("customerEmail", {
        message: getApiErrorMessage(error),
      });
    }
  });

  if (productQuery.isLoading) {
    return <Loader label="Loading product details..." />;
  }

  if (!product) {
    return (
      <div className="section-gap">
        <div className="container-shell">
          <EmptyState
            title="Product not found"
            description="The requested product is unavailable or may have been removed."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="section-gap">
      <div className="container-shell space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-4">
            <div className="panel overflow-hidden">
              <img
                src={resolveAssetUrl(productImages[0] ?? product.thumbnailUrl)}
                alt={product.title}
                className="aspect-[16/11] w-full object-cover"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {productImages.slice(0, 3).map((image) => (
                <div key={image} className="panel overflow-hidden">
                  <img src={resolveAssetUrl(image)} alt={product.title} className="aspect-[4/3] w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-electric">
                {product.category}
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.8rem]">{product.title}</h1>
              <p className="text-[15px] leading-7 text-slate-600">{product.description}</p>
            </div>

            <div className="panel p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-3xl font-bold text-ink sm:text-[2rem]">{formatCurrency(product.price)}</div>
                  {product.compareAtPrice ? (
                    <div className="mt-2 text-sm text-slate-400 line-through">
                      {formatCurrency(product.compareAtPrice)}
                    </div>
                  ) : null}
                </div>
                <div className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                  Premium digital resource
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: FileCode2, label: "File type", value: product.fileType },
                  { icon: Sparkles, label: "Version", value: product.version },
                  { icon: Clock3, label: "Last updated", value: formatDate(product.updatedAt) },
                  { icon: Laptop2, label: "Compatibility", value: product.compatibility },
                ].map((item) => (
                  <div key={item.label} className="rounded-[20px] bg-slate-50 p-4">
                    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      <item.icon className="h-4 w-4 text-electric" />
                      {item.label}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-ink">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[20px] border border-emerald-100 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800">
                After successful payment, the file will be sent to your email.
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={openCheckoutModal}>
                  Buy Now
                </Button>
                <Link to="/products" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                  Browse more templates
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="panel p-4 sm:p-5">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <Download className="h-5 w-5 text-electric" />
                  Instant email delivery
                </div>
                <p className="mt-2.5 text-sm leading-6 text-slate-600">
                  A secure download link is emailed after payment verification so the file stays protected.
                </p>
              </div>
              <div className="panel p-4 sm:p-5">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <ShieldCheck className="h-5 w-5 text-emerald" />
                  Verified payment flow
                </div>
                <p className="mt-2.5 text-sm leading-6 text-slate-600">
                  Checkout happens with Razorpay and the backend verifies payment signatures before order completion.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="panel p-5 sm:p-6">
            <h2 className="text-xl font-bold sm:text-2xl">Key features</h2>
            <div className="mt-4 space-y-3">
              {product.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                  <Check className="mt-1 h-4 w-4 text-emerald" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-5 sm:p-6">
            <h2 className="text-xl font-bold sm:text-2xl">What's included</h2>
            <div className="mt-4 space-y-3">
              {product.includedFiles.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                  <Mail className="mt-1 h-4 w-4 text-electric" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="panel p-5 sm:p-6">
            <h2 className="text-xl font-bold sm:text-2xl">How to use</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
              <p>1. Complete secure checkout using Razorpay.</p>
              <p>2. Check your email for the secure download link.</p>
              <p>3. Open the included file and follow the setup guide or instructions.</p>
              <p>4. Customize the workbook or sheet to fit your business workflow.</p>
            </div>
          </div>
          <div className="panel p-5 sm:p-6">
            <h2 className="text-xl font-bold sm:text-2xl">Requirements</h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">{product.requirements}</p>
            <div className="mt-5 rounded-[20px] bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Compatibility note: {product.compatibility}
            </div>
          </div>
        </div>

        <div className="panel p-5 sm:p-6">
          <h2 className="text-xl font-bold sm:text-2xl">Product FAQ</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {[
              {
                question: "When do I get access after paying?",
                answer: "After payment verification completes, the secure download link is sent to your email.",
              },
              {
                question: "Is this a physical product?",
                answer: "No. This is a digital product delivered online after successful payment.",
              },
              {
                question: "Can I contact support if I need help?",
                answer: "Yes. Use the contact page or store support email for delivery or access-related questions.",
              },
            ].map((item) => (
              <div key={item.question} className="rounded-[20px] border border-slate-200 p-4">
                <h3 className="text-base font-semibold">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-electric">Related Products</div>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Keep the workflow going</h2>
            </div>
            <Link to="/products" className="text-sm font-semibold text-electric">
              View all
            </Link>
          </div>
          {product.relatedProducts?.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {product.relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} compact />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No related products yet"
              description="More products in this category will appear here as the marketplace grows."
            />
          )}
        </div>
      </div>

      {checkoutOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4 py-8 backdrop-blur-sm">
          <div className="panel w-full max-w-2xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-electric">Checkout</div>
                <h2 className="mt-2 text-xl font-bold sm:text-2xl">Secure purchase for {product.title}</h2>
              </div>
              <button type="button" className="text-sm font-semibold text-slate-500 hover:text-ink" onClick={closeCheckoutModal}>
                Close
              </button>
            </div>

            <form className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]" onSubmit={handleCheckout}>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Customer name</label>
                  <input {...form.register("customerName")} placeholder="Your full name" />
                  {form.formState.errors.customerName ? (
                    <p className="mt-2 text-sm text-red-600">{form.formState.errors.customerName.message}</p>
                  ) : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                  <input {...form.register("customerEmail")} placeholder="you@example.com" />
                  {form.formState.errors.customerEmail ? (
                    <p className="mt-2 text-sm text-red-600">{form.formState.errors.customerEmail.message}</p>
                  ) : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
                  <input {...form.register("customerPhone")} placeholder="Enter phone number" />
                  {form.formState.errors.customerPhone ? (
                    <p className="mt-2 text-sm text-red-600">{form.formState.errors.customerPhone.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Order summary</div>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="text-base font-semibold text-ink">{product.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{product.fileType}</div>
                  </div>
                  <div className="rounded-[20px] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Product price</span>
                      <span>{formatCurrency(product.price)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-base font-semibold text-ink">
                      <span>Total</span>
                      <span>{formatCurrency(product.price)}</span>
                    </div>
                  </div>
                  <div className="rounded-[20px] border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
                    Trust points: Instant delivery, secure Razorpay payment, business-ready files, email download link.
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={createOrderMutation.isPending || verifyPaymentMutation.isPending}
                  >
                    {createOrderMutation.isPending || verifyPaymentMutation.isPending
                      ? "Processing..."
                      : "Pay securely with Razorpay"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
