import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  INTERVIEW_LOCATIONS,
  INTERVIEW_LOCATION_LABEL,
  INTERVIEW_STATUSES,
  INTERVIEW_STATUS_LABEL,
  type Interview,
  type InterviewLocation,
  type InterviewStatus,
} from '@/types';
import {
  useCreateInterview,
  useUpdateInterview,
  useDeleteInterview,
} from '@/features/interviews/useInterviews';
import {
  createInterviewSchema,
  editInterviewSchema,
  type CreateInterviewFormValues,
  type EditInterviewFormValues,
} from '@/features/interviews/interviewSchema';

const today = () => new Date().toISOString().slice(0, 10);

export function InterviewFormDialog({
  appId,
  interview,
  onClose,
}: {
  appId: string;
  interview?: Interview;
  onClose: () => void;
}) {
  const isEdit = !!interview;

  const create = useCreateInterview(appId);
  const update = useUpdateInterview(appId);
  const remove = useDeleteInterview(appId);

  // ── Create form ──────────────────────────────────────────────────────────
  const createForm = useForm<CreateInterviewFormValues>({
    resolver: zodResolver(createInterviewSchema),
    defaultValues: { title: '', scheduledAt: '', notes: '' },
  });

  // ── Edit form ─────────────────────────────────────────────────────────────
  const editForm = useForm<EditInterviewFormValues>({
    resolver: zodResolver(editInterviewSchema),
    defaultValues: interview
      ? {
          title: interview.title,
          status: interview.status,
          scheduledAt: interview.scheduledAt ?? '',
          location: (interview.location ?? undefined) as InterviewLocation | undefined,
          callUrl: interview.callUrl ?? '',
          interviewerName: interview.interviewerName ?? '',
          interviewerEmail: interview.interviewerEmail ?? '',
          notes: interview.notes ?? '',
          questionsAsked: interview.questionsAsked ?? '',
          codeChallenge: interview.codeChallenge ?? '',
        }
      : undefined,
  });

  const watchedLocation = isEdit
    ? editForm.watch('location')
    : createForm.watch('location');

  const handleDelete = () => {
    if (!interview) return;
    if (!confirm('Delete this interview round?')) return;
    remove.mutate(interview.id, { onSuccess: onClose });
  };

  const onSubmitCreate: SubmitHandler<CreateInterviewFormValues> = (values) => {
    create.mutate(
      {
        title: values.title,
        status: 'scheduled',
        scheduledAt: values.scheduledAt || undefined,
        location: values.location as InterviewLocation | undefined,
        callUrl: values.callUrl || undefined,
        interviewerName: values.interviewerName || undefined,
        interviewerEmail: values.interviewerEmail || undefined,
        notes: values.notes || undefined,
      },
      { onSuccess: onClose },
    );
  };

  const onSubmitEdit: SubmitHandler<EditInterviewFormValues> = (values) => {
    if (!interview) return;
    update.mutate(
      {
        id: interview.id,
        body: {
          title: values.title,
          status: values.status as InterviewStatus,
          scheduledAt: values.scheduledAt || null,
          location: (values.location as InterviewLocation | undefined) ?? null,
          callUrl: values.callUrl || null,
          interviewerName: values.interviewerName || null,
          interviewerEmail: values.interviewerEmail || null,
          notes: values.notes || null,
          questionsAsked: values.questionsAsked || null,
          codeChallenge: values.codeChallenge || null,
        },
      },
      { onSuccess: onClose },
    );
  };

  const isPending = create.isPending || update.isPending;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/30 p-4"
      onClick={onClose}
    >
      <div
        className="card flex max-h-[90vh] w-full max-w-lg flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-paper-edge px-6 py-4">
          <h2 className="font-display text-lg font-semibold">
            {isEdit ? 'Edit interview round' : 'Add interview round'}
          </h2>
        </div>

        {/* Form */}
        {isEdit ? (
          <form
            onSubmit={editForm.handleSubmit(onSubmitEdit)}
            className="overflow-y-auto px-6 py-5"
          >
            <EditFields
              form={editForm}
              watchedLocation={watchedLocation}
            />
            <Footer
              isEdit
              isPending={isPending}
              isDeleting={remove.isPending}
              onDelete={handleDelete}
              onClose={onClose}
            />
          </form>
        ) : (
          <form
            onSubmit={createForm.handleSubmit(onSubmitCreate)}
            className="overflow-y-auto px-6 py-5"
          >
            <CreateFields
              form={createForm}
              watchedLocation={watchedLocation}
            />
            <Footer
              isEdit={false}
              isPending={isPending}
              isDeleting={false}
              onDelete={handleDelete}
              onClose={onClose}
            />
          </form>
        )}
      </div>
    </div>
  );
}

// ── Shared field sub-components ───────────────────────────────────────────

function CreateFields({
  form,
  watchedLocation,
}: {
  form: ReturnType<typeof useForm<CreateInterviewFormValues>>;
  watchedLocation: string | undefined;
}) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <SharedPreInterviewFields
        register={register as ReturnType<typeof useForm>['register']}
        errors={errors}
        watchedLocation={watchedLocation}
        scheduledAtMin={today()}
      />
    </div>
  );
}

function EditFields({
  form,
  watchedLocation,
}: {
  form: ReturnType<typeof useForm<EditInterviewFormValues>>;
  watchedLocation: string | undefined;
}) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <SharedPreInterviewFields
        register={register as ReturnType<typeof useForm>['register']}
        errors={errors}
        watchedLocation={watchedLocation}
        scheduledAtMin={undefined}
      />

      {/* Status */}
      <div>
        <label className="label">Status</label>
        <select className="field" {...register('status')}>
          {INTERVIEW_STATUSES.map((s) => (
            <option key={s} value={s}>
              {INTERVIEW_STATUS_LABEL[s as InterviewStatus]}
            </option>
          ))}
        </select>
        {errors.status && (
          <p className="mt-1 text-xs text-stage-rejected">{errors.status.message}</p>
        )}
      </div>

      {/* Questions asked */}
      <div>
        <label className="label">Questions asked</label>
        <textarea
          rows={3}
          className="field resize-none"
          placeholder="List the questions you were asked…"
          {...register('questionsAsked')}
        />
      </div>

      {/* Code challenge */}
      <div>
        <label className="label">Code challenge / technical test</label>
        <textarea
          rows={3}
          className="field resize-none"
          placeholder="Describe any coding exercise or take-home test…"
          {...register('codeChallenge')}
        />
      </div>
    </div>
  );
}

function SharedPreInterviewFields({
  register,
  errors,
  watchedLocation,
  scheduledAtMin,
}: {
  register: ReturnType<typeof useForm>['register'];
  errors: Record<string, { message?: string } | undefined>;
  watchedLocation: string | undefined;
  scheduledAtMin: string | undefined;
}) {
  return (
    <>
      {/* Title */}
      <div>
        <label className="label">Title</label>
        <input
          className="field"
          placeholder="e.g. Technical round, HR screen"
          {...register('title')}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-stage-rejected">{errors.title.message}</p>
        )}
      </div>

      {/* Interview date */}
      <div>
        <label className="label">Interview date</label>
        <input
          type="date"
          className="field"
          min={scheduledAtMin}
          {...register('scheduledAt')}
        />
        {errors.scheduledAt && (
          <p className="mt-1 text-xs text-stage-rejected">{errors.scheduledAt.message}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="label">Location</label>
        <select className="field" {...register('location')}>
          <option value="">Select…</option>
          {INTERVIEW_LOCATIONS.map((l) => (
            <option key={l} value={l}>
              {INTERVIEW_LOCATION_LABEL[l as InterviewLocation]}
            </option>
          ))}
        </select>
      </div>

      {/* Call URL — only for video call */}
      {watchedLocation === 'video_call' && (
        <div>
          <label className="label">Call URL</label>
          <input
            type="url"
            className="field"
            placeholder="https://meet.google.com/…"
            {...register('callUrl')}
          />
          {errors.callUrl && (
            <p className="mt-1 text-xs text-stage-rejected">{errors.callUrl.message}</p>
          )}
        </div>
      )}

      {/* Interviewer name */}
      <div>
        <label className="label">Interviewer name <span className="text-ink-400 font-normal">(optional)</span></label>
        <input
          className="field"
          placeholder="Jane Smith"
          {...register('interviewerName')}
        />
      </div>

      {/* Interviewer email */}
      <div>
        <label className="label">Interviewer email <span className="text-ink-400 font-normal">(optional)</span></label>
        <input
          type="email"
          className="field"
          placeholder="jane@company.com"
          {...register('interviewerEmail')}
        />
        {errors.interviewerEmail && (
          <p className="mt-1 text-xs text-stage-rejected">{errors.interviewerEmail.message}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes</label>
        <textarea
          rows={3}
          className="field resize-none"
          placeholder="Any additional information…"
          {...register('notes')}
        />
      </div>
    </>
  );
}

function Footer({
  isEdit,
  isPending,
  isDeleting,
  onDelete,
  onClose,
}: {
  isEdit: boolean;
  isPending: boolean;
  isDeleting: boolean;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div className="mt-5 flex items-center justify-between border-t border-paper-edge pt-4">
      <div>
        {isEdit && (
          <button
            type="button"
            className="btn-ghost text-stage-rejected text-sm"
            disabled={isDeleting}
            onClick={onDelete}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <button type="button" className="btn-outline" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add round'}
        </button>
      </div>
    </div>
  );
}
