import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  APPLICATION_STATUSES,
  STATUS_LABEL,
  type ApplicationStatus,
  type InterviewStatus,
} from '@/types';
import {
  useApplication,
  useUpdateApplication,
  useDeleteApplication,
} from '@/features/applications/useApplications';
import {
  useInterviews,
  useCreateInterview,
} from '@/features/interviews/useInterviews';
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
  const createInterview = useCreateInterview(id);
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
            onChange={(e) =>
              update.mutate({
                id: app.id,
                body: { status: e.target.value as ApplicationStatus },
              })
            }
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
            disabled={createInterview.isPending}
            onClick={() => {
              const title = prompt('Interview title (e.g. Technical round)');
              if (title) createInterview.mutate({ title });
            }}
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
              <li key={iv.id} className="flex items-center gap-3 px-4 py-3.5">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${INTERVIEW_DOT[iv.status]}`}
                />
                <div className="min-w-0">
                  <p className="font-medium text-ink-900">
                    Round {iv.roundNumber}: {iv.title}
                  </p>
                  {iv.scheduledAt && (
                    <p className="text-xs text-ink-400">
                      {new Date(iv.scheduledAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <span className="ml-auto text-xs capitalize text-ink-500">{iv.status}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
