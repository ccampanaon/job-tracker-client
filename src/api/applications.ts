import { api } from './client';
import type { Application, ApplicationStatus, JobType, LocationType, SalaryType, Page } from '@/types';

const FETCH_ALL_CAP = 500;

export interface ListParams {
  status?: ApplicationStatus;
  search?: string;
  cursor?: string | null;
  limit?: number;
}

export interface CreateApplicationBody {
  companyId: string;
  jobTitle: string;
  jobUrl?: string;
  location?: LocationType;
  jobDescription?: string;
  jobType?: JobType;
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: SalaryType;
  role?: string;
  source?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  skills?: string[];
  status?: ApplicationStatus;
  appliedDate?: string;
}

export type UpdateApplicationBody = Partial<CreateApplicationBody>;

export const applicationsApi = {
  list: (params: ListParams = {}) =>
    api
      .get<Page<Application>>('/applications', { params })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<Application>(`/applications/${id}`).then((r) => r.data),

  create: (body: CreateApplicationBody) =>
    api.post<Application>('/applications', body).then((r) => r.data),

  update: (id: string, body: UpdateApplicationBody) =>
    api.patch<Application>(`/applications/${id}`, body).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/applications/${id}`).then((r) => r.data),
};

export async function fetchAllApplications(): Promise<Application[]> {
  const all: Application[] = [];
  let cursor: string | null = null;

  do {
    const page = await applicationsApi.list({ limit: 100, cursor });
    all.push(...page.items);
    cursor = page.nextCursor;
    if (all.length >= FETCH_ALL_CAP) break;
  } while (cursor);

  return all;
}
