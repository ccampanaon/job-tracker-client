export const STATUS_COLORS: Record<string, string> = {
  applied:      '#6366f1',
  reviewing:    '#f59e0b',
  interview:    '#3b82f6',
  offer:        '#22c55e',
  rejected:     '#ef4444',
  not_selected: '#8b5cf6',
  Unknown:      '#b6b9c5',
};

export const LOCATION_COLORS: Record<string, string> = {
  Remote:  '#6366f1',
  Onsite:  '#f97316',
  Hybrid:  '#22c55e',
  Unknown: '#b6b9c5',
};

export const JOB_TYPE_COLORS: Record<string, string> = {
  'Full-time':  '#6366f1',
  'Part-time':  '#22c55e',
  'Contract':   '#f97316',
  'Freelance':  '#ec4899',
  'Internship': '#14b8a6',
  Unknown:      '#b6b9c5',
};

export const CHART_PALETTE = [
  '#6366f1',
  '#22c55e',
  '#f97316',
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
  '#8b5cf6',
];

export function paletteColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}
