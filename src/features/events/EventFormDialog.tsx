import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  EVENT_TYPES,
  EVENT_TYPE_LABEL,
  STATUS_LABEL,
  type ApplicationEvent,
} from '@/types';
import {
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from '@/features/events/useEvents';
import {
  eventSchema,
  type EventFormValues,
} from '@/features/events/eventSchema';
import { formatDate } from '@/utils/format';

function ReadOnlyStatusChange({
  event,
  onDelete,
  onClose,
  isDeleting,
}: {
  event: ApplicationEvent;
  onDelete: () => void;
  onClose: () => void;
  isDeleting: boolean;
}) {
  const from = event.previousStatus ? STATUS_LABEL[event.previousStatus] : '—';
  const to = event.newStatus ? STATUS_LABEL[event.newStatus] : '—';

  return (
    <>
      <div className="border-b border-paper-edge px-6 py-4">
        <h2 className="font-display text-lg font-semibold">Status change</h2>
      </div>

      <div className="px-6 py-5 space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Date</p>
          <p className="mt-1 text-sm text-ink-900">{formatDate(event.date)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Transition</p>
          <p className="mt-1 text-sm text-ink-900">
            {from} → {to}
          </p>
        </div>
        {event.notes && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Notes</p>
            <p className="mt-1 text-sm text-ink-900 whitespace-pre-wrap">{event.notes}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-paper-edge px-6 py-4">
        <button
          type="button"
          className="btn-ghost text-stage-rejected text-sm"
          disabled={isDeleting}
          onClick={onDelete}
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
        <button type="button" className="btn-outline" onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );
}

export function EventFormDialog({
  appId,
  event,
  onClose,
}: {
  appId: string;
  event?: ApplicationEvent;
  onClose: () => void;
}) {
  const isEdit = !!event;
  const isStatusChange = event?.eventType === 'status_change';

  const create = useCreateEvent(appId);
  const update = useUpdateEvent(appId);
  const remove = useDeleteEvent(appId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: isEdit && !isStatusChange
      ? {
          name: event.name,
          eventType: event.eventType as EventFormValues['eventType'],
          date: event.date,
          notes: event.notes ?? '',
        }
      : {
          date: new Date().toISOString().slice(0, 10),
        },
  });

  const handleDelete = () => {
    if (!event) return;
    remove.mutate(event.id, { onSuccess: onClose });
  };

  const onSubmit: SubmitHandler<EventFormValues> = (values) => {
    if (isEdit && event) {
      update.mutate(
        { id: event.id, body: { name: values.name, eventType: values.eventType, date: values.date, notes: values.notes || undefined } },
        { onSuccess: onClose },
      );
    } else {
      create.mutate(
        { name: values.name, eventType: values.eventType, date: values.date, notes: values.notes || undefined },
        { onSuccess: onClose },
      );
    }
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
        {isStatusChange ? (
          <ReadOnlyStatusChange
            event={event}
            onDelete={handleDelete}
            onClose={onClose}
            isDeleting={remove.isPending}
          />
        ) : (
          <>
            <div className="border-b border-paper-edge px-6 py-4">
              <h2 className="font-display text-lg font-semibold">
                {isEdit ? 'Edit event' : 'Log event'}
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="label">Name</label>
                  <input
                    className="field"
                    placeholder="HR asking for availability"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-stage-rejected">{errors.name.message}</p>
                  )}
                </div>

                {/* Event type */}
                <div>
                  <label className="label">Event type</label>
                  <select className="field" {...register('eventType')}>
                    <option value="">Select…</option>
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {EVENT_TYPE_LABEL[t]}
                      </option>
                    ))}
                  </select>
                  {errors.eventType && (
                    <p className="mt-1 text-xs text-stage-rejected">{errors.eventType.message}</p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="label">Date</label>
                  <input type="date" className="field" {...register('date')} />
                  {errors.date && (
                    <p className="mt-1 text-xs text-stage-rejected">{errors.date.message}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="label">Notes</label>
                  <textarea
                    rows={3}
                    className="field resize-none"
                    placeholder="Optional details…"
                    {...register('notes')}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-paper-edge pt-4">
                <div>
                  {isEdit && (
                    <button
                      type="button"
                      className="btn-ghost text-stage-rejected text-sm"
                      disabled={remove.isPending}
                      onClick={handleDelete}
                    >
                      {remove.isPending ? 'Deleting…' : 'Delete'}
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn-outline" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={isPending}>
                    {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Log event'}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
