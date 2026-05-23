import { useEffect, useState } from "react";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

export const useRazorpay = () => {
  const [isReady, setIsReady] = useState(Boolean(window.Razorpay));

  useEffect(() => {
    if (window.Razorpay) {
      setIsReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => setIsReady(true);
    script.onerror = () => setIsReady(false);
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  const openCheckout = (options: RazorpayOptions, onFailure?: () => void) => {
    if (!window.Razorpay) {
      throw new Error("Razorpay SDK failed to load.");
    }

    const instance = new window.Razorpay(options);

    if (onFailure) {
      instance.on("payment.failed", onFailure);
    }

    instance.open();
  };

  return {
    isReady,
    openCheckout,
  };
};

