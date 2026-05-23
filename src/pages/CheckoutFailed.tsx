import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { buttonStyles } from "../components/Button";
import { setPageMeta } from "../lib/utils";

export default function CheckoutFailed() {
  const [searchParams] = useSearchParams();
  const productSlug = searchParams.get("product");

  useEffect(() => {
    setPageMeta("Payment Failed", "Your payment was not completed. Try again or contact support.");
  }, []);

  return (
    <div className="section-gap">
      <div className="container-shell">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="page-header">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-red-700">
                <AlertTriangle className="h-4 w-4" />
                Payment cancelled or failed
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">We couldn&apos;t complete your purchase</h1>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  You can retry the payment flow or contact support if the issue continues.
                </p>
              </div>
            </div>
            <div className="section-block p-4">
              <div className="section-title">What to do next</div>
              <p className="mt-2 page-copy">Retry checkout from the product page or reach support if you were charged but did not receive confirmation.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to={productSlug ? `/products/${productSlug}?checkout=1` : "/products"}
              className={buttonStyles({ size: "lg" })}
            >
              Retry Payment
            </Link>
            <Link to="/contact" className={buttonStyles({ variant: "secondary", size: "lg" })}>
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
