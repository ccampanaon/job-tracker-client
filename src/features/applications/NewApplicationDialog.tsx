import { useState, useEffect, KeyboardEvent } from 'react';
import { useForm, useController, type Control, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type Application,
  JOB_TYPES,
  JOB_TYPE_LABEL,
  SALARY_TYPES,
  SALARY_TYPE_LABEL,
} from '@/types';
import {
  useApplication,
  useCreateApplication,
  useUpdateApplication,
} from '@/features/applications/useApplications';
import { useCompanies } from '@/features/companies/useCompanies';
import {
  applicationSchema,
  ROLE_VALUES,
  LOCATION_TYPE_VALUES,
  SOURCE_VALUES,
  SOURCE_LABEL,
  type ApplicationFormValues,
} from './applicationSchema';

type FormValues = ApplicationFormValues;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SkillsInput({ control }: { control: Control<FormValues, any, any> }) {
  const { field } = useController({ name: 'skills', control, defaultValue: [] });
  const [input, setInput] = useState('');

  const addSkill = (raw: string) => {
    const skill = raw.trim();
    if (!skill) return;
    const current: string[] = field.value ?? [];
    if (!current.includes(skill)) field.onChange([...current, skill]);
    setInput('');
  };

  const removeSkill = (skill: string) =>
    field.onChange((field.value ?? []).filter((s: string) => s !== skill));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(input);
    } else if (e.key === 'Backspace' && input === '') {
      const current: string[] = field.value ?? [];
      if (current.length > 0) field.onChange(current.slice(0, -1));
    }
  };

  return (
    <div>
      <label className="label">Skills</label>
      <div className="field flex min-h-[42px] flex-wrap gap-1.5 py-2">
        {(field.value ?? []).map((skill: string) => (
          <span
            key={skill}
            className="flex items-center gap-1 rounded-md bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="ml-0.5 leading-none text-brand/60 hover:text-brand"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => addSkill(input)}
          placeholder={(field.value ?? []).length === 0 ? 'Type a skill and press Enter…' : ''}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none"
        />
      </div>
      <p className="mt-1 text-[11px] text-ink-400">Press Enter or comma to add</p>
    </div>
  );
}

export function NewApplicationButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        + New application
      </button>
      {open && <ApplicationFormDialog onClose={() => setOpen(false)} />}
    </>
  );
}

export function ApplicationFormDialog({
  application,
  onClose,
}: {
  application?: Application;
  onClose: () => void;
}) {
  const create = useCreateApplication();
  const update = useUpdateApplication();
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();
  const isEdit = !!application;

  const { data: fullApplication } = useApplication(application?.id ?? '');

  const sortedCompanies = [...companies].sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: isEdit
      ? {
          jobTitle: application.jobTitle,
          companyId: application.companyId,
          location: application.location ?? undefined,
          role: (application.role as unknown as FormValues['role']) ?? undefined,
          source: (application.source as unknown as FormValues['source']) ?? undefined,
          recruiterName: application.recruiterName ?? '',
          recruiterEmail: application.recruiterEmail ?? '',
          recruiterPhone: application.recruiterPhone ?? '',
          jobDescription: application.jobDescription ?? '',
          jobType: application.jobType ?? undefined,
          salaryType: application.salaryType ?? undefined,
          salaryMin: application.salaryMin ?? ('' as unknown as undefined),
          salaryMax: application.salaryMax ?? ('' as unknown as undefined),
          jobUrl: application.jobUrl ?? '',
          skills: application.skills ?? [],
        }
      : { skills: [] },
  });

  useEffect(() => {
    if (!fullApplication) return;
    reset({
      jobTitle: fullApplication.jobTitle,
      companyId: fullApplication.companyId,
      location: fullApplication.location ?? undefined,
      role: (fullApplication.role as unknown as FormValues['role']) ?? undefined,
      source: (fullApplication.source as FormValues['source']) ?? undefined,
      recruiterName: fullApplication.recruiterName ?? '',
      recruiterEmail: fullApplication.recruiterEmail ?? '',
      recruiterPhone: fullApplication.recruiterPhone ?? '',
      jobDescription: fullApplication.jobDescription ?? '',
      jobType: fullApplication.jobType ?? undefined,
      salaryType: fullApplication.salaryType ?? undefined,
      salaryMin: fullApplication.salaryMin ?? ('' as unknown as undefined),
      salaryMax: fullApplication.salaryMax ?? ('' as unknown as undefined),
      jobUrl: fullApplication.jobUrl ?? '',
      skills: fullApplication.skills ?? [],
    });
  }, [fullApplication, reset]);

  const selectedSource = watch('source');

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const isRecruiter = values.source === 'recruiter';
    const body = {
      jobTitle: values.jobTitle,
      companyId: values.companyId,
      location: values.location,
      role: values.role,
      source: values.source,
      recruiterName: isRecruiter ? (values.recruiterName || undefined) : undefined,
      recruiterEmail: isRecruiter ? (values.recruiterEmail || undefined) : undefined,
      recruiterPhone: isRecruiter ? (values.recruiterPhone || undefined) : undefined,
      jobDescription: values.jobDescription || undefined,
      jobType: values.jobType,
      salaryMin: values.salaryMin,
      salaryMax: values.salaryMax,
      salaryType: values.salaryType,
      jobUrl: values.jobUrl,
      skills: values.skills?.length ? values.skills : undefined,
    };

    if (isEdit) {
      update.mutate({ id: application.id, body }, { onSuccess: onClose });
    } else {
      create.mutate({ ...body, status: 'applied' }, { onSuccess: onClose });
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/30 p-4"
      onClick={onClose}
    >
      <div
        className="card flex max-h-[90vh] w-full max-w-2xl flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-paper-edge px-6 py-4">
          <h2 className="font-display text-lg font-semibold">
            {isEdit ? 'Edit application' : 'New application'}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Job Title */}
            <div>
              <label className="label">Job title</label>
              <input
                className="field"
                placeholder="Senior Frontend Engineer"
                {...register('jobTitle')}
              />
              {errors.jobTitle && (
                <p className="mt-1 text-xs text-stage-rejected">{errors.jobTitle.message}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="label">Role</label>
              <select className="field" {...register('role')}>
                <option value="">Select…</option>
                {ROLE_VALUES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Company */}
            <div className="col-span-2">
              <label className="label">Company</label>
              <select className="field" disabled={companiesLoading} {...register('companyId')}>
                <option value="">
                  {companiesLoading ? 'Loading…' : 'Select a company…'}
                </option>
                {sortedCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.companyId && (
                <p className="mt-1 text-xs text-stage-rejected">{errors.companyId.message}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="label">Location</label>
              <select className="field" {...register('location')}>
                <option value="">Select…</option>
                {LOCATION_TYPE_VALUES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Type */}
            <div>
              <label className="label">Job type</label>
              <select className="field" {...register('jobType')}>
                <option value="">Select…</option>
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {JOB_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>

            {/* Source */}
            <div>
              <label className="label">Source</label>
              <select className="field" {...register('source')}>
                <option value="">Select…</option>
                {SOURCE_VALUES.map((s) => (
                  <option key={s} value={s}>
                    {SOURCE_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>

            {/* Recruiter info — visible only when source is 'recruiter' */}
            {selectedSource === 'recruiter' && (
              <>
                <div className="col-span-2">
                  <label className="label">Recruiter name</label>
                  <input
                    className="field"
                    placeholder="Jane Smith"
                    {...register('recruiterName')}
                  />
                </div>
                <div>
                  <label className="label">Recruiter email</label>
                  <input
                    type="email"
                    className="field"
                    placeholder="jane@agency.com"
                    {...register('recruiterEmail')}
                  />
                  {errors.recruiterEmail && (
                    <p className="mt-1 text-xs text-stage-rejected">{errors.recruiterEmail.message}</p>
                  )}
                </div>
                <div>
                  <label className="label">Recruiter phone</label>
                  <input
                    type="tel"
                    className="field"
                    placeholder="+1 555 000 0000"
                    {...register('recruiterPhone')}
                  />
                </div>
              </>
            )}

            {/* Salary Type */}
            <div>
              <label className="label">Salary type</label>
              <select className="field" {...register('salaryType')}>
                <option value="">Select…</option>
                {SALARY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {SALARY_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>

            {/* Salary Min */}
            <div>
              <label className="label">Salary min</label>
              <input
                type="number"
                min={0}
                className="field"
                placeholder="80000"
                {...register('salaryMin')}
              />
              {errors.salaryMin && (
                <p className="mt-1 text-xs text-stage-rejected">{errors.salaryMin.message}</p>
              )}
            </div>

            {/* Salary Max */}
            <div>
              <label className="label">Salary max</label>
              <input
                type="number"
                min={0}
                className="field"
                placeholder="120000"
                {...register('salaryMax')}
              />
              {errors.salaryMax && (
                <p className="mt-1 text-xs text-stage-rejected">{errors.salaryMax.message}</p>
              )}
            </div>

            {/* Job URL */}
            <div className="col-span-2">
              <label className="label">Job posting URL</label>
              <input className="field" placeholder="https://…" {...register('jobUrl')} />
              {errors.jobUrl && (
                <p className="mt-1 text-xs text-stage-rejected">{errors.jobUrl.message}</p>
              )}
            </div>

            {/* Job Description */}
            <div className="col-span-2">
              <label className="label">Job description</label>
              <textarea
                rows={4}
                className="field resize-none"
                placeholder="Paste the job description…"
                {...register('jobDescription')}
              />
            </div>

            {/* Skills */}
            <div className="col-span-2">
              <SkillsInput control={control} />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex justify-end gap-2 border-t border-paper-edge pt-4">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
