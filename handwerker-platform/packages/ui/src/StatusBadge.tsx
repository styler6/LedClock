export function StatusBadge({ status, labels }: { status: string; labels: Record<string, { label: string; className: string }> }) {
  const entry = labels[status] ?? { label: status, className: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${entry.className}`}>
      {entry.label}
    </span>
  );
}
