import type { Application, ApplicationStatus } from '@/types';
import { STATUS_LABEL } from '@/types';
import type { DateRange, DashboardStats, KpiStats, LabelCount, WeekBucket } from './dashboardTypes';

// ─── Date helpers ──────────────────────────────────────────────────────────────

function getWeekStart(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  // Monday-anchored
  const diff = (day === 0 ? -6 : 1 - day);
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function toWeekKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatWeekLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function appDate(app: Application): Date {
  return new Date(app.appliedDate ?? app.createdAt);
}

// ─── Exported utilities ────────────────────────────────────────────────────────

export function filterByDateRange(apps: Application[], range: DateRange): Application[] {
  if (range === 'all') return apps;
  const days = range === '30d' ? 30 : range === '90d' ? 90 : 180;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return apps.filter((a) => appDate(a).getTime() >= cutoff);
}

export function computeKpi(apps: Application[]): KpiStats {
  const total = apps.length;
  const active = apps.filter(
    (a) => a.status !== 'rejected' && a.status !== 'not_selected',
  ).length;
  const interview = apps.filter((a) => a.status === 'interview').length;
  const offers = apps.filter((a) => a.status === 'offer').length;
  const responseRate = total > 0 ? Math.round((active / total) * 100) : 0;
  return { total, active, interview, offers, responseRate };
}

export function groupByWeek(apps: Application[], range: DateRange): WeekBucket[] {
  if (apps.length === 0) return [];

  const now = new Date();
  let startDate: Date;

  if (range === 'all') {
    const earliest = apps
      .map((a) => appDate(a))
      .reduce((min, d) => (d < min ? d : min), now);
    startDate = earliest < now ? earliest : now;
  } else {
    const days = range === '30d' ? 30 : range === '90d' ? 90 : 180;
    startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  }

  const firstWeek = getWeekStart(startDate);
  const buckets = new Map<string, WeekBucket>();

  const current = new Date(firstWeek);
  while (current <= now) {
    const key = toWeekKey(current);
    buckets.set(key, { week: key, label: formatWeekLabel(current), count: 0 });
    current.setDate(current.getDate() + 7);
  }

  for (const app of apps) {
    const d = appDate(app);
    const key = toWeekKey(getWeekStart(d));
    const bucket = buckets.get(key);
    if (bucket) bucket.count++;
  }

  return Array.from(buckets.values());
}

export function countByField(
  apps: Application[],
  field: keyof Pick<Application, 'status' | 'source' | 'role' | 'jobType' | 'location'>,
): LabelCount[] {
  const counts = new Map<string, number>();
  for (const app of apps) {
    const raw = app[field];
    const label = raw != null && raw !== '' ? String(raw) : 'Unknown';
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function countTopSkills(apps: Application[], n = 5): LabelCount[] {
  const counts = new Map<string, number>();
  const display = new Map<string, string>();

  for (const app of apps) {
    for (const skill of app.skills ?? []) {
      const trimmed = skill.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
      if (!display.has(key)) display.set(key, trimmed);
    }
  }

  return Array.from(counts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([key, count]) => ({ label: display.get(key) ?? key, count }));
}

export function buildFunnel(apps: Application[]): LabelCount[] {
  const stages: ApplicationStatus[] = ['applied', 'reviewing', 'interview', 'offer'];
  return stages.map((stage, i) => {
    const remaining = stages.slice(i);
    const count = apps.filter((a) => remaining.includes(a.status)).length;
    return { label: STATUS_LABEL[stage], count };
  });
}

export function computeStats(apps: Application[], range: DateRange): DashboardStats {
  const filtered = filterByDateRange(apps, range);
  return {
    kpi: computeKpi(filtered),
    weeklyTrend: groupByWeek(filtered, range),
    byStatus: countByField(filtered, 'status'),
    bySource: countByField(filtered, 'source'),
    byRole: countByField(filtered, 'role'),
    byJobType: countByField(filtered, 'jobType'),
    byLocation: countByField(filtered, 'location'),
    topSkills: countTopSkills(filtered, 5),
    funnel: buildFunnel(filtered),
  };
}
