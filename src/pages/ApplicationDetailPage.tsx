import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  APPLICATION_STATUSES,
  STATUS_LABEL,
  EVENT_TYPE_LABEL,
  INTERVIEW_STATUS_LABEL,
  INTERVIEW_LOCATION_LABEL,
  type ApplicationStatus,
  type InterviewStatus,
  type InterviewLocation,
  type EventType,
  type ApplicationEvent,
  type Interview,
} from '@/types';
import {
  useApplication,
  useUpdateApplication,
  useDeleteApplication,
} from '@/features/applications/useApplications';
import { useInterviews } from '@/features/interviews/useInterviews';
import { useEvents, useCreateEvent } from '@/features/events/useEvents';
import { EventFormDialog } from '@/features/events/EventFormDialog';
import { InterviewFormDialog } from '@/features/interviews/InterviewFormDialog';
import { useCompanyMap } from '@/features/companies/useCompanies';
import { StatusBadge } from '@/components/StatusBadge';
import { Spinner } from '@/components/Spinner';
import { formatDate, formatSalary } from '@/utils/format';
import { SOURCE_LABEL } from '@/features/applications/applicationSchema';

const INTERVIEW_DOT: Record<InterviewStatus, string> = {
  scheduled: 'bg-stage-interview',
  completed: 'bg-stage-applied',
  passed: 'bg-stage-offer',
  failed: 'bg-stage-rejected',
  cancelled: 'bg-ink-300',
};

const EVENT_DOT: Record<EventType, string> = {
  email:            'bg-stage-interview',
  call:             'bg-yellow-400',
  interview_invite: 'bg-purple-400',
  offer:            'bg-stage-offer',
  rejection:        'bg-stage-rejected',
  note:             'bg-ink-300',
  status_change:    'bg-brand',
  other:            'bg-ink-300',
};


function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</dt>
      <dd className="mt-1 text-sm text-ink-900">{children}</dd>
    </div>
  );
}

export function ApplicationDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: app, isLoading } = useApplication(id);
  const update = useUpdateApplication();
  const remove = useDeleteApplication();
  const { data: interviews } = useInterviews(id);
  const { data: events } = useEvents(id);
  const createEvent = useCreateEvent(id);
  const [eventDialog, setEventDialog] = useState<{ open: boolean; event?: ApplicationEvent }>({ open: false });
  const [interviewDialog, setInterviewDialog] = useState<{ open: boolean; interview?: Interview }>({ open: false });
  const [statusModal, setStatusModal] = useState<{ newStatus: ApplicationStatus; note: string } | null>(null);
  const companyMap = useCompanyMap();

  if (isLoading || !app) return <Spinner />;

  const companyName = app.company?.name ?? companyMap.get(app.companyId);
  const salary = formatSalary(app.salaryMin, app.salaryMax, app.salaryType);

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="text-sm text-ink-500 hover:text-ink-900">
        ← Back to applications
      </Link>

      {/* ── Header ── */}
      <div className="card mt-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {app.jobTitle}
            </h1>
            {companyName && <p className="mt-1 text-ink-500">{companyName}</p>}
          </div>
          <StatusBadge status={app.status} />
        </div>

        {/* ── Details grid ── */}
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
          {app.location && (
            <DetailItem label="Location">{app.location}</DetailItem>
          )}
          {app.jobType && (
            <DetailItem label="Job type">{app.jobType}</DetailItem>
          )}
          {app.role && (
            <DetailItem label="Role">{app.role}</DetailItem>
          )}
          {app.source && (
            <DetailItem label="Source">
              {SOURCE_LABEL[app.source as keyof typeof SOURCE_LABEL] ?? app.source}
            </DetailItem>
          )}
          {salary && (
            <DetailItem label="Salary">{salary}</DetailItem>
          )}
          {app.appliedDate && (
            <DetailItem label="Applied date">
              {formatDate(app.appliedDate)}
            </DetailItem>
          )}
          {app.recruiterName && (
            <DetailItem label="Recruiter">{app.recruiterName}</DetailItem>
          )}
          {app.recruiterEmail && (
            <DetailItem label="Recruiter email">
              <a href={`mailto:${app.recruiterEmail}`} className="text-brand hover:underline">
                {app.recruiterEmail}
              </a>
            </DetailItem>
          )}
          {app.recruiterPhone && (
            <DetailItem label="Recruiter phone">
              <a href={`tel:${app.recruiterPhone}`} className="text-brand hover:underline">
                {app.recruiterPhone}
              </a>
            </DetailItem>
          )}
          {app.jobUrl && (
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">
                Job posting
              </dt>
              <dd className="mt-1">
                <a
                  href={app.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm text-brand hover:underline"
                >
                  {app.jobUrl}
                </a>
              </dd>
            </div>
          )}
        </dl>

        {/* ── Skills ── */}
        {app.skills && app.skills.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Skills</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {app.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Job description ── */}
        {app.jobDescription && (
          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Job description
            </p>
            <p className="mt-2 whitespace-pre-wrap rounded-xl2 bg-paper p-4 text-sm leading-relaxed text-ink-700">
              {app.jobDescription}
            </p>
          </div>
        )}

        {/* ── Status / Delete ── */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-paper-edge pt-5">
          <label className="text-sm text-ink-500">Move to</label>
          <select
            className="field max-w-[180px]"
            value={app.status}
            onChange={(e) => {
              const newStatus = e.target.value as ApplicationStatus;
              if (newStatus === app.status) return;
              setStatusModal({ newStatus, note: '' });
            }}
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <button
            className="btn-ghost ml-auto text-stage-rejected"
            onClick={() => {
              if (confirm('Delete this application?')) {
                remove.mutate(app.id, { onSuccess: () => navigate('/') });
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* ── Interviews ── */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Interviews</h2>
          <button
            className="btn-outline text-sm"
            onClick={() => setInterviewDialog({ open: true })}
          >
            + Add round
          </button>
        </div>

        {(interviews?.length ?? 0) === 0 ? (
          <p className="card px-4 py-8 text-center text-sm text-ink-400">
            No interview rounds logged yet.
          </p>
        ) : (
          <ol className="card divide-y divide-paper-edge overflow-hidden">
            {interviews?.map((iv) => (
              <li
                key={iv.id}
                className="flex cursor-pointer items-center gap-3 px-4 py-3.5 hover:bg-paper transition-colors"
                onClick={() => setInterviewDialog({ open: true, interview: iv })}
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${INTERVIEW_DOT[iv.status]}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink-900">
                    Round {iv.roundNumber}: {iv.title}
                  </p>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                    {iv.scheduledAt && (
                      <p className="text-xs text-ink-400">
                        {formatDate(iv.scheduledAt)}
                      </p>
                    )}
                    {iv.location && (
                      <p className="text-xs text-ink-400">
                        {INTERVIEW_LOCATION_LABEL[iv.location as InterviewLocation]}
                      </p>
                    )}
                    {iv.interviewerName && (
                      <p className="text-xs text-ink-400">{iv.interviewerName}</p>
                    )}
                  </div>
                </div>
                <span className="ml-auto shrink-0 text-xs text-ink-500">
                  {INTERVIEW_STATUS_LABEL[iv.status as InterviewStatus]}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* ── Activity ── */}
      <section className="mt-6 mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Activity</h2>
          <button
            className="btn-outline text-sm"
            onClick={() => setEventDialog({ open: true })}
          >
            + Log event
          </button>
        </div>

        {(events?.length ?? 0) === 0 ? (
          <p className="card px-4 py-8 text-center text-sm text-ink-400">
            No activity logged yet.
          </p>
        ) : (
          <ol className="card divide-y divide-paper-edge overflow-hidden">
            {[...(events ?? [])]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((ev) => (
                <li
                  key={ev.id}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3.5 hover:bg-paper transition-colors"
                  onClick={() => setEventDialog({ open: true, event: ev })}
                >
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${EVENT_DOT[ev.eventType]}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink-900">
                      {ev.eventType === 'status_change' && ev.previousStatus && ev.newStatus
                        ? `${STATUS_LABEL[ev.previousStatus]} → ${STATUS_LABEL[ev.newStatus]}`
                        : ev.name}
                    </p>
                    {ev.notes && (
                      <p className="mt-0.5 truncate text-xs text-ink-400">{ev.notes}</p>
                    )}
                  </div>
                  <div className="ml-auto flex shrink-0 flex-col items-end gap-0.5">
                    <span className="text-xs text-ink-500">{EVENT_TYPE_LABEL[ev.eventType]}</span>
                    <span className="text-xs text-ink-400">{formatDate(ev.date)}</span>
                  </div>
                </li>
              ))}
          </ol>
        )}
      </section>

      {eventDialog.open && (
        <EventFormDialog
          appId={id}
          event={eventDialog.event}
          onClose={() => setEventDialog({ open: false })}
        />
      )}

      {interviewDialog.open && (
        <InterviewFormDialog
          appId={id}
          interview={interviewDialog.interview}
          onClose={() => setInterviewDialog({ open: false })}
        />
      )}

      {statusModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink-900/30 p-4"
          onClick={() => setStatusModal(null)}
        >
          <div
            className="card w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg font-semibold">
              Move to <span className="text-brand">{STATUS_LABEL[statusModal.newStatus]}</span>
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Optionally add a note about this status change.
            </p>
            <textarea
              className="field mt-4 resize-none"
              rows={3}
              placeholder="e.g. Recruiter sent rejection email…"
              value={statusModal.note}
              onChange={(e) => setStatusModal((prev) => prev && { ...prev, note: e.target.value })}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-outline" onClick={() => setStatusModal(null)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  const previousStatus = app.status;
                  const { newStatus, note } = statusModal;
                  update.mutate({ id: app.id, body: { status: newStatus } });
                  createEvent.mutate({
                    eventType: 'status_change',
                    name: 'Status change',
                    date: new Date().toISOString().slice(0, 10),
                    previousStatus,
                    newStatus,
                    notes: note.trim() || undefined,
                  });
                  setStatusModal(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
