import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Application } from '@/types';
import {
  useApplications,
  useDeleteApplication,
} from '@/features/applications/useApplications';
import {
  ApplicationFormDialog,
  NewApplicationButton,
} from '@/features/applications/NewApplicationDialog';
import { useCompanyMap } from '@/features/companies/useCompanies';
import { StatusBadge } from '@/components/StatusBadge';
import { Spinner } from '@/components/Spinner';
import { EmptyState } from '@/components/EmptyState';

// ─── Types ────────────────────────────────────────────────────────────────────

type SortField = 'jobTitle' | 'company' | 'status' | 'location' | 'appliedDate';
type SortDir = 'asc' | 'desc';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-sky-100 text-sky-700',
];

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  // Parse date parts directly to avoid UTC-to-local timezone shift.
  // new Date("2026-06-16") is UTC midnight, which becomes the previous day
  // in any timezone behind UTC.
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CompanyAvatar({ name }: { name: string }) {
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(name)}`}
    >
      {initials(name)}
    </div>
  );
}

function SortIcon({
  field,
  active,
  dir,
}: {
  field: SortField;
  active: SortField;
  dir: SortDir;
}) {
  if (field !== active) {
    return (
      <svg
        className="ml-1.5 inline h-3.5 w-3.5 text-ink-300"
        viewBox="0 0 10 14"
        fill="currentColor"
      >
        <path d="M5 0 L8 4 H2 Z M5 14 L2 10 H8 Z" />
      </svg>
    );
  }
  return (
    <svg
      className="ml-1.5 inline h-3.5 w-3.5 text-brand"
      viewBox="0 0 10 14"
      fill="currentColor"
    >
      {dir === 'asc' ? <path d="M5 0 L8 4 H2 Z" /> : <path d="M5 14 L2 10 H8 Z" />}
    </svg>
  );
}

function ThCol({
  field,
  label,
  className = '',
  sortField,
  sortDir,
  onSort,
}: {
  field: SortField;
  label: string;
  className?: string;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
}) {
  return (
    <th
      className={`cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-500 hover:text-ink-900 ${className}`}
      onClick={() => onSort(field)}
    >
      {label}
      <SortIcon field={field} active={sortField} dir={sortDir} />
    </th>
  );
}

function ActionsDropdown({
  app,
  onEdit,
  onDelete,
}: {
  app: Application;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open actions"
        className="rounded-lg p-1.5 text-ink-400 hover:bg-paper-edge hover:text-ink-900"
      >
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="2.5" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13.5" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20 min-w-[140px] rounded-xl border border-paper-edge bg-paper py-1 shadow-lg">
          <Link
            to={`/applications/${app.id}`}
            className="block px-4 py-2 text-sm text-ink-700 hover:bg-paper-edge/60"
            onClick={() => setOpen(false)}
          >
            Review
          </Link>
          <button
            className="block w-full px-4 py-2 text-left text-sm text-ink-700 hover:bg-paper-edge/60"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            Edit
          </button>
          <button
            className="block w-full px-4 py-2 text-left text-sm text-stage-rejected hover:bg-paper-edge/60"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZES = [10, 25, 50, 100];

export function ListPage() {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('appliedDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [editingApp, setEditingApp] = useState<Application | null>(null);

  const { data, isLoading } = useApplications({ limit: 100 });
  const remove = useDeleteApplication();
  const companyMap = useCompanyMap();

  const allApps = data?.items ?? [];

  const getCompanyName = (app: Application) =>
    app.company?.name ?? companyMap.get(app.companyId) ?? '';

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allApps;
    return allApps.filter(
      (app) =>
        app.jobTitle.toLowerCase().includes(q) ||
        getCompanyName(app).toLowerCase().includes(q) ||
        (app.location?.toLowerCase().includes(q) ?? false) ||
        app.status.toLowerCase().includes(q),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allApps, search, companyMap]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = '';
      let bv = '';
      if (sortField === 'jobTitle') {
        av = a.jobTitle;
        bv = b.jobTitle;
      } else if (sortField === 'company') {
        av = getCompanyName(a);
        bv = getCompanyName(b);
      } else if (sortField === 'status') {
        av = a.status;
        bv = b.status;
      } else if (sortField === 'location') {
        av = a.location ?? '';
        bv = b.location ?? '';
      } else if (sortField === 'appliedDate') {
        av = a.appliedDate ?? '';
        bv = b.appliedDate ?? '';
      }
      const cmp = av.localeCompare(bv);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sortField, sortDir, companyMap]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePageSize = Math.max(1, pageSize);
  const startIdx = (page - 1) * safePageSize;
  const pageApps = sorted.slice(startIdx, startIdx + safePageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  const handlePageSize = (n: number) => {
    setPageSize(n);
    setPage(1);
  };

  const handleDelete = (app: Application) => {
    if (confirm(`Delete application for "${app.jobTitle}"?`)) {
      remove.mutate(app.id);
    }
  };


  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Applications
        </h1>
        <NewApplicationButton />
      </div>

      {isLoading ? (
        <Spinner />
      ) : allApps.length === 0 ? (
        <EmptyState
          title="No applications yet"
          body="Add your first application and it'll appear here."
          action={<NewApplicationButton />}
        />
      ) : (
        <div className="card overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper-edge px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-ink-500">
              Show
              <select
                value={pageSize}
                onChange={(e) => handlePageSize(Number(e.target.value))}
                className="field w-auto py-1 text-sm"
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              entries
            </div>

            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3a6 6 0 100 12A6 6 0 009 3zM2 9a7 7 0 1112.452 4.391l3.328 3.329a1 1 0 01-1.415 1.415l-3.328-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search…"
                className="field py-1.5 pl-9 text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-paper-edge bg-paper/60">
                  <ThCol field="jobTitle" label="Role" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <ThCol field="company" label="Company" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <ThCol field="status" label="Status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <ThCol field="location" label="Location" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <ThCol field="appliedDate" label="Applied" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-edge">
                {pageApps.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-ink-400"
                    >
                      No applications match your search.
                    </td>
                  </tr>
                ) : (
                  pageApps.map((app) => {
                    const company = getCompanyName(app);
                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-paper-edge/30"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            {company && <CompanyAvatar name={company} />}
                            <span className="font-medium text-ink-900">
                              {app.jobTitle}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-ink-600">
                          {company || '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-4 py-3.5 text-ink-500">
                          {app.location ?? '—'}
                        </td>
                        <td className="px-4 py-3.5 text-ink-500">
                          {formatDate(app.appliedDate)}
                        </td>
                        <td className="px-4 py-3.5">
                          <ActionsDropdown
                            app={app}
                            onEdit={() => setEditingApp(app)}
                            onDelete={() => handleDelete(app)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-paper-edge px-4 py-3 text-sm text-ink-500">
            <span>
              {sorted.length === 0
                ? 'No entries'
                : `Showing ${startIdx + 1} to ${Math.min(startIdx + pageSize, sorted.length)} of ${sorted.length} ${sorted.length === 1 ? 'entry' : 'entries'}`}
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-paper-edge px-3 py-1.5 text-xs font-medium transition hover:bg-paper-edge disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - page) <= 1,
                )
                .reduce<(number | '…')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1)
                    acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-ink-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        page === p
                          ? 'bg-brand text-white'
                          : 'border border-paper-edge hover:bg-paper-edge'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-paper-edge px-3 py-1.5 text-xs font-medium transition hover:bg-paper-edge disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {editingApp && (
        <ApplicationFormDialog
          application={editingApp}
          onClose={() => setEditingApp(null)}
        />
      )}
    </div>
  );
}
