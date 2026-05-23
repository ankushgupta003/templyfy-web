import { BarChart3, FileText, LayoutGrid, LogOut, Package, Settings, ShoppingBag } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[240px_1fr]">
        <aside className="border-r border-slate-200 bg-slate-50 px-5 py-6 text-slate-700">
          <Logo href="/admin" />
          <div className="mt-6 border border-slate-200 bg-white p-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-electric">Admin</div>
            <div className="mt-2 text-sm">{user?.email}</div>
          </div>
          <nav className="mt-6 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 border border-transparent px-4 py-3 text-sm font-medium text-slate-500 transition hover:border-slate-200 hover:bg-white hover:text-ink",
                      isActive && "border-slate-200 bg-white text-ink",
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={logout}
            className="mt-6 flex w-full items-center gap-3 border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500 transition hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>
        <div className="min-w-0">
          <div className="border-b border-slate-200 bg-white px-6 py-5 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-electric">Templyfy Admin</div>
                <h1 className="mt-1 text-2xl font-bold">Manage products, orders, and content</h1>
              </div>
              <div className="hidden border border-slate-200 px-4 py-2 text-sm text-slate-500 md:flex md:items-center md:gap-2">
                <BarChart3 className="h-4 w-4 text-electric" />
                Business operations dashboard
              </div>
            </div>
          </div>
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
