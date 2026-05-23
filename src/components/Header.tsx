import { Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { brand } from "@shared/brand";
import Logo from "./Logo";
import { buttonStyles } from "./Button";
import { cn } from "../lib/utils";

const navLinks = [
  { to: "/products", label: "Products" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between gap-5">
        <Logo light />
        <nav className="hidden items-center gap-5 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium text-slate-500 hover:text-ink",
                  isActive && "text-ink",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <div className="border border-slate-200 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Secure delivery
          </div>
          <Link
            to="/admin/login"
            className={buttonStyles({
              variant: "secondary",
              size: "sm",
              className: "border-slate-200 bg-white text-ink",
            })}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Admin
          </Link>
        </div>
        <button className="text-ink md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="container-shell flex flex-col gap-3 py-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/admin/login"
              className={buttonStyles({
                variant: "secondary",
                className: "justify-center",
              })}
              onClick={() => setOpen(false)}
            >
              Admin Login
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
