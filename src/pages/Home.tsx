import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Boxes,
  ChartColumn,
  CreditCard,
  Download,
  FileSpreadsheet,
  Gauge,
  ReceiptIndianRupee,
  ShieldCheck,
  TimerReset,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { brand, homeFaqs, productCategories, trustPoints } from "@shared/brand";
import { api, expectApiArray, expectProductListResponse, type BlogPost, type Product, type ProductListResponse } from "../lib/api";
import { setPageMeta } from "../lib/utils";
import { buttonStyles } from "../components/Button";
import SectionHeader from "../components/SectionHeader";
import ProductCard from "../components/ProductCard";
import BlogCard from "../components/BlogCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const categoryIcons = [
  FileSpreadsheet,
  Bot,
  ChartColumn,
  Gauge,
  Wallet,
  Users,
  Boxes,
  ReceiptIndianRupee,
  BriefcaseBusiness,
  TimerReset,
];

const trustIcons = [Download, CreditCard, BriefcaseBusiness, ShieldCheck];

const workflowSteps = [
  "Choose a template",
  "Pay securely with Razorpay",
  "Receive file on email",
  "Start using instantly",
];

export default function Home() {
  useEffect(() => {
    setPageMeta(
      brand.tagline,
      "Buy Excel, VBA, Google Sheets, and productivity templates with secure checkout and email delivery.",
    );
  }, []);

  const featuredProductsQuery = useQuery({
    queryKey: ["products", "featured-home"],
    queryFn: async () => {
      const response = await api.get<ProductListResponse>("/products", {
        params: {
          featured: true,
          sort: "popular",
        },
      });
      return expectProductListResponse(response.data, "/products").items.slice(0, 4);
    },
  });

  const blogQuery = useQuery({
    queryKey: ["blogs", "home-preview"],
    queryFn: async () => {
      const response = await api.get<BlogPost[]>("/blogs");
      return expectApiArray<BlogPost>(response.data, "/blogs").slice(0, 3);
    },
  });

  return (
    <div>
      <section className="hero-surface overflow-hidden border-b border-white/10">
        <div className="container-shell grid gap-8 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:py-14">
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
              <ShieldCheck className="h-4 w-4 text-emerald" />
              Trusted spreadsheet marketplace
            </div>
            <div className="space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
                Premium templates + automation
              </div>
              <h1 className="max-w-2xl text-4xl font-bold leading-[1.04] text-white sm:text-[2.8rem] lg:text-[3.05rem]">
                {brand.tagline}
              </h1>
              <p className="max-w-xl text-[15px] leading-7 text-slate-300 sm:text-base">
                Download powerful business templates, automation files, dashboards, and productivity tools instantly after purchase.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/products" className={buttonStyles({ size: "lg" })}>
                {brand.cta.primary}
              </Link>
              <Link
                to="/products?category=Excel%20Templates"
                className={buttonStyles({
                  variant: "secondary",
                  size: "lg",
                  className: "border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white",
                })}
              >
                {brand.cta.secondary}
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {trustPoints.map((point, index) => {
                const Icon = trustIcons[index % trustIcons.length];

                return (
                  <div
                    key={point}
                    className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-slate-200 backdrop-blur"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white/10 p-2 text-cyan-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{point}</div>
                        <div className="text-xs text-slate-400">
                          {index === 0 && "Delivered after verification"}
                          {index === 1 && "No manual card collection"}
                          {index === 2 && "Made for real work"}
                          {index === 3 && "Private time-limited access"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-6 h-32 w-32 rounded-full bg-cyan/20 blur-3xl" />
            <div className="absolute right-0 top-20 h-40 w-40 rounded-full bg-electric/20 blur-3xl" />
            <div className="relative space-y-4">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="rounded-[24px] border border-white/10 bg-[#091321] p-4 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200">Featured pack</div>
                      <div className="mt-1 text-xl font-bold">Business KPI Dashboard</div>
                    </div>
                    <div className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                      Premium
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[22px] bg-white p-4 text-ink shadow-panel">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.22em] text-electric">Dashboard preview</div>
                          <div className="mt-1 text-lg font-semibold">Ready for weekly reporting</div>
                        </div>
                        <div className="text-lg font-bold text-ink">INR 999</div>
                      </div>

                      <div className="mt-4 rounded-[20px] bg-slate-100 p-3">
                        <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-slate-500">
                          <span>Monthly revenue</span>
                          <span>+18%</span>
                        </div>
                        <div className="h-14 rounded-2xl bg-gradient-to-r from-electric/15 via-cyan/10 to-emerald/15" />
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div className="rounded-xl bg-white p-2.5 text-xs text-slate-600 shadow-sm">KPIs</div>
                          <div className="rounded-xl bg-white p-2.5 text-xs text-slate-600 shadow-sm">Targets</div>
                          <div className="rounded-xl bg-white p-2.5 text-xs text-slate-600 shadow-sm">Exports</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200">How it works</div>
                        <ol className="mt-4 space-y-3">
                          {workflowSteps.map((step, index) => (
                            <li key={step} className="flex items-center gap-3 text-sm text-slate-300">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white">
                                {index + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="rounded-[22px] bg-gradient-to-br from-electric via-blue-600 to-cyan p-4 text-white shadow-panel">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-white/80">Delivery promise</div>
                        <div className="mt-2 text-lg font-semibold leading-7">
                          Secure download link sent by email after successful payment verification.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Formats", value: "XLSX, XLSM, Sheets" },
                  { label: "Audience", value: "Finance, ops, founders" },
                  { label: "Checkout", value: "Razorpay verified" },
                ].map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-white">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-200">{item.label}</div>
                    <div className="mt-2 text-sm font-semibold">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gap">
        <div className="container-shell">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader
              eyebrow="Categories"
              title="Template packs built around actual business workflows"
              description="Sharper, business-ready digital products for finance, inventory, HR, dashboards, billing, and spreadsheet automation."
            />
            <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-electric">
              Browse full marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {productCategories.map((category, index) => {
              const Icon = categoryIcons[index % categoryIcons.length];

              return (
                <Link
                  key={category}
                  to={`/products?category=${encodeURIComponent(category)}`}
                  className="section-block group p-4 transition duration-300 hover:border-electric/30"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-2.5 text-electric transition group-hover:bg-electric group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold">{category}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Structured resources for faster setup and cleaner delivery.
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-gap pt-0">
        <div className="container-shell">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader
              eyebrow="Best Sellers"
              title="High-utility downloads buyers can put to work quickly"
              description="A denser storefront list with pricing, compatibility, included files, and direct checkout actions visible without extra clicks."
            />
            <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-electric">
              View all products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8">
            {featuredProductsQuery.isLoading ? (
              <Loader label="Loading featured products..." />
            ) : featuredProductsQuery.data?.length ? (
              <div className="space-y-3">
                {featuredProductsQuery.data.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Featured products will appear here"
                description="Run the backend seed or create products from the admin panel to populate this storefront section."
              />
            )}
          </div>
        </div>
      </section>

      <section className="section-gap bg-white/70">
        <div className="container-shell grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="dark-panel p-6 sm:p-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">Why choose us</div>
            <h2 className="mt-3 text-3xl font-bold text-white">A storefront designed for trust, not noise</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Templyfy combines a premium digital marketplace feel with the backend controls needed for protected delivery, verified payments, and cleaner post-purchase communication.
            </p>

            <div className="mt-6 grid gap-3">
              {[
                {
                  icon: CreditCard,
                  title: "Backend-first checkout",
                  description:
                    "Razorpay orders are created on the server and signatures are verified before an order is marked as paid.",
                },
                {
                  icon: ShieldCheck,
                  title: "Protected file access",
                  description:
                    "Downloads are delivered through expiring signed links so private files stay private.",
                },
                {
                  icon: Bot,
                  title: "Made for spreadsheet-heavy work",
                  description:
                    "The catalog fits Excel, VBA, Google Sheets, dashboards, templates, and productivity download use cases.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-white/10 p-2.5 text-cyan-200">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="panel p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-electric">Business fit</div>
              <h3 className="mt-3 text-2xl font-bold">Useful for accountants, analysts, freelancers, and small teams</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  "Accountants and finance teams",
                  "Founders and operators",
                  "Freelancers and consultants",
                  "Analysts and students",
                  "HR and admin teams",
                  "Project coordinators",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="panel p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-electric">How delivery works</div>
            <div className="mt-4 space-y-2.5">
              {workflowSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-electric text-[11px] font-semibold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gap">
        <div className="container-shell">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader
              eyebrow="From the Blog"
              title="Helpful buying guides and spreadsheet workflow ideas"
              description="Support content presented in a tighter reading list so buyers can scan categories, authors, reading time, and relevance quickly."
            />
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-electric">
              View all articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8">
            {blogQuery.isLoading ? (
              <Loader label="Loading blog highlights..." />
            ) : blogQuery.data?.length ? (
              <div className="space-y-3">
                {blogQuery.data.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Blog content will show here"
                description="Add blog posts from the admin panel to publish SEO-friendly resource content for your store."
              />
            )}
          </div>
        </div>
      </section>

      <section className="section-gap pt-0">
        <div className="container-shell grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="panel p-6 sm:p-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-electric">Why templates save time</div>
            <h2 className="mt-3 text-3xl font-bold">Skip the blank-sheet setup work</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>Business buyers usually do not need another vague template. They need structured files that are ready to use, easy to understand, and practical for daily work.</p>
              <p>Templyfy focuses on that middle ground: polished enough to feel premium, compact enough to adopt quickly, and specific enough to solve a real workflow.</p>
            </div>
          </div>

          <div className="panel p-6 sm:p-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-electric">FAQ</div>
            <div className="mt-5 space-y-4">
              {homeFaqs.map((faq) => (
                <div key={faq.question} className="rounded-[22px] border border-slate-200 p-4">
                  <h3 className="text-base font-semibold">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
