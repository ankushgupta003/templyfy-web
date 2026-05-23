import { blogCategories, productCategories } from "./brand";

export type DemoProductSeed = {
  title: string;
  category: (typeof productCategories)[number];
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  fileType: "XLSM" | "XLSX" | "Google Sheet" | "PDF" | "ZIP";
  compatibility: string;
  version: string;
  features: string[];
  includedFiles: string[];
  requirements: string;
  isFeatured: boolean;
};

export type DemoBlogSeed = {
  title: string;
  excerpt: string;
  category: (typeof blogCategories)[number];
  tags: string[];
  author: string;
  status: "PUBLISHED" | "DRAFT";
  seoTitle: string;
  seoDescription: string;
  content: string;
};

export const demoProducts: DemoProductSeed[] = [
  {
    title: "Excel GST Invoice Automation Template",
    category: "Invoice Templates",
    shortDescription: "Create GST-ready invoices with automated totals, tax splits, and print-friendly formatting.",
    description:
      "A polished Excel invoice system built for freelancers, consultants, and small businesses that need faster billing with fewer errors.",
    price: 299,
    compareAtPrice: 499,
    fileType: "XLSM",
    compatibility: "Microsoft Excel 2019+, Microsoft 365, Windows",
    version: "2.1.0",
    features: [
      "Auto-calculates CGST, SGST, and IGST",
      "Customer master and invoice numbering",
      "Printable invoice layout",
      "Monthly invoice summary sheet",
    ],
    includedFiles: ["Excel macro-enabled invoice workbook", "Quick setup guide PDF"],
    requirements: "Microsoft Excel with macros enabled.",
    isFeatured: true,
  },
  {
    title: "Inventory Management Excel Dashboard",
    category: "Inventory Templates",
    shortDescription: "Track stock movement, reorder levels, and fast-moving items with a clean dashboard.",
    description:
      "A professional inventory workbook for small teams that need clear visibility into current stock, supplier activity, and reorder planning.",
    price: 499,
    compareAtPrice: 799,
    fileType: "XLSX",
    compatibility: "Microsoft Excel 2019+, Microsoft 365, Windows/Mac",
    version: "1.8.4",
    features: [
      "Current stock dashboard",
      "Incoming and outgoing inventory logs",
      "Reorder alerts and highlights",
      "SKU-level reporting",
    ],
    includedFiles: ["Inventory dashboard workbook", "Getting started checklist"],
    requirements: "Microsoft Excel with formulas enabled.",
    isFeatured: true,
  },
  {
    title: "VBA Attendance Tracker",
    category: "Excel VBA Tools",
    shortDescription: "Record attendance, shift timing, and leave data with VBA-powered controls.",
    description:
      "Designed for HR teams and institutes that want faster attendance logging, cleaner monthly summaries, and fewer manual edits.",
    price: 799,
    fileType: "XLSM",
    compatibility: "Microsoft Excel 2019+, Microsoft 365, Windows",
    version: "3.0.2",
    features: [
      "User-friendly data entry buttons",
      "Monthly attendance summary",
      "Leave and late mark tracking",
      "Protected summary sheets",
    ],
    includedFiles: ["Attendance tracker workbook", "Configuration guide PDF"],
    requirements: "Microsoft Excel with macros enabled.",
    isFeatured: false,
  },
  {
    title: "Google Sheets Expense Tracker",
    category: "Google Sheets Templates",
    shortDescription: "Track expenses, vendor payments, and monthly spend in a shareable Google Sheet.",
    description:
      "A lightweight but professional expense system for teams and founders who need collaborative budgeting without a heavy setup.",
    price: 199,
    compareAtPrice: 299,
    fileType: "Google Sheet",
    compatibility: "Google Sheets, modern browsers",
    version: "1.4.0",
    features: [
      "Category-wise expense dashboard",
      "Monthly budget vs actual view",
      "Team-friendly Google Sheets format",
      "No add-ons required",
    ],
    includedFiles: ["Google Sheets template copy link", "Usage notes PDF"],
    requirements: "Google account and internet access.",
    isFeatured: true,
  },
  {
    title: "Sales CRM Excel Template",
    category: "Excel Templates",
    shortDescription: "Manage leads, follow-ups, deal stages, and sales activity in Excel.",
    description:
      "Built for service businesses and lean teams that need a simple CRM without committing to a full SaaS subscription.",
    price: 999,
    fileType: "XLSX",
    compatibility: "Microsoft Excel 2019+, Microsoft 365, Windows/Mac",
    version: "2.3.1",
    features: [
      "Pipeline view with deal stage filters",
      "Lead owner and reminder tracking",
      "Sales performance summary",
      "Client follow-up notes",
    ],
    includedFiles: ["CRM workbook", "Sample data sheet"],
    requirements: "Microsoft Excel.",
    isFeatured: true,
  },
  {
    title: "Project Management Google Sheets Dashboard",
    category: "Project Management",
    shortDescription: "Plan timelines, owners, milestones, and delivery status in a collaborative dashboard.",
    description:
      "A modern project tracker for agencies, operations teams, and founders who want a practical shared view of delivery work.",
    price: 499,
    fileType: "Google Sheet",
    compatibility: "Google Sheets, modern browsers",
    version: "1.9.0",
    features: [
      "Milestone progress dashboard",
      "Task owner and due date tracking",
      "Visual status indicators",
      "Team update-friendly sheets",
    ],
    includedFiles: ["Google Sheets dashboard link", "Project setup notes"],
    requirements: "Google account and internet access.",
    isFeatured: false,
  },
  {
    title: "Payroll Calculator Excel Template",
    category: "HR Templates",
    shortDescription: "Calculate salary structure, deductions, and net pay with reusable formulas.",
    description:
      "A ready-to-use payroll workbook designed for small businesses that need cleaner salary processing and monthly payroll summaries.",
    price: 799,
    fileType: "XLSX",
    compatibility: "Microsoft Excel 2019+, Microsoft 365, Windows/Mac",
    version: "2.0.5",
    features: [
      "Salary breakup and deduction sheets",
      "Monthly payroll summary",
      "Employee-wise records",
      "Editable pay structure setup",
    ],
    includedFiles: ["Payroll workbook", "Implementation note PDF"],
    requirements: "Microsoft Excel.",
    isFeatured: false,
  },
  {
    title: "Business KPI Dashboard",
    category: "Business Dashboards",
    shortDescription: "Monitor revenue, targets, team metrics, and trends with executive-style reporting.",
    description:
      "A premium dashboard for analysts, managers, and business owners who want cleaner KPI reporting without building everything from scratch.",
    price: 999,
    compareAtPrice: 1299,
    fileType: "XLSX",
    compatibility: "Microsoft Excel 2019+, Microsoft 365, Windows/Mac",
    version: "4.1.0",
    features: [
      "Executive summary dashboard",
      "Trend charts and KPI cards",
      "Monthly performance tabs",
      "Client-ready presentation look",
    ],
    includedFiles: ["KPI dashboard workbook", "Data mapping guide"],
    requirements: "Microsoft Excel.",
    isFeatured: true,
  },
];

export const demoBlogs: DemoBlogSeed[] = [
  {
    title: "Best Excel Templates for Small Business Operations",
    excerpt: "A practical guide to choosing spreadsheet systems that actually save time for lean teams.",
    category: "Templates Guide",
    tags: ["Excel", "Small Business", "Templates"],
    author: "Templyfy Team",
    status: "PUBLISHED",
    seoTitle: "Best Excel Templates for Small Business Operations | Templyfy",
    seoDescription: "Explore the most useful Excel templates for small businesses covering invoices, inventory, reporting, and planning.",
    content: `## Why templates still matter

Spreadsheets remain the quickest way for many businesses to launch operational systems without a long setup cycle.

## Templates worth prioritising

- Invoice automation templates
- Inventory dashboards
- Payroll calculators
- KPI reporting packs

## What to look for

Choose templates with clean inputs, protected formulas, clear instructions, and scalable layouts.`,
  },
  {
    title: "How VBA Automation Helps Teams Cut Repetitive Work",
    excerpt: "Where macro-powered workflows make sense and how to avoid fragile spreadsheet setups.",
    category: "VBA Automation",
    tags: ["VBA", "Automation", "Productivity"],
    author: "Templyfy Team",
    status: "PUBLISHED",
    seoTitle: "How VBA Automation Helps Teams Cut Repetitive Work | Templyfy",
    seoDescription: "Learn where Excel VBA saves time for reporting, attendance, and admin-heavy spreadsheet processes.",
    content: `## Common high-friction tasks

Manual invoice generation, repeated report formatting, and monthly consolidation often consume more time than the actual analysis.

## Where VBA helps

- Button-based workflows
- Data validation and cleanup
- Recurring summary generation
- Structured exports

## Start small

Automate one high-frequency process first and measure time saved.`,
  },
  {
    title: "Google Sheets Templates for Collaborative Planning",
    excerpt: "Shared planning systems work best when the sheet structure is simple and responsibilities stay visible.",
    category: "Google Sheets",
    tags: ["Google Sheets", "Project Management", "Collaboration"],
    author: "Templyfy Team",
    status: "PUBLISHED",
    seoTitle: "Google Sheets Templates for Collaborative Planning | Templyfy",
    seoDescription: "Use Google Sheets templates to manage shared timelines, owner assignments, and status updates across teams.",
    content: `## Why Google Sheets works well for teams

Fast access, no installation friction, and real-time editing make it a practical fit for shared planning.

## Build for clarity

- Keep one owner per task
- Use simple status labels
- Separate raw data from dashboards
- Add notes where context matters`,
  },
];

