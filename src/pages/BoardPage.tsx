import { useRef, useState } from 'react';
import clsx from 'clsx';
import {
  APPLICATION_STATUSES,
  STATUS_LABEL,
  type Application,
  type ApplicationStatus,
} from '@/types';
import {
  useApplications,
  useChangeStatus,
} from '@/features/applications/useApplications';
import { ApplicationCard } from '@/features/applications/ApplicationCard';
import { Spinner } from '@/components/Spinner';
import { EmptyState } from '@/components/EmptyState';
import { NewApplicationButton } from '@/features/applications/NewApplicationDialog';

const COLUMN_ACCENT: Record<ApplicationStatus, string> = {
  applied: 'before:bg-stage-applied',
  reviewing: 'before:bg-stage-reviewing',
  interview: 'before:bg-stage-interview',
  offer: 'before:bg-stage-offer',
  rejected: 'before:bg-stage-rejected',
};

export function BoardPage() {
  const { data, isLoading } = useApplications({ limit: 100 });
  const changeStatus = useChangeStatus();
  const dragId = useRef<string | null>(null);
  const [overCol, setOverCol] = useState<ApplicationStatus | null>(null);

  if (isLoading) return <Spinner label="Loading your board…" />;

  const apps = data?.items ?? [];

  if (apps.length === 0) {
    return (
      <EmptyState
        title="No applications yet"
        body="Add the first role you're chasing and it'll show up here, ready to move through your pipeline."
        action={<NewApplicationButton />}
      />
    );
  }

  const byStatus = (status: ApplicationStatus): Application[] =>
    apps.filter((a) => a.status === status);

  const handleDrop = (status: ApplicationStatus) => {
    const id = dragId.current;
    setOverCol(null);
    dragId.current = null;
    if (!id) return;
    const current = apps.find((a) => a.id === id);
    if (current && current.status !== status) {
      changeStatus.mutate({ id, status });
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Your pipeline
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Drag a card to move it through a stage.
          </p>
        </div>
        <NewApplicationButton />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {APPLICATION_STATUSES.map((status) => {
          const items = byStatus(status);
          return (
            <section
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(status);
              }}
              onDragLeave={() => setOverCol((c) => (c === status ? null : c))}
              onDrop={() => handleDrop(status)}
              className={clsx(
                'flex flex-col gap-3 rounded-xl2 p-2 transition',
                overCol === status && 'bg-brand-soft/60 ring-1 ring-brand-ring',
              )}
            >
              <div
                className={clsx(
                  'relative flex items-center justify-between pl-3 text-sm font-medium text-ink-700',
                  "before:absolute before:left-0 before:top-1/2 before:h-3.5 before:w-1 before:-translate-y-1/2 before:rounded-full before:content-['']",
                  COLUMN_ACCENT[status],
                )}
              >
                <span>{STATUS_LABEL[status]}</span>
                <span className="text-xs text-ink-400">{items.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {items.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onDragStart={(id) => (dragId.current = id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
