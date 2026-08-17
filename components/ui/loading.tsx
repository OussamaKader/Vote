export function Loading({ label = "Chargement..." }: { label?: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="flex items-center gap-3 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        {label}
      </div>
    </div>
  );
}
