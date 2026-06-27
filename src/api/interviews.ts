import { api } from './client';
import type { Interview, InterviewStatus, InterviewLocation } from '@/types';

export interface CreateInterviewBody {
  title: string;
  scheduledAt?: string;
  status?: InterviewStatus;
  location?: InterviewLocation;
  callUrl?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  notes?: string;
}

export interface UpdateInterviewBody {
  title?: string;
  status?: InterviewStatus;
  scheduledAt?: string | null;
  location?: InterviewLocation | null;
  callUrl?: string | null;
  interviewerName?: string | null;
  interviewerEmail?: string | null;
  notes?: string | null;
  questionsAsked?: string | null;
  codeChallenge?: string | null;
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

  update: (appId: string, id: string, body: UpdateInterviewBody) =>
    api
      .patch<Interview>(`/applications/${appId}/interviews/${id}`, body)
      .then((r) => r.data),

  remove: (appId: string, id: string) =>
    api.delete(`/applications/${appId}/interviews/${id}`).then((r) => r.data),
};
