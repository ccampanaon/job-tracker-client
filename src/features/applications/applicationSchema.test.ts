import { describe, it, expect } from 'vitest';
import { applicationSchema } from './applicationSchema';

describe('applicationSchema', () => {
  const base = { jobTitle: 'Engineer', companyId: 'uuid-123' };

  describe('required fields', () => {
    it('fails when jobTitle is empty', () => {
      const result = applicationSchema.safeParse({ ...base, jobTitle: '' });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.flatten().fieldErrors.jobTitle).toBeDefined();
    });

    it('fails when companyId is empty', () => {
      const result = applicationSchema.safeParse({ ...base, companyId: '' });
      expect(result.success).toBe(false);
    });

    it('passes with only required fields', () => {
      expect(applicationSchema.safeParse(base).success).toBe(true);
    });
  });

  describe('jobUrl preprocessing', () => {
    it('auto-prepends https:// when protocol is missing', () => {
      const result = applicationSchema.safeParse({ ...base, jobUrl: 'www.example.com' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.jobUrl).toBe('https://www.example.com');
    });

    it('leaves https:// URLs unchanged', () => {
      const result = applicationSchema.safeParse({ ...base, jobUrl: 'https://example.com/job/1' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.jobUrl).toBe('https://example.com/job/1');
    });

    it('converts empty string to undefined', () => {
      const result = applicationSchema.safeParse({ ...base, jobUrl: '' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.jobUrl).toBeUndefined();
    });

    it('rejects a string that is not a valid URL even after prefixing', () => {
      const result = applicationSchema.safeParse({ ...base, jobUrl: 'not a url!!' });
      expect(result.success).toBe(false);
    });
  });

  describe('salary preprocessing', () => {
    it('coerces numeric string to number', () => {
      const result = applicationSchema.safeParse({ ...base, salaryMin: '80000' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.salaryMin).toBe(80000);
    });

    it('converts empty string to undefined', () => {
      const result = applicationSchema.safeParse({ ...base, salaryMin: '' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.salaryMin).toBeUndefined();
    });

    it('rejects negative salary', () => {
      const result = applicationSchema.safeParse({ ...base, salaryMin: -1 });
      expect(result.success).toBe(false);
    });
  });

  describe('enum fields', () => {
    it('accepts valid jobType', () => {
      const result = applicationSchema.safeParse({ ...base, jobType: 'Full-time' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid jobType', () => {
      const result = applicationSchema.safeParse({ ...base, jobType: 'unknown' });
      expect(result.success).toBe(false);
    });

    it('accepts valid location', () => {
      const result = applicationSchema.safeParse({ ...base, location: 'Remote' });
      expect(result.success).toBe(true);
    });

    it('accepts valid salaryType', () => {
      const result = applicationSchema.safeParse({ ...base, salaryType: 'Yearly' });
      expect(result.success).toBe(true);
    });
  });
});
