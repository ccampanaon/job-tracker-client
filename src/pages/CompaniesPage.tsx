import { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Company } from '@/types';
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from '@/features/companies/useCompanies';
import { Spinner } from '@/components/Spinner';
import { EmptyState } from '@/components/EmptyState';

// ─── Avatar helpers ────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-sky-100 text-sky-700',
];

function CompanyAvatar({ name }: { name: string }) {
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  const letters = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${color}`}
    >
      {letters}
    </div>
  );
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

type SortField = 'name' | 'industry' | 'website';
type SortDir = 'asc' | 'desc';

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
      {dir === 'asc' ? (
        <path d="M5 0 L8 4 H2 Z" />
      ) : (
        <path d="M5 14 L2 10 H8 Z" />
      )}
    </svg>
  );
}

function ThCol({
  field,
  label,
  sortField,
  sortDir,
  onSort,
}: {
  field: SortField;
  label: string;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
}) {
  return (
    <th
      className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-500 hover:text-ink-900"
      onClick={() => onSort(field)}
    >
      {label}
      <SortIcon field={field} active={sortField} dir={sortDir} />
    </th>
  );
}

// ─── Actions dropdown ─────────────────────────────────────────────────────────

function ActionsDropdown({
  onEdit,
  onDelete,
}: {
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

// ─── Create / Edit dialog ─────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  website: z.preprocess(
    (val) => {
      if (!val || val === '') return undefined;
      const s = String(val).trim();
      return /^https?:\/\//i.test(s) ? s : `https://${s}`;
    },
    z.string().url('Enter a valid URL').optional(),
  ),
  industry: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function CompanyFormDialog({
  company,
  onClose,
}: {
  company?: Company;
  onClose: () => void;
}) {
  const create = useCreateCompany();
  const update = useUpdateCompany();
  const isEdit = !!company;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          name: company.name,
          website: company.website ?? '',
          industry: company.industry ?? '',
          notes: company.notes ?? '',
        }
      : {},
  });

  const onSubmit = (values: FormValues) => {
    const body = { ...values, website: values.website || undefined };
    if (isEdit) {
      update.mutate({ id: company.id, body }, { onSuccess: onClose });
    } else {
      create.mutate(body, { onSuccess: onClose });
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/30 p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-semibold">
          {isEdit ? 'Edit company' : 'New company'}
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <label className="label">Company name</label>
            <input
              className="field"
              placeholder="Acme Corp"
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-stage-rejected">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="label">Industry</label>
            <input
              className="field"
              placeholder="Software, Finance…"
              {...register('industry')}
            />
          </div>

          <div>
            <label className="label">Website</label>
            <input
              className="field"
              placeholder="https://example.com"
              {...register('website')}
            />
            {errors.website && (
              <p className="mt-1 text-xs text-stage-rejected">
                {errors.website.message}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <label className="label">Notes</label>
            <textarea
              className="field min-h-20"
              placeholder="Any notes about this company…"
              {...register('notes')}
            />
          </div>

          <div className="col-span-2 flex justify-end gap-2">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending
                ? 'Saving…'
                : isEdit
                  ? 'Save changes'
                  : 'Add company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZES = [10, 25, 50];

export function CompaniesPage() {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [dialogCompany, setDialogCompany] = useState<Company | 'new' | null>(
    null,
  );

  const { data: companies = [], isLoading } = useCompanies();
  const remove = useDeleteCompany();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.industry?.toLowerCase().includes(q) ?? false) ||
        (c.website?.toLowerCase().includes(q) ?? false),
    );
  }, [companies, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = '';
      let bv = '';
      if (sortField === 'name') {
        av = a.name;
        bv = b.name;
      } else if (sortField === 'industry') {
        av = a.industry ?? '';
        bv = b.industry ?? '';
      } else if (sortField === 'website') {
        av = a.website ?? '';
        bv = b.website ?? '';
      }
      const cmp = av.localeCompare(bv);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const pageItems = sorted.slice(startIdx, startIdx + pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleDelete = (company: Company) => {
    if (confirm(`Delete "${company.name}"?`)) {
      remove.mutate(company.id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Companies
        </h1>
        <button className="btn-primary" onClick={() => setDialogCompany('new')}>
          + New company
        </button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : companies.length === 0 ? (
        <EmptyState
          title="No companies yet"
          body="Add the companies you're applying to and track them here."
          action={
            <button
              className="btn-primary"
              onClick={() => setDialogCompany('new')}
            >
              + New company
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper-edge px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-ink-500">
              Show
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
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
                  <ThCol field="name" label="Company" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <ThCol field="industry" label="Industry" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <ThCol field="website" label="Website" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Notes
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-edge">
                {pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-ink-400"
                    >
                      No companies match your search.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((company) => (
                    <tr key={company.id} className="hover:bg-paper-edge/30">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <CompanyAvatar name={company.name} />
                          <span className="font-medium text-ink-900">
                            {company.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-ink-600">
                        {company.industry ?? '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        {company.website ? (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand hover:underline"
                          >
                            {company.website.replace(/^https?:\/\//, '')}
                          </a>
                        ) : (
                          <span className="text-ink-400">—</span>
                        )}
                      </td>
                      <td className="max-w-xs px-4 py-3.5 text-ink-500">
                        {company.notes ? (
                          <span
                            className="block truncate"
                            title={company.notes}
                          >
                            {company.notes}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <ActionsDropdown
                          onEdit={() => setDialogCompany(company)}
                          onDelete={() => handleDelete(company)}
                        />
                      </td>
                    </tr>
                  ))
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
                    p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                )
                .reduce<(number | '…')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…');
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

      {dialogCompany && (
        <CompanyFormDialog
          company={dialogCompany === 'new' ? undefined : dialogCompany}
          onClose={() => setDialogCompany(null)}
        />
      )}
    </div>
  );
}
