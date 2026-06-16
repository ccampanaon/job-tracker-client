import { describe, it, expect } from 'vitest';
import { formatDate, formatSalary } from './format';

describe('formatDate', () => {
  it('returns — for null', () => {
    expect(formatDate(null)).toBe('—');
  });

  it('displays the exact calendar date regardless of local timezone', () => {
    // "2026-06-16" must render as Jun 16, not Jun 15 in any UTC-behind timezone
    const result = formatDate('2026-06-16', { month: 'short', day: 'numeric', year: 'numeric' });
    expect(result).toContain('Jun');
    expect(result).toContain('16');
    expect(result).toContain('2026');
  });

  it('does not shift to the previous day', () => {
    const result = formatDate('2026-01-01', { month: 'short', day: 'numeric', year: 'numeric' });
    expect(result).toContain('1');
    expect(result).toContain('2026');
    expect(result).not.toContain('Dec'); // would appear if shifted back to Dec 31
  });
});

describe('formatSalary', () => {
  it('returns null when both min and max are missing', () => {
    expect(formatSalary()).toBeNull();
    expect(formatSalary(null, null)).toBeNull();
    expect(formatSalary(undefined, undefined)).toBeNull();
  });

  it('formats a range in thousands', () => {
    expect(formatSalary(140000, 180000)).toBe('$140k – $180k');
  });

  it('formats a single min value', () => {
    expect(formatSalary(80000, null)).toBe('$80k');
  });

  it('formats a single max value', () => {
    expect(formatSalary(null, 80000)).toBe('$80k');
  });

  it('formats values below 1000 without k suffix', () => {
    expect(formatSalary(500, null)).toBe('$500');
  });

  it('appends salary type when provided', () => {
    expect(formatSalary(140000, 180000, 'Yearly')).toBe('$140k – $180k / Yearly');
  });

  it('appends salary type for single value', () => {
    expect(formatSalary(50, null, 'Hourly')).toBe('$50 / Hourly');
  });

  it('ignores null salary type', () => {
    expect(formatSalary(140000, 180000, null)).toBe('$140k – $180k');
  });
});
