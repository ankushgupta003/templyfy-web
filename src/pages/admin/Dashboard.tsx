import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, CircleDollarSign, FileText, Package, ShoppingBag, TriangleAlert } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import { api, type DashboardSummary } from "../../lib/api";
import { formatCurrency, formatDate, setPageMeta } from "../../lib/utils";

const metricCards = [
  { key: "totalProducts", label: "Total products", icon: Package },
  { key: "totalOrders", label: "Total orders", icon: ShoppingBag },
  { key: "revenue", label: "Revenue", icon: CircleDollarSign },
  { key: "paidOrders", label: "Paid orders", icon: Activity },
  { key: "failedPayments", label: "Failed payments", icon: TriangleAlert },
  { key: "blogPosts", label: "Blog posts", icon: FileText },
] as const;

export default function AdminDashboard() {
  useEffect(() => {
    setPageMeta("Admin Dashboard", "Track Templyfy products, orders, revenue, and content operations.");
  }, []);

  const summaryQuery = useQuery({
    queryKey: ["admin", "dashboard-summary"],
    queryFn: async () => {
      const response = await api.get<DashboardSummary>("/admin/orders/dashboard-summary");
      return response.data;
    },
  });

  if (summaryQuery.isLoading) {
    return <Loader label="Loading dashboard..." />;
  }

  if (!summaryQuery.data) {
    return <EmptyState title="Dashboard data unavailable" description="Check your backend connection and seed data to populate analytics." />;
  }

  const { metrics, recentOrders, salesSeries } = summaryQuery.data;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="section-title">Operations snapshot</div>
          <h1 className="mt-2 text-2xl font-bold">Store performance and recent activity</h1>
          <p className="mt-3 page-copy">
            Review order volume, paid revenue, content output, and recent customer activity from a denser admin overview.
          </p>
        </div>
        <div className="section-block p-4">
          <div className="section-title">Quick note</div>
          <p className="mt-2 page-copy">
            Orders are marked paid only after payment verification. Download delivery and email logs are tracked from the backend.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => {
          const Icon = card.icon;
          const rawValue = metrics[card.key];
          const displayValue = card.key === "revenue" ? formatCurrency(rawValue) : rawValue.toLocaleString("en-IN");

          return (
            <div key={card.key} className="section-block p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="info-label">{card.label}</div>
                  <div className="mt-2 text-2xl font-bold text-ink">{displayValue}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-electric">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="section-block p-4 sm:p-5">
          <div className="border-b border-slate-200 pb-3">
            <div className="section-title">Sales chart</div>
            <h2 className="mt-2 text-xl font-bold">Last 7 days revenue</h2>
          </div>
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesSeries}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => value.toLocaleString("en-IN")} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" fill="url(#salesGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-block p-4 sm:p-5">
          <div className="border-b border-slate-200 pb-3">
            <div className="section-title">Recent orders</div>
            <h2 className="mt-2 text-xl font-bold">Latest activity</h2>
          </div>
          {recentOrders.length ? (
            <div className="mt-4 divide-y divide-slate-200">
              {recentOrders.map((order) => (
                <div key={order.id} className="grid gap-2 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold text-ink">{order.orderNumber}</div>
                    <div className="text-sm font-semibold text-ink">{formatCurrency(order.amount)}</div>
                  </div>
                  <div className="text-sm text-slate-600">{order.productName}</div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>{order.customerEmail}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{order.status}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState title="No recent orders yet" description="Seed demo orders or complete a checkout to populate recent activity." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
