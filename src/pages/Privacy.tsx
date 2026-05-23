import { useEffect } from "react";
import { setPageMeta } from "../lib/utils";

export default function Privacy() {
  useEffect(() => {
    setPageMeta("Privacy Policy", "Learn how Templyfy handles customer information and payment-related data.");
  }, []);

  return (
    <div className="section-gap">
      <div className="container-shell space-y-8">
        <div className="page-header">
          <div>
            <div className="section-title">Privacy</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Privacy policy</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              This page outlines what information is collected to process purchases, deliver secure download links, and support post-purchase communication.
            </p>
          </div>
          <div className="section-block p-4">
            <div className="section-title">Payments</div>
            <p className="mt-2 page-copy">
              Checkout is handled through Razorpay. Sensitive payment credentials are not entered manually into this website.
            </p>
          </div>
        </div>

        <div className="data-list">
          {[
            "Customer data such as name, email, phone number, and order history is collected to process purchases and deliver digital products.",
            "Payments are handled through Razorpay Checkout. Payment credentials are not entered manually into this website.",
            "Email delivery is used to send secure download links and essential order updates.",
            "Cookies placeholder: Add your final analytics and cookie disclosure before launch.",
            "Stored data should be managed according to your business compliance and retention requirements.",
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
