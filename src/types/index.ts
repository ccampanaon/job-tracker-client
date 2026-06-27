// Mirrors the NestJS backend entities. Keep in sync with the API.

export type ApplicationStatus =
  | 'applied'
  | 'reviewing'
  | 'interview'
  | 'offer'
  | 'rejected';

export type RoleType = 'Full Stack' | 'Front End' | 'Back End';

export type JobType =
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Freelance'
  | 'Internship';

export const JOB_TYPES: JobType[] = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship',
];

export const JOB_TYPE_LABEL: Record<JobType, string> = {
  'Full-time': 'Full-time',
  'Part-time': 'Part-time',
  'Contract': 'Contract',
  'Freelance': 'Freelance',
  'Internship': 'Internship',
};

export type SalaryType = 'Hourly' | 'Yearly';

export const SALARY_TYPES: SalaryType[] = ['Hourly', 'Yearly'];

export const SALARY_TYPE_LABEL: Record<SalaryType, string> = {
  Hourly: 'Hourly',
  Yearly: 'Yearly',
};

export type LocationType = 'Remote' | 'Onsite' | 'Hybrid';

export const LOCATION_TYPES: LocationType[] = ['Remote', 'Onsite', 'Hybrid'];

export const LOCATION_TYPE_LABEL: Record<LocationType, string> = {
  Remote: 'Remote',
  Onsite: 'Onsite',
  Hybrid: 'Hybrid',
};

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'applied',
  'reviewing',
  'interview',
  'offer',
  'rejected',
];

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  reviewing: 'Reviewing',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
};

export type InterviewStatus =
  | 'scheduled'
  | 'completed'
  | 'passed'
  | 'failed'
  | 'cancelled';

export const INTERVIEW_STATUSES: InterviewStatus[] = [
  'scheduled', 'completed', 'passed', 'failed', 'cancelled',
];

export const INTERVIEW_STATUS_LABEL: Record<InterviewStatus, string> = {
  scheduled: 'Pending',
  completed: 'Done',
  passed:    'Passed',
  failed:    'Failed',
  cancelled: 'Cancelled',
};

export type InterviewLocation = 'phone' | 'video_call' | 'in_person';

export const INTERVIEW_LOCATIONS: InterviewLocation[] = ['phone', 'video_call', 'in_person'];

export const INTERVIEW_LOCATION_LABEL: Record<InterviewLocation, string> = {
  phone:      'Phone',
  video_call: 'Video call',
  in_person:  'In person',
};

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  website?: string | null;
  industry?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  roundNumber: number;
  title: string;
  status: InterviewStatus;
  scheduledAt: string | null;
  location?: InterviewLocation | null;
  callUrl?: string | null;
  interviewerName?: string | null;
  interviewerEmail?: string | null;
  notes?: string | null;
  questionsAsked?: string | null;
  codeChallenge?: string | null;
}

export interface Application {
  id: string;
  companyId: string;
  company?: Company;
  jobTitle: string;
  status: ApplicationStatus;
  location?: LocationType | null;
  jobType?: JobType | null;
  jobDescription?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryType?: SalaryType | null;
  jobUrl?: string | null;
  role?: RoleType | null;
  source?: string | null;
  recruiterName?: string | null;
  recruiterEmail?: string | null;
  recruiterPhone?: string | null;
  skills?: string[] | null;
  appliedDate: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

// Keyset pagination envelope returned by the applications list endpoint.
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type EventType =
  | 'email'
  | 'call'
  | 'interview_invite'
  | 'offer'
  | 'rejection'
  | 'note'
  | 'status_change'
  | 'other';

// status_change is system-generated — excluded from the user-facing form dropdown
export const EVENT_TYPES: EventType[] = [
  'email', 'call', 'interview_invite', 'offer', 'rejection', 'note', 'other',
];

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  email: 'Email',
  call: 'Call',
  interview_invite: 'Interview invite',
  offer: 'Offer',
  rejection: 'Rejection',
  note: 'Note',
  status_change: 'Status change',
  other: 'Other',
};

export interface ApplicationEvent {
  id: string;
  applicationId: string;
  name: string;
  eventType: EventType;
  date: string;
  notes?: string | null;
  previousStatus?: ApplicationStatus | null;
  newStatus?: ApplicationStatus | null;
  createdAt: string;
}
