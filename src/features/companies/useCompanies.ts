import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi, type CompanyBody } from '@/api/companies';
import { qk } from '@/lib/queryClient';

export function useCompanies(search?: string) {
  return useQuery({
    queryKey: qk.companies(search),
    queryFn: () => companiesApi.list(search),
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CompanyBody) => companiesApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.companies() }),
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CompanyBody> }) =>
      companiesApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.companies() }),
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companiesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.companies() }),
  });
}

// Returns a Map<companyId, companyName> built from the cached companies list.
// React Query deduplicates the underlying request across callers.
export function useCompanyMap() {
  const { data } = useCompanies();
  return useMemo(() => {
    const map = new Map<string, string>();
    data?.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [data]);
}
