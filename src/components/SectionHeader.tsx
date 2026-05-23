type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export default function SectionHeader({ eyebrow, title, description, align = "left" }: SectionHeaderProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow ? (
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-electric">{eyebrow}</div>
      ) : null}
      <h2 className="text-2xl font-bold tracking-tight sm:text-[2rem]">{title}</h2>
      {description ? <p className="mt-3 text-[15px] leading-7 text-slate-600">{description}</p> : null}
    </div>
  );
}
