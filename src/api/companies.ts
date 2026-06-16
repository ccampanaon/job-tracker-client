import { api } from './client';
import type { Company } from '@/types';

export interface CompanyBody {
  name: string;
  website?: string;
  industry?: string;
  notes?: string;
}

export const companiesApi = {
  list: (search?: string) =>
    api
      .get<Company[]>('/companies', { params: search ? { search } : {} })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<Company>(`/companies/${id}`).then((r) => r.data),

  create: (body: CompanyBody) =>
    api.post<Company>('/companies', body).then((r) => r.data),

  update: (id: string, body: Partial<CompanyBody>) =>
    api.patch<Company>(`/companies/${id}`, body).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/companies/${id}`).then((r) => r.data),
};
