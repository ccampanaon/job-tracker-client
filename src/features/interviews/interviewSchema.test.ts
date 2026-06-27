import { describe, it, expect } from 'vitest';
import { createInterviewSchema, editInterviewSchema } from './interviewSchema';
import { INTERVIEW_LOCATIONS, INTERVIEW_STATUSES } from '@/types';

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

// ── createInterviewSchema ────────────────────────────────────────────────────

describe('createInterviewSchema', () => {
  const base = { title: 'Technical round' };

  describe('title field', () => {
    it('passes with just a title', () => {
      expect(createInterviewSchema.safeParse(base).success).toBe(true);
    });

    it('fails when title is empty', () => {
      const result = createInterviewSchema.safeParse({ ...base, title: '' });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.flatten().fieldErrors.title).toBeDefined();
    });

    it('fails when title is missing', () => {
      expect(createInterviewSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('scheduledAt — future date only', () => {
    it('passes when scheduledAt is omitted', () => {
      expect(createInterviewSchema.safeParse(base).success).toBe(true);
    });

    it('passes when scheduledAt is empty string', () => {
      expect(createInterviewSchema.safeParse({ ...base, scheduledAt: '' }).success).toBe(true);
    });

    it('passes when scheduledAt is a future date', () => {
      expect(
        createInterviewSchema.safeParse({ ...base, scheduledAt: tomorrow() }).success,
      ).toBe(true);
    });

    it('fails when scheduledAt is a past date', () => {
      const result = createInterviewSchema.safeParse({ ...base, scheduledAt: yesterday() });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.flatten().fieldErrors.scheduledAt).toBeDefined();
    });
  });

  describe('location field', () => {
    it.each(INTERVIEW_LOCATIONS.filter((l) => l !== 'video_call'))(
      'accepts valid location "%s"',
      (loc) => {
        expect(
          createInterviewSchema.safeParse({ ...base, location: loc }).success,
        ).toBe(true);
      },
    );

    it('accepts video_call when callUrl is provided', () => {
      expect(
        createInterviewSchema.safeParse({
          ...base,
          location: 'video_call',
          callUrl: 'https://meet.google.com/abc',
        }).success,
      ).toBe(true);
    });

    it('rejects an unknown location', () => {
      expect(
        createInterviewSchema.safeParse({ ...base, location: 'carrier_pigeon' }).success,
      ).toBe(false);
    });

    it('passes when location is omitted', () => {
      expect(createInterviewSchema.safeParse(base).success).toBe(true);
    });
  });

  describe('callUrl — required for video_call', () => {
    it('fails when location is video_call and callUrl is missing', () => {
      const result = createInterviewSchema.safeParse({
        ...base,
        location: 'video_call',
      });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.flatten().fieldErrors.callUrl).toBeDefined();
    });

    it('fails when location is video_call and callUrl is empty', () => {
      const result = createInterviewSchema.safeParse({
        ...base,
        location: 'video_call',
        callUrl: '  ',
      });
      expect(result.success).toBe(false);
    });

    it('passes when location is video_call and callUrl is provided', () => {
      expect(
        createInterviewSchema.safeParse({
          ...base,
          location: 'video_call',
          callUrl: 'https://meet.google.com/abc',
        }).success,
      ).toBe(true);
    });

    it('does not require callUrl when location is phone', () => {
      expect(
        createInterviewSchema.safeParse({ ...base, location: 'phone' }).success,
      ).toBe(true);
    });

    it('does not require callUrl when location is in_person', () => {
      expect(
        createInterviewSchema.safeParse({ ...base, location: 'in_person' }).success,
      ).toBe(true);
    });
  });

  describe('interviewerEmail', () => {
    it('passes when interviewerEmail is omitted', () => {
      expect(createInterviewSchema.safeParse(base).success).toBe(true);
    });

    it('passes when interviewerEmail is an empty string', () => {
      expect(
        createInterviewSchema.safeParse({ ...base, interviewerEmail: '' }).success,
      ).toBe(true);
    });

    it('passes with a valid email', () => {
      expect(
        createInterviewSchema.safeParse({ ...base, interviewerEmail: 'jane@co.com' }).success,
      ).toBe(true);
    });

    it('fails with an invalid email', () => {
      const result = createInterviewSchema.safeParse({ ...base, interviewerEmail: 'not-an-email' });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.flatten().fieldErrors.interviewerEmail).toBeDefined();
    });
  });

  describe('optional fields', () => {
    it('passes with all optional fields provided', () => {
      expect(
        createInterviewSchema.safeParse({
          ...base,
          scheduledAt: tomorrow(),
          location: 'phone',
          interviewerName: 'Jane',
          interviewerEmail: 'jane@co.com',
          notes: 'First round',
        }).success,
      ).toBe(true);
    });
  });
});

// ── editInterviewSchema ──────────────────────────────────────────────────────

describe('editInterviewSchema', () => {
  const base = { title: 'Technical round', status: 'scheduled' };

  describe('required fields', () => {
    it('passes with title and status', () => {
      expect(editInterviewSchema.safeParse(base).success).toBe(true);
    });

    it('fails when title is empty', () => {
      const result = editInterviewSchema.safeParse({ ...base, title: '' });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.flatten().fieldErrors.title).toBeDefined();
    });

    it('fails when status is missing', () => {
      const { status: _s, ...rest } = base;
      expect(editInterviewSchema.safeParse(rest).success).toBe(false);
    });

    it('fails with an unknown status', () => {
      expect(editInterviewSchema.safeParse({ ...base, status: 'limbo' }).success).toBe(false);
    });
  });

  describe('status enum', () => {
    it.each(INTERVIEW_STATUSES)('accepts valid status "%s"', (status) => {
      expect(editInterviewSchema.safeParse({ ...base, status }).success).toBe(true);
    });
  });

  describe('scheduledAt — no future restriction', () => {
    it('passes with a past scheduledAt', () => {
      expect(
        editInterviewSchema.safeParse({ ...base, scheduledAt: yesterday() }).success,
      ).toBe(true);
    });

    it('passes with a future scheduledAt', () => {
      expect(
        editInterviewSchema.safeParse({ ...base, scheduledAt: tomorrow() }).success,
      ).toBe(true);
    });

    it('passes when scheduledAt is omitted', () => {
      expect(editInterviewSchema.safeParse(base).success).toBe(true);
    });
  });

  describe('callUrl — required for video_call', () => {
    it('fails when location is video_call and callUrl is missing', () => {
      const result = editInterviewSchema.safeParse({ ...base, location: 'video_call' });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.flatten().fieldErrors.callUrl).toBeDefined();
    });

    it('passes when location is video_call and callUrl is provided', () => {
      expect(
        editInterviewSchema.safeParse({
          ...base,
          location: 'video_call',
          callUrl: 'https://zoom.us/j/123',
        }).success,
      ).toBe(true);
    });
  });

  describe('post-interview fields', () => {
    it('passes when questionsAsked and codeChallenge are omitted', () => {
      expect(editInterviewSchema.safeParse(base).success).toBe(true);
    });

    it('passes with questionsAsked provided', () => {
      const result = editInterviewSchema.safeParse({
        ...base,
        questionsAsked: 'Tell me about yourself',
      });
      expect(result.success).toBe(true);
      if (result.success)
        expect(result.data.questionsAsked).toBe('Tell me about yourself');
    });

    it('passes with codeChallenge provided', () => {
      const result = editInterviewSchema.safeParse({
        ...base,
        codeChallenge: 'LeetCode medium array problem',
      });
      expect(result.success).toBe(true);
      if (result.success)
        expect(result.data.codeChallenge).toBe('LeetCode medium array problem');
    });
  });
});
