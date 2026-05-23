import { Link } from "react-router-dom";
import { brand } from "@shared/brand";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white text-slate-600">
      <div className="container-shell grid gap-8 py-10 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-md text-sm leading-7 text-slate-400">
            Premium spreadsheet templates, VBA tools, dashboards, and automation resources for teams that want faster execution and cleaner business workflows.
          </p>
          <div className="inline-flex border border-slate-200 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-electric">
            Support: {brand.supportEmail}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-electric">Explore</h3>
          <div className="space-y-2.5 text-sm">
            <Link to="/products" className="block hover:text-ink">
              Products
            </Link>
            <Link to="/blog" className="block hover:text-ink">
              Blog
            </Link>
            <Link to="/about" className="block hover:text-ink">
              About
            </Link>
            <Link to="/contact" className="block hover:text-ink">
              Contact
            </Link>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-electric">Policies</h3>
          <div className="space-y-2.5 text-sm">
            <Link to="/terms" className="block hover:text-ink">
              Terms
            </Link>
            <Link to="/privacy" className="block hover:text-ink">
              Privacy
            </Link>
            <Link to="/admin/login" className="block hover:text-ink">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="container-shell py-4 text-xs uppercase tracking-[0.16em] text-slate-500">{brand.footer}</div>
      </div>
    </footer>
  );
}
