import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import { api, getApiErrorMessage, type StoreSettings } from "../../lib/api";
import { setPageMeta } from "../../lib/utils";
import { settingsSchema } from "../../lib/validation";

type SettingsFormValues = {
  storeName: string;
  supportEmail: string;
  downloadLinkExpiryHours: number;
};

export default function AdminSettings() {
  const queryClient = useQueryClient();

  useEffect(() => {
    setPageMeta("Admin Settings", "Manage store identity, support email, and download link expiry settings.");
  }, []);

  const settingsQuery = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const response = await api.get<StoreSettings>("/admin/settings");
      return response.data;
    },
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: "Templyfy",
      supportEmail: "support@templyfy.in",
      downloadLinkExpiryHours: 72,
    },
  });

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }

    form.reset({
      storeName: settingsQuery.data.storeName,
      supportEmail: settingsQuery.data.supportEmail,
      downloadLinkExpiryHours: settingsQuery.data.downloadLinkExpiryHours,
    });
  }, [form, settingsQuery.data]);

  const mutation = useMutation({
    mutationFn: async (values: SettingsFormValues) => {
      const response = await api.put("/admin/settings", values);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });

  const firstValidationError = Object.values(form.formState.errors).find(
    (error) => Boolean((error as { message?: string } | undefined)?.message),
  ) as { message?: string } | undefined;

  if (settingsQuery.isLoading) {
    return <Loader label="Loading settings..." />;
  }

  const integrations = settingsQuery.data?.integrations;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="section-title">Store settings</div>
          <h1 className="mt-2 text-2xl font-bold">Brand and delivery configuration</h1>
          <p className="mt-3 page-copy">
            Update the storefront identity, support channel, and download link expiry without touching backend secrets directly in the UI.
          </p>
        </div>
        <div className="section-block p-4">
          <div className="section-title">Integration view</div>
          <p className="mt-2 page-copy">
            Credentials remain environment-driven. This page is for editable store values and visibility into current integration placeholders.
          </p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <div className="section-block p-5 sm:p-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-xl font-bold">Editable settings</h2>
            </div>
            <div className="mt-5 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Store name</label>
                <input {...form.register("storeName")} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Support email</label>
                <input {...form.register("supportEmail")} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Download link expiry (hours)</label>
                <input type="number" {...form.register("downloadLinkExpiryHours")} />
              </div>
            </div>
          </div>

          <div className="section-block">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 className="text-xl font-bold">Integration placeholders</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {[
                ["Razorpay key ID", integrations?.razorpayKeyId ?? "Not configured"],
                ["Email host", integrations?.emailHost ?? "Not configured"],
                ["Email user", integrations?.emailUser ?? "Not configured"],
                ["From address", integrations?.emailFrom ?? "Not configured"],
                ["Webhook configured", integrations?.webhookConfigured ? "Yes" : "No"],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-2 px-5 py-3 sm:grid-cols-[180px_1fr] sm:items-center sm:px-6">
                  <div className="info-label">{label}</div>
                  <div className="text-sm font-medium text-slate-700">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {mutation.isError ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getApiErrorMessage(mutation.error)}
          </div>
        ) : null}
        {firstValidationError?.message ? (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {firstValidationError.message}
          </div>
        ) : null}
        {mutation.isSuccess ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Settings saved successfully.
          </div>
        ) : null}

        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save settings"}
        </Button>
      </form>
    </div>
  );
}
