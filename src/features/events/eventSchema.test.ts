import { describe, it, expect } from 'vitest';
import { eventSchema } from './eventSchema';
import { EVENT_TYPES } from '@/types';

describe('eventSchema', () => {
  const base = { name: 'HR email', eventType: 'email', date: '2026-06-20' };

  describe('required fields', () => {
    it('passes with all required fields', () => {
      expect(eventSchema.safeParse(base).success).toBe(true);
    });

    it('fails when name is empty', () => {
      const result = eventSchema.safeParse({ ...base, name: '' });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.flatten().fieldErrors.name).toBeDefined();
    });

    it('fails when eventType is missing', () => {
      const { eventType: _et, ...rest } = base;
      expect(eventSchema.safeParse(rest).success).toBe(false);
    });

    it('fails when date is empty', () => {
      const result = eventSchema.safeParse({ ...base, date: '' });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.flatten().fieldErrors.date).toBeDefined();
    });
  });

  describe('notes field', () => {
    it('passes when notes is omitted', () => {
      expect(eventSchema.safeParse(base).success).toBe(true);
    });

    it('passes with notes provided', () => {
      const result = eventSchema.safeParse({ ...base, notes: 'Some extra detail' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.notes).toBe('Some extra detail');
    });
  });

  describe('eventType enum', () => {
    it.each(EVENT_TYPES)('accepts valid event type "%s"', (type) => {
      const result = eventSchema.safeParse({ ...base, eventType: type });
      expect(result.success).toBe(true);
    });

    it('rejects an unknown event type', () => {
      const result = eventSchema.safeParse({ ...base, eventType: 'unknown_type' });
      expect(result.success).toBe(false);
    });

    it('status_change is not in EVENT_TYPES (user-selectable list)', () => {
      expect(EVENT_TYPES).not.toContain('status_change');
    });

    it('rejects status_change as a manually submitted event type', () => {
      const result = eventSchema.safeParse({ ...base, eventType: 'status_change' });
      expect(result.success).toBe(false);
    });
  });
});
