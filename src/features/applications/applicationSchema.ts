import { z } from 'zod';

export const ROLE_VALUES = ['Full Stack', 'Front End', 'Back End'] as const;

export const JOB_TYPE_VALUES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'] as const;
export const LOCATION_TYPE_VALUES = ['Remote', 'Onsite', 'Hybrid'] as const;
export const SALARY_TYPE_VALUES = ['Hourly', 'Yearly'] as const;
export const SOURCE_VALUES = [
  'linkedin',
  'handshake',
  'dynamitejobs',
  'glassdoor',
  'recruiter',
  'indeed',
  'ziprecruiter',
  'monster',
  'dice',
] as const;
export const SOURCE_LABEL: Record<typeof SOURCE_VALUES[number], string> = {
  linkedin: 'LinkedIn',
  handshake: 'Handshake',
  dynamitejobs: 'Dynamite Jobs',
  glassdoor: 'Glassdoor',
  recruiter: 'Recruiter',
  indeed: 'Indeed',
  ziprecruiter: 'Zip Recruiter',
  monster: 'Monster',
  dice: 'Dice',
};

export const applicationSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  companyId: z.string().min(1, 'Company is required'),
  location: z.enum(LOCATION_TYPE_VALUES).optional(),
  role: z.enum(ROLE_VALUES).optional(),
  source: z.enum(SOURCE_VALUES).optional(),
  recruiterName: z.string().optional(),
  recruiterEmail: z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.string().email('Enter a valid email').optional(),
  ),
  recruiterPhone: z.string().optional(),
  jobDescription: z.string().optional(),
  jobType: z.enum(JOB_TYPE_VALUES).optional(),
  salaryType: z.enum(SALARY_TYPE_VALUES).optional(),
  salaryMin: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().int().min(0, 'Must be ≥ 0').optional(),
  ),
  salaryMax: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().int().min(0, 'Must be ≥ 0').optional(),
  ),
  jobUrl: z.preprocess(
    (val) => {
      if (!val || val === '') return undefined;
      const s = String(val).trim();
      return /^https?:\/\//i.test(s) ? s : `https://${s}`;
    },
    z.string().url('Enter a valid URL').optional(),
  ),
  skills: z.array(z.string()).optional(),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
