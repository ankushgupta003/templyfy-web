type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="section-block flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        Nothing here yet
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="max-w-lg text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
