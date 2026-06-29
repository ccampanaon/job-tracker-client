import { describe, it, expect } from 'vitest';
import {
  filterByDateRange,
  computeKpi,
  groupByWeek,
  countByField,
  countTopSkills,
  buildFunnel,
} from './dashboardUtils';
import type { Application } from '@/types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeApp(overrides: Partial<Application> = {}): Application {
  return {
    id: 'a1',
    companyId: 'c1',
    jobTitle: 'Engineer',
    status: 'applied',
    appliedDate: '2026-06-01',
    createdAt: '2026-06-01T00:00:00Z',
    skills: [],
    ...overrides,
  };
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);

// ─── filterByDateRange ─────────────────────────────────────────────────────────

describe('filterByDateRange', () => {
  it('returns all apps when range is "all"', () => {
    const apps = [
      makeApp({ appliedDate: '2020-01-01' }),
      makeApp({ appliedDate: '2025-01-01' }),
    ];
    expect(filterByDateRange(apps, 'all')).toHaveLength(2);
  });

  it('keeps apps within the last 30 days', () => {
    const recent = makeApp({ appliedDate: TODAY_ISO });
    const old = makeApp({ appliedDate: '2024-01-01' });
    const result = filterByDateRange([recent, old], '30d');
    expect(result).toContain(recent);
    expect(result).not.toContain(old);
  });

  it('keeps apps within the last 90 days', () => {
    const recent = makeApp({ appliedDate: TODAY_ISO });
    const old = makeApp({ appliedDate: '2023-01-01' });
    expect(filterByDateRange([recent, old], '90d')).toHaveLength(1);
  });

  it('keeps apps within the last 6 months', () => {
    const recent = makeApp({ appliedDate: TODAY_ISO });
    const old = makeApp({ appliedDate: '2024-01-01' });
    expect(filterByDateRange([recent, old], '6m')).toContain(recent);
    expect(filterByDateRange([recent, old], '6m')).not.toContain(old);
  });

  it('falls back to createdAt when appliedDate is null', () => {
    const app = makeApp({ appliedDate: null, createdAt: TODAY_ISO + 'T00:00:00Z' });
    expect(filterByDateRange([app], '30d')).toHaveLength(1);
  });
});

// ─── computeKpi ───────────────────────────────────────────────────────────────

describe('computeKpi', () => {
  it('returns all zeros for empty list', () => {
    const kpi = computeKpi([]);
    expect(kpi).toEqual({ total: 0, active: 0, interview: 0, offers: 0, responseRate: 0 });
  });

  it('counts total correctly', () => {
    const apps = [makeApp(), makeApp(), makeApp()];
    expect(computeKpi(apps).total).toBe(3);
  });

  it('excludes rejected and not_selected from active', () => {
    const apps = [
      makeApp({ status: 'applied' }),
      makeApp({ status: 'rejected' }),
      makeApp({ status: 'not_selected' }),
      makeApp({ status: 'interview' }),
    ];
    expect(computeKpi(apps).active).toBe(2);
  });

  it('counts interview status correctly', () => {
    const apps = [
      makeApp({ status: 'interview' }),
      makeApp({ status: 'interview' }),
      makeApp({ status: 'applied' }),
    ];
    expect(computeKpi(apps).interview).toBe(2);
  });

  it('counts offer status correctly', () => {
    const apps = [
      makeApp({ status: 'offer' }),
      makeApp({ status: 'applied' }),
    ];
    expect(computeKpi(apps).offers).toBe(1);
  });

  it('calculates response rate as percentage of active over total', () => {
    const apps = [
      makeApp({ status: 'applied' }),   // active
      makeApp({ status: 'rejected' }),  // not active
    ];
    expect(computeKpi(apps).responseRate).toBe(50);
  });

  it('returns 0 response rate when total is 0', () => {
    expect(computeKpi([]).responseRate).toBe(0);
  });
});

// ─── groupByWeek ──────────────────────────────────────────────────────────────

describe('groupByWeek', () => {
  it('returns empty array for empty apps', () => {
    expect(groupByWeek([], '30d')).toHaveLength(0);
  });

  it('returns buckets covering the selected range for 30d', () => {
    const app = makeApp({ appliedDate: TODAY_ISO });
    const buckets = groupByWeek([app], '30d');
    // 5 weeks covers 30 days
    expect(buckets.length).toBeGreaterThanOrEqual(4);
    expect(buckets.length).toBeLessThanOrEqual(6);
  });

  it('counts applications in the correct week bucket', () => {
    const app = makeApp({ appliedDate: TODAY_ISO });
    const buckets = groupByWeek([app], '30d');
    const total = buckets.reduce((s, b) => s + b.count, 0);
    expect(total).toBe(1);
  });

  it('fills in zero-count weeks so there are no gaps', () => {
    // One app this week, no apps in prior weeks
    const app = makeApp({ appliedDate: TODAY_ISO });
    const buckets = groupByWeek([app], '30d');
    const zeroBuckets = buckets.filter((b) => b.count === 0);
    expect(zeroBuckets.length).toBeGreaterThan(0);
  });

  it('for "all" range uses the earliest app date as the start', () => {
    const old = makeApp({ appliedDate: '2026-01-05' });
    const recent = makeApp({ appliedDate: TODAY_ISO });
    const buckets = groupByWeek([old, recent], 'all');
    // Should span from the Jan week to today — at least several weeks
    expect(buckets.length).toBeGreaterThan(10);
  });
});

// ─── countByField ─────────────────────────────────────────────────────────────

describe('countByField', () => {
  it('returns empty array for empty list', () => {
    expect(countByField([], 'status')).toHaveLength(0);
  });

  it('counts occurrences of each status value', () => {
    const apps = [
      makeApp({ status: 'applied' }),
      makeApp({ status: 'applied' }),
      makeApp({ status: 'interview' }),
    ];
    const result = countByField(apps, 'status');
    const applied = result.find((r) => r.label === 'applied');
    const interview = result.find((r) => r.label === 'interview');
    expect(applied?.count).toBe(2);
    expect(interview?.count).toBe(1);
  });

  it('sorts results descending by count', () => {
    const apps = [
      makeApp({ status: 'applied' }),
      makeApp({ status: 'interview' }),
      makeApp({ status: 'interview' }),
    ];
    const result = countByField(apps, 'status');
    expect(result[0].label).toBe('interview');
    expect(result[0].count).toBe(2);
  });

  it('buckets null/empty values as "Unknown"', () => {
    const apps = [
      makeApp({ source: null }),
      makeApp({ source: '' }),
    ];
    const result = countByField(apps, 'source');
    const unknown = result.find((r) => r.label === 'Unknown');
    expect(unknown?.count).toBe(2);
  });
});

// ─── countTopSkills ───────────────────────────────────────────────────────────

describe('countTopSkills', () => {
  it('returns empty array when no skills exist', () => {
    const apps = [makeApp({ skills: [] }), makeApp({ skills: null })];
    expect(countTopSkills(apps)).toHaveLength(0);
  });

  it('counts skills case-insensitively', () => {
    const apps = [
      makeApp({ skills: ['React'] }),
      makeApp({ skills: ['react'] }),
      makeApp({ skills: ['REACT'] }),
    ];
    const result = countTopSkills(apps);
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(3);
  });

  it('returns at most n skills', () => {
    const apps = [
      makeApp({ skills: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] }),
    ];
    expect(countTopSkills(apps, 5)).toHaveLength(5);
  });

  it('returns skills sorted by count descending', () => {
    const apps = [
      makeApp({ skills: ['TypeScript', 'React', 'TypeScript'] }),
    ];
    const result = countTopSkills(apps);
    expect(result[0].label.toLowerCase()).toBe('typescript');
    expect(result[0].count).toBe(2);
  });

  it('ignores empty/whitespace-only skill strings', () => {
    const apps = [makeApp({ skills: ['  ', '', 'React'] })];
    const result = countTopSkills(apps);
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('React');
  });
});

// ─── buildFunnel ──────────────────────────────────────────────────────────────

describe('buildFunnel', () => {
  it('returns four stages in pipeline order', () => {
    const result = buildFunnel([]);
    expect(result.map((r) => r.label)).toEqual([
      'Applied', 'Reviewing', 'Interview', 'Offer',
    ]);
  });

  it('each stage count is cumulative (includes stages beyond it)', () => {
    const apps = [
      makeApp({ status: 'applied' }),
      makeApp({ status: 'reviewing' }),
      makeApp({ status: 'interview' }),
      makeApp({ status: 'offer' }),
    ];
    const [applied, reviewing, interview, offer] = buildFunnel(apps);
    expect(applied.count).toBe(4);  // applied + reviewing + interview + offer
    expect(reviewing.count).toBe(3); // reviewing + interview + offer
    expect(interview.count).toBe(2); // interview + offer
    expect(offer.count).toBe(1);     // offer only
  });

  it('excludes rejected and not_selected from the funnel', () => {
    const apps = [
      makeApp({ status: 'rejected' }),
      makeApp({ status: 'not_selected' }),
      makeApp({ status: 'applied' }),
    ];
    const [applied] = buildFunnel(apps);
    expect(applied.count).toBe(1);
  });

  it('returns all zeros when list is empty', () => {
    buildFunnel([]).forEach((stage) => expect(stage.count).toBe(0));
  });
});
