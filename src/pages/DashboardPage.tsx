import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '@/features/dashboard/useDashboardStats';
import type { DateRange } from '@/features/dashboard/dashboardTypes';
import { KpiCard } from '@/components/KpiCard';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { WeeklyTrendChart } from '@/components/charts/WeeklyTrendChart';
import { StatusDonutChart } from '@/components/charts/StatusDonutChart';
import { FunnelChart } from '@/components/charts/FunnelChart';
import { SourceBarChart } from '@/components/charts/SourceBarChart';
import { RoleBarChart } from '@/components/charts/RoleBarChart';
import { JobTypeDonutChart } from '@/components/charts/JobTypeDonutChart';
import { LocationDonutChart } from '@/components/charts/LocationDonutChart';
import { TopSkillsChart } from '@/components/charts/TopSkillsChart';
import { EmptyState } from '@/components/EmptyState';

function IconClipboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

function IconFlame() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function DashboardPage() {
  const [range, setRange] = useState<DateRange>('all');
  const { stats, isLoading } = useDashboardStats(range);

  if (isLoading) return <DashboardSkeleton />;

  if (!stats || stats.kpi.total === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-bold text-ink-900">Dashboard</h1>
          <DateRangeFilter value={range} onChange={setRange} />
        </div>
        <EmptyState
          title="No applications yet"
          body="Start tracking your job applications to see insights here."
          action={
            <Link to="/" className="btn-primary">
              Go to Applications
            </Link>
          }
        />
      </div>
    );
  }

  const { kpi, weeklyTrend, byStatus, bySource, byRole, byJobType, byLocation, topSkills, funnel } = stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-ink-900">Dashboard</h1>
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Total applications"
          value={kpi.total}
          icon={<IconClipboard />}
          accentColor="#ef4444"
        />
        <KpiCard
          title="Active pipeline"
          value={kpi.active}
          icon={<IconFlame />}
          accentColor="#22c55e"
          subtitle={`${kpi.responseRate}% response rate`}
          trend={
            kpi.active > 0
              ? { label: `${kpi.responseRate}% active`, positive: kpi.responseRate >= 50 }
              : undefined
          }
        />
        <KpiCard
          title="In interview"
          value={kpi.interview}
          icon={<IconChat />}
          accentColor="#f97316"
        />
        <KpiCard
          title="Offers received"
          value={kpi.offers}
          icon={<IconStar />}
          accentColor="#6366f1"
          trend={
            kpi.offers > 0
              ? { label: `${kpi.offers} offer${kpi.offers > 1 ? 's' : ''}`, positive: true }
              : undefined
          }
        />
      </div>

      {/* Weekly trend — full width */}
      <WeeklyTrendChart data={weeklyTrend} />

      {/* Status donut + Funnel */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatusDonutChart data={byStatus} />
        <FunnelChart data={funnel} />
      </div>

      {/* Source / Role / Job type */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SourceBarChart data={bySource} />
        <RoleBarChart data={byRole} />
        <JobTypeDonutChart data={byJobType} />
      </div>

      {/* Location + Skills */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <LocationDonutChart data={byLocation} />
        <div className="md:col-span-2">
          <TopSkillsChart data={topSkills} />
        </div>
      </div>
    </div>
  );
}
