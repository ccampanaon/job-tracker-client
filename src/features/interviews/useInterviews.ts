import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  interviewsApi,
  type CreateInterviewBody,
} from '@/api/interviews';
import { qk } from '@/lib/queryClient';

export function useInterviews(appId: string) {
  return useQuery({
    queryKey: qk.interviews(appId),
    queryFn: () => interviewsApi.list(appId),
    enabled: !!appId,
  });
}

export function useCreateInterview(appId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInterviewBody) =>
      interviewsApi.create(appId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.interviews(appId) });
      // A failed round can flip the application to rejected on the server.
      qc.invalidateQueries({ queryKey: qk.application(appId) });
      qc.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}
