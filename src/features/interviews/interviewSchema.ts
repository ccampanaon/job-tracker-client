import { z } from 'zod';
import { INTERVIEW_LOCATIONS, INTERVIEW_STATUSES } from '@/types';

const today = () => new Date().toISOString().slice(0, 10);

const baseFields = {
  title: z.string().min(1, 'Title is required'),
  location: z.enum(INTERVIEW_LOCATIONS as [string, ...string[]]).optional(),
  callUrl: z.string().optional(),
  interviewerName: z.string().optional(),
  interviewerEmail: z
    .string()
    .email('Invalid email')
    .optional()
    .or(z.literal('')),
  notes: z.string().optional(),
};

export const createInterviewSchema = z
  .object({
    ...baseFields,
    scheduledAt: z
      .string()
      .optional()
      .refine(
        (val) => !val || val >= today(),
        'Interview date must be today or in the future',
      ),
  })
  .superRefine((data, ctx) => {
    if (data.location === 'video_call' && !data.callUrl?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Call URL is required for video call interviews',
        path: ['callUrl'],
      });
    }
  });

export type CreateInterviewFormValues = z.infer<typeof createInterviewSchema>;

export const editInterviewSchema = z
  .object({
    ...baseFields,
    scheduledAt: z.string().optional(),
    status: z.enum(INTERVIEW_STATUSES as [string, ...string[]]),
    questionsAsked: z.string().optional(),
    codeChallenge: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.location === 'video_call' && !data.callUrl?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Call URL is required for video call interviews',
        path: ['callUrl'],
      });
    }
  });

export type EditInterviewFormValues = z.infer<typeof editInterviewSchema>;
