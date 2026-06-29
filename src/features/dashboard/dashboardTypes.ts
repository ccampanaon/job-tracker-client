export type DateRange = '30d' | '90d' | '6m' | 'all';

export interface KpiStats {
  total: number;
  active: number;
  interview: number;
  offers: number;
  responseRate: number;
}

export interface WeekBucket {
  week: string;
  label: string;
  count: number;
}

export interface LabelCount {
  label: string;
  count: number;
}

export interface DashboardStats {
  kpi: KpiStats;
  weeklyTrend: WeekBucket[];
  byStatus: LabelCount[];
  bySource: LabelCount[];
  byRole: LabelCount[];
  byJobType: LabelCount[];
  byLocation: LabelCount[];
  topSkills: LabelCount[];
  funnel: LabelCount[];
}
