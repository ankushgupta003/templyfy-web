import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Send, X } from "lucide-react";
import Button from "../../components/Button";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import { api, expectApiArray, expectApiObject, getApiErrorMessage, type AdminOrder } from "../../lib/api";
import { formatCurrency, formatDate, setPageMeta } from "../../lib/utils";

const statusStyles: Record<AdminOrder["status"], string> = {
  CREATED: "bg-slate-100 text-slate-600",
  PAID: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-700",
  REFUNDED: "bg-amber-50 text-amber-700",
};

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    setPageMeta("Admin Orders", "Monitor payment status, email delivery logs, and secure download operations.");
  }, []);

  const ordersQuery = useQuery({
    queryKey: ["admin", "orders", search, status],
    queryFn: async () => {
      const response = await api.get<AdminOrder[]>("/admin/orders", {
        params: {
          search: search || undefined,
          status: status || undefined,
        },
      });
      return expectApiArray<AdminOrder>(response.data, "/admin/orders");
    },
  });

  const selectedOrderQuery = useQuery({
    queryKey: ["admin", "order", selectedOrderId],
    queryFn: async () => {
      const response = await api.get<AdminOrder>(`/admin/orders/${selectedOrderId}`);
      return expectApiObject<AdminOrder>(response.data, `/admin/orders/${selectedOrderId}`);
    },
    enabled: Boolean(selectedOrderId),
  });

  const resendEmailMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post(`/admin/orders/${orderId}/resend-email`);
      return response.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "order"] }),
      ]);
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error));
    },
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="section-title">Order operations</div>
          <h1 className="mt-2 text-2xl font-bold">Orders</h1>
          <p className="mt-3 page-copy">
            Track payment outcomes, customer details, delivery logs, and secure download activity from a single compact order view.
          </p>
        </div>
        <div className="section-block p-4">
          <div className="section-title">Backend flow</div>
          <p className="mt-2 page-copy">
            Paid status depends on signature verification. Download links and email sends can be reviewed and resent from here.
          </p>
        </div>
      </div>

      <div className="section-block p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.35fr_0.75fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by order number, customer, email..." className="pl-11" />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All payment statuses</option>
            <option value="CREATED">Created</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
      ) : null}

      {ordersQuery.isLoading ? (
        <Loader label="Loading orders..." />
      ) : ordersQuery.data?.length ? (
        <div className="data-list">
          {ordersQuery.data.map((order) => (
            <div key={order.id} className="data-row xl:grid-cols-[1.1fr_1fr_auto] xl:items-start">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-lg font-semibold text-ink">{order.orderNumber}</div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <div className="info-label">Product</div>
                    <div className="mt-1 font-medium text-slate-700">{order.product.title}</div>
                  </div>
                  <div>
                    <div className="info-label">Customer</div>
                    <div className="mt-1 font-medium text-slate-700">{order.customerEmail}</div>
                  </div>
                  <div>
                    <div className="info-label">Payment ID</div>
                    <div className="mt-1 font-medium text-slate-700">{order.razorpayPaymentId ?? "Not paid yet"}</div>
                  </div>
                  <div>
                    <div className="info-label">Created</div>
                    <div className="mt-1 font-medium text-slate-700">{formatDate(order.createdAt)}</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <div className="info-label">Amount</div>
                  <div className="mt-1 font-medium text-slate-700">{formatCurrency(order.amount)}</div>
                </div>
                <div>
                  <div className="info-label">Phone</div>
                  <div className="mt-1 font-medium text-slate-700">{order.customerPhone}</div>
                </div>
                <div>
                  <div className="info-label">Order status</div>
                  <div className="mt-1 font-medium text-slate-700">{order.status}</div>
                </div>
                <div>
                  <div className="info-label">Paid at</div>
                  <div className="mt-1 font-medium text-slate-700">{formatDate(order.paidAt)}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 xl:justify-end">
                <Button variant="secondary" size="sm" onClick={() => setSelectedOrderId(order.id)}>
                  View details
                </Button>
                <Button
                  size="sm"
                  onClick={() => resendEmailMutation.mutate(order.id)}
                  disabled={resendEmailMutation.isPending || order.status !== "PAID"}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Resend email
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No orders found" description="Orders will appear here after checkout attempts begin." />
      )}

      {selectedOrderId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4 py-8 backdrop-blur-sm">
          <div className="section-block w-full max-w-5xl bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="section-title">Order details</div>
                <h2 className="mt-2 text-2xl font-bold">{selectedOrderQuery.data?.orderNumber ?? "Loading..."}</h2>
              </div>
              <button type="button" className="rounded-full border border-slate-200 bg-white p-2 text-slate-600" onClick={() => setSelectedOrderId(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            {selectedOrderQuery.isLoading ? (
              <div className="mt-4">
                <Loader label="Loading order details..." />
              </div>
            ) : selectedOrderQuery.data ? (
              <div className="mt-5 space-y-5">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Customer", selectedOrderQuery.data.customerName],
                    ["Email", selectedOrderQuery.data.customerEmail],
                    ["Phone", selectedOrderQuery.data.customerPhone],
                    ["Paid at", formatDate(selectedOrderQuery.data.paidAt)],
                    ["Created at", formatDate(selectedOrderQuery.data.createdAt)],
                    ["Product", selectedOrderQuery.data.product.title],
                    ["Razorpay order", selectedOrderQuery.data.razorpayOrderId ?? "Not available"],
                    ["Payment ID", selectedOrderQuery.data.razorpayPaymentId ?? "Not available"],
                  ].map(([label, value]) => (
                    <div key={label} className="section-block p-3">
                      <div className="info-label">{label}</div>
                      <div className="mt-2 text-sm font-medium text-slate-700">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="section-block">
                    <div className="border-b border-slate-200 px-4 py-3">
                      <div className="section-title">Email logs</div>
                    </div>
                    {selectedOrderQuery.data.emailLogs.length ? (
                      <div className="divide-y divide-slate-200">
                        {selectedOrderQuery.data.emailLogs.map((log) => (
                          <div key={log.id} className="px-4 py-3">
                            <div className="flex items-center justify-between gap-4">
                              <div className="text-sm font-semibold text-ink">{log.subject}</div>
                              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{log.status}</div>
                            </div>
                            <div className="mt-1 text-sm text-slate-600">{log.recipient}</div>
                            <div className="mt-1 text-xs text-slate-400">{formatDate(log.createdAt)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-4 text-sm text-slate-500">No email logs yet.</div>
                    )}
                  </div>

                  <div className="section-block">
                    <div className="border-b border-slate-200 px-4 py-3">
                      <div className="section-title">Download token logs</div>
                    </div>
                    {selectedOrderQuery.data.downloadTokens?.length ? (
                      <div className="divide-y divide-slate-200">
                        {selectedOrderQuery.data.downloadTokens.map((token) => (
                          <div key={token.id} className="px-4 py-3">
                            <div className="text-sm font-semibold text-ink">Token {token.id.slice(0, 8)}</div>
                            <div className="mt-1 text-sm text-slate-600">Downloads: {token.downloadCount}</div>
                            <div className="mt-1 text-sm text-slate-600">Expires: {formatDate(token.expiresAt)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-4 text-sm text-slate-500">No download links generated yet.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
