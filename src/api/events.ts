import { api } from './client';
import type { ApplicationEvent, EventType, ApplicationStatus } from '@/types';

export interface CreateEventBody {
  name: string;
  eventType: EventType;
  date: string;
  notes?: string;
  previousStatus?: ApplicationStatus;
  newStatus?: ApplicationStatus;
}

export const eventsApi = {
  list: (appId: string) =>
    api
      .get<ApplicationEvent[]>(`/applications/${appId}/events`)
      .then((r) => r.data),

  create: (appId: string, body: CreateEventBody) =>
    api
      .post<ApplicationEvent>(`/applications/${appId}/events`, body)
      .then((r) => r.data),

  update: (appId: string, id: string, body: Partial<CreateEventBody>) =>
    api
      .patch<ApplicationEvent>(`/applications/${appId}/events/${id}`, body)
      .then((r) => r.data),

  remove: (appId: string, id: string) =>
    api.delete(`/applications/${appId}/events/${id}`).then((r) => r.data),
};
