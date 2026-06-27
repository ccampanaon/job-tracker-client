import { z } from 'zod';
import { EVENT_TYPES, type EventType } from '@/types';

export const EVENT_TYPE_VALUES = EVENT_TYPES as [EventType, ...EventType[]];

export const eventSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  eventType: z.enum(EVENT_TYPE_VALUES, { required_error: 'Event type is required' }),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;
