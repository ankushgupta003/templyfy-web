import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { buttonStyles } from "../components/Button";
import { setPageMeta } from "../lib/utils";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const product = searchParams.get("product");
  const email = searchParams.get("email");

  useEffect(() => {
    setPageMeta("Payment Successful", "Your order has been confirmed and the download link has been emailed.");
  }, []);

  return (
    <div className="section-gap">
      <div className="container-shell">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="page-header">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Payment successful
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your order is confirmed</h1>
                <p className="mt-3 text-base leading-7 text-slate-600">Your download link has been sent to your email.</p>
              </div>
            </div>
            <div className="section-block p-4">
              <div className="section-title">Next step</div>
              <p className="mt-2 page-copy">Check your inbox and spam folder. The secure download link expires based on the store setting.</p>
            </div>
          </div>

          <div className="data-list">
            {[
              ["Order ID", orderNumber ?? "Available in your email"],
              ["Product", product ?? "Purchased product"],
              ["Customer email", email ?? "Check your inbox"],
            ].map(([label, value]) => (
              <div key={label} className="data-row sm:grid-cols-[180px_1fr] sm:items-center">
                <div className="info-label">{label}</div>
                <div className="text-sm font-medium text-slate-700">{value}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/products" className={buttonStyles({ size: "lg" })}>
              Continue Shopping
            </Link>
            <Link to="/blog" className={buttonStyles({ variant: "secondary", size: "lg" })}>
              Read Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
