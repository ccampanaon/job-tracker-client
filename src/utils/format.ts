/** Formats a "YYYY-MM-DD" date string without UTC timezone shift. */
export function formatDate(iso: string | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return '—';
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', opts);
}

export function formatSalary(
  min?: number | null,
  max?: number | null,
  type?: string | null,
): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`);
  const range = min && max ? `${fmt(min)} – ${fmt(max)}` : fmt((min ?? max)!);
  return type ? `${range} / ${type}` : range;
}
