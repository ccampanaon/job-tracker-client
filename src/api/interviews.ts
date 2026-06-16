import { api } from './client';
import type { Interview, InterviewStatus } from '@/types';

export interface CreateInterviewBody {
  title: string;
  scheduledAt?: string;
  status?: InterviewStatus;
  notes?: string;
}

export const interviewsApi = {
  list: (appId: string) =>
    api
      .get<Interview[]>(`/applications/${appId}/interviews`)
      .then((r) => r.data),

  create: (appId: string, body: CreateInterviewBody) =>
    api
      .post<Interview>(`/applications/${appId}/interviews`, body)
      .then((r) => r.data),

  update: (
    appId: string,
    id: string,
    body: Partial<CreateInterviewBody>,
  ) =>
    api
      .patch<Interview>(`/applications/${appId}/interviews/${id}`, body)
      .then((r) => r.data),

  remove: (appId: string, id: string) =>
    api.delete(`/applications/${appId}/interviews/${id}`).then((r) => r.data),
};
