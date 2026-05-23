import { useEffect } from "react";
import { setPageMeta } from "../lib/utils";

export default function Terms() {
  useEffect(() => {
    setPageMeta("Terms", "Digital product terms for purchases made on Templyfy.");
  }, []);

  return (
    <div className="section-gap">
      <div className="container-shell space-y-8">
        <div className="page-header">
          <div>
            <div className="section-title">Terms</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Digital product terms</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Clear commercial terms are important for digital downloads because delivery happens instantly after verified payment and there is no physical shipping stage.
            </p>
          </div>
          <div className="section-block p-4">
            <div className="section-title">Current status</div>
            <p className="mt-2 page-copy">
              Review and finalize your refund policy and license terms before production launch so customer expectations are explicit.
            </p>
          </div>
        </div>

        <div className="data-list">
          {[
            "All products sold on Templyfy are digital downloads. No physical shipping is involved.",
            "Delivery happens online after successful payment verification through Razorpay.",
            "Refund policy placeholder: Add your final refund and cancellation policy before going live.",
            "License terms placeholder: Add your commercial or personal usage rights before production launch.",
            "Customers are responsible for reviewing compatibility notes and requirements before purchase.",
          ].map((item, index) => (
            <div key={item} className="data-row md:grid-cols-[32px_1fr] md:items-start">
              <div className="text-sm font-semibold text-electric">0{index + 1}</div>
              <p className="text-sm leading-7 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
