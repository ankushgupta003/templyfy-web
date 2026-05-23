export default function Loader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="flex items-center gap-3 border border-slate-200 bg-white px-5 py-3">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-electric" />
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
    </div>
  );
}
