import { useEffect } from "react";
import { aboutBullets, brand } from "@shared/brand";
import { setPageMeta } from "../lib/utils";

export default function About() {
  useEffect(() => {
    setPageMeta("About", "Learn what Templyfy sells and why digital templates save time for business users.");
  }, []);

  return (
    <div className="section-gap">
      <div className="container-shell space-y-8">
        <div className="page-header">
          <div>
            <div className="section-title">About {brand.name}</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Digital templates designed to remove spreadsheet friction
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              {brand.name} sells business-focused Excel templates, VBA tools, Google Sheets dashboards, automation resources, and other premium digital downloads for practical daily work.
            </p>
          </div>
          <div className="section-block p-4">
            <div className="section-title">Who it serves</div>
            <p className="mt-2 page-copy">
              Accountants, analysts, students, freelancers, founders, HR teams, and operators who want a faster starting point than building files from scratch.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="data-list">
            {aboutBullets.map((item, index) => (
              <div key={item} className="data-row md:grid-cols-[32px_1fr] md:items-start">
                <div className="text-sm font-semibold text-electric">0{index + 1}</div>
                <p className="text-sm leading-7 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="section-block p-4">
              <div className="section-title">Why templates save time</div>
              <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
                <p>They reduce setup time for repeatable processes like invoicing, reporting, attendance tracking, budgeting, and project management.</p>
                <p>They reduce formula mistakes and inconsistent layouts by starting with a structured business-ready file.</p>
                <p>They fit lean teams that need immediate value without committing to a larger software subscription.</p>
              </div>
            </div>
            <div className="section-block-dark p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">Business focus</div>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Templyfy is positioned as a practical marketplace, not a generic download site. The goal is cleaner workflows, faster adoption, and secure digital delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
