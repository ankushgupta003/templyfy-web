import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { brand } from "@shared/brand";
import { api } from "../lib/api";
import { setPageMeta } from "../lib/utils";
import { contactSchema } from "../lib/validation";
import Button from "../components/Button";

type ContactFormValues = {
  name: string;
  email: string;
  message: string;
};

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setPageMeta("Contact", "Send a message about support, purchases, or digital product queries.");
  }, []);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      const response = await api.post("/contact", values);
      return response.data;
    },
    onSuccess: () => {
      setSubmitted(true);
      form.reset();
    },
  });

  return (
    <div className="section-gap">
      <div className="container-shell space-y-8">
        <div className="page-header">
          <div>
            <div className="section-title">Contact</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Need help with a purchase or delivery?</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Reach out for support, licensing questions, delivery help, or product fit clarifications.
            </p>
          </div>
          <div className="section-block p-4">
            <div className="section-title">Support details</div>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <div>
                <div className="info-label">Support email</div>
                <div className="mt-1 font-medium text-slate-700">{brand.supportEmail}</div>
              </div>
              <div>
                <div className="info-label">Response time</div>
                <div className="mt-1 font-medium text-slate-700">Within 1-2 business days</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="data-list">
            {[
              ["Purchase support", "Checkout, delivery, or download link issues"],
              ["Product fit", "Questions before buying a template or tool"],
              ["Licensing", "Usage clarification for teams or client work"],
            ].map(([title, description]) => (
              <div key={title} className="data-row">
                <div className="text-sm font-semibold text-ink">{title}</div>
                <div className="text-sm leading-6 text-slate-600">{description}</div>
              </div>
            ))}
          </div>

          <form className="section-block p-5 sm:p-6" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Name</label>
                <input {...form.register("name")} placeholder="Your name" />
                {form.formState.errors.name ? <p className="mt-2 text-sm text-red-600">{form.formState.errors.name.message}</p> : null}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <input {...form.register("email")} placeholder="you@example.com" />
                {form.formState.errors.email ? <p className="mt-2 text-sm text-red-600">{form.formState.errors.email.message}</p> : null}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Message</label>
                <textarea rows={6} {...form.register("message")} placeholder="Tell us how we can help" />
                {form.formState.errors.message ? (
                  <p className="mt-2 text-sm text-red-600">{form.formState.errors.message.message}</p>
                ) : null}
              </div>
            </div>

            {submitted ? (
              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Your message has been received. We&apos;ll get back to you soon.
              </div>
            ) : null}

            <div className="mt-5">
              <Button type="submit" size="lg" disabled={mutation.isPending}>
                {mutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
