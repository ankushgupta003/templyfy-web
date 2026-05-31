import { type UIEvent, useEffect, useMemo, useRef, useState } from "react";
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
import { cn, formatCurrency, formatDate, setPageMeta } from "../lib/utils";
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);

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

    return Array.from(new Set([product.thumbnailUrl, ...(product.galleryImages ?? [])]));
  }, [product]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [productImages]);

  const scrollMobileCarouselTo = (index: number) => {
    setSelectedImageIndex(index);

    const carousel = mobileCarouselRef.current;
    const slide = carousel?.children[index] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  const handleMobileCarouselScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollLeft, clientWidth } = event.currentTarget;

    if (!clientWidth) {
      return;
    }

    const nextIndex = Math.round(scrollLeft / clientWidth);

    if (nextIndex !== selectedImageIndex) {
      setSelectedImageIndex(Math.max(0, Math.min(productImages.length - 1, nextIndex)));
    }
  };

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

  const activeImage = productImages[selectedImageIndex] ?? product.thumbnailUrl;

  return (
    <div className="section-gap pb-28 sm:pb-32 lg:pb-12">
      <div className="mx-auto w-full max-w-[1480px] space-y-10 px-4 sm:px-5 lg:px-8 xl:px-10">
        <div className="space-y-6 lg:space-y-8">
          <div className="hidden items-center gap-2 text-sm text-slate-400 lg:flex">
            <Link to="/products" className="hover:text-electric">
              Products
            </Link>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <span className="text-slate-700">{product.title}</span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[88px_minmax(0,1fr)_minmax(340px,380px)] lg:items-start lg:gap-8 xl:grid-cols-[96px_minmax(0,1fr)_400px] xl:gap-10">
            <div className="order-1 lg:hidden">
              <div
                ref={mobileCarouselRef}
                onScroll={handleMobileCarouselScroll}
                className="flex snap-x snap-mandatory touch-pan-x overflow-x-auto rounded-[24px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {productImages.map((image, index) => (
                  <div key={image} className="w-full shrink-0 snap-center">
                    <img
                      src={resolveAssetUrl(image)}
                      alt={`${product.title} preview ${index + 1}`}
                      className="aspect-[16/11] w-full rounded-[24px] object-cover"
                    />
                  </div>
                ))}
              </div>
              {productImages.length > 1 ? (
                <div className="mt-4 flex items-center justify-center gap-2">
                  {productImages.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => scrollMobileCarouselTo(index)}
                      className={cn(
                        "h-2.5 rounded-full transition-all duration-200",
                        index === selectedImageIndex ? "w-6 bg-electric" : "w-2.5 bg-slate-300",
                      )}
                      aria-label={`Go to image ${index + 1}`}
                      aria-pressed={index === selectedImageIndex}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="order-2 hidden gap-4 lg:grid lg:grid-cols-1">
              {productImages.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "overflow-hidden rounded-[22px] border bg-white transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                    index === selectedImageIndex
                      ? "border-electric shadow-[0_0_0_1px_rgba(37,99,235,0.18)]"
                      : "border-slate-200 hover:border-slate-300",
                  )}
                  aria-label={`Preview image ${index + 1} for ${product.title}`}
                  aria-pressed={index === selectedImageIndex}
                >
                  <img
                    src={resolveAssetUrl(image)}
                    alt={product.title}
                    className="aspect-[4/3] w-full object-cover lg:aspect-[5/6]"
                  />
                </button>
              ))}
            </div>

            <div className="order-2 hidden lg:block lg:order-2">
              <div className="overflow-hidden rounded-[24px] bg-slate-50 lg:rounded-[30px]">
                <img
                  src={resolveAssetUrl(activeImage)}
                  alt={product.title}
                  className="aspect-[16/11] w-full object-cover lg:aspect-[6/5] xl:aspect-[5/4]"
                />
              </div>
            </div>

            <div className="order-3 lg:sticky lg:top-24">
              <div className="space-y-6 lg:space-y-8">
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-electric">
                    {product.category}
                  </div>
                  <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                    {product.fileType}
                  </div>
                </div>

                <div>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.85rem]">{product.title}</h1>
                  <p className="mt-3 text-[15px] leading-7 text-slate-600">{product.shortDescription}</p>
                </div>

                <div className="border-y border-slate-200 py-5">
                  <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                    <div className="text-3xl font-bold text-ink sm:text-[2rem]">{formatCurrency(product.price)}</div>
                    {product.compareAtPrice ? (
                      <div className="pb-1 text-base text-slate-400 line-through">{formatCurrency(product.compareAtPrice)}</div>
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                      Premium digital resource
                    </span>
                    <span>Secure download delivered by email after payment verification.</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: FileCode2, label: "File type", value: product.fileType },
                    { icon: Sparkles, label: "Version", value: product.version },
                    { icon: Clock3, label: "Last updated", value: formatDate(product.updatedAt) },
                    { icon: Laptop2, label: "Compatibility", value: product.compatibility },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        <item.icon className="h-4 w-4 text-electric" />
                        {item.label}
                      </div>
                      <div className="max-w-[14rem] text-right text-sm leading-6 text-ink">{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[20px] border border-emerald-100 bg-emerald-50/80 px-4 py-3.5 text-sm leading-6 text-emerald-800">
                  After successful payment, your secure file link is sent to your email so the download stays protected.
                </div>

                <div className="hidden gap-3 lg:flex lg:flex-col">
                  <Button size="lg" className="w-full justify-center" onClick={openCheckoutModal}>
                    Buy Now
                  </Button>
                  <Link
                    to="/products"
                    className={buttonStyles({ variant: "secondary", size: "lg", className: "w-full justify-center" })}
                  >
                    Browse more templates
                  </Link>
                </div>

                <div className="hidden gap-4 border-t border-slate-200 pt-5 lg:grid">
                  <div className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                    <Download className="mt-0.5 h-5 w-5 text-electric" />
                    <span>Instant email delivery once Razorpay payment verification completes.</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald" />
                    <span>Secure payment flow with backend signature checks before order completion.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
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

        <div className="hidden items-center gap-8 border-b border-slate-200 px-2 lg:flex">
          <a href="#product-details" className="border-b-2 border-ink pb-3 text-lg font-semibold text-ink">
            Product details
          </a>
          <a href="#whats-included" className="pb-3 text-lg text-slate-500 hover:text-ink">
            What's included
          </a>
          <a href="#product-faq" className="pb-3 text-lg text-slate-500 hover:text-ink">
            FAQ
          </a>
        </div>

        <div id="product-details" className="panel scroll-mt-24 p-5 sm:p-6">
          <h2 className="text-xl font-bold sm:text-2xl">Product details</h2>
          <p className="mt-4 text-sm leading-7 text-slate-700">{product.description}</p>
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
          <div id="whats-included" className="panel scroll-mt-24 p-5 sm:p-6">
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

        <div id="product-faq" className="panel scroll-mt-24 p-5 sm:p-6">
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

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 shadow-[0_-20px_40px_rgba(8,17,31,0.12)] backdrop-blur lg:hidden">
        <div className="container-shell flex items-center gap-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Instant delivery</div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-2xl font-bold text-ink">{formatCurrency(product.price)}</div>
              {product.compareAtPrice ? (
                <div className="text-sm text-slate-400 line-through">{formatCurrency(product.compareAtPrice)}</div>
              ) : null}
            </div>
          </div>
          <Button size="lg" className="min-w-[8.75rem] shrink-0" onClick={openCheckoutModal}>
            Buy Now
          </Button>
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
