import { Link } from 'react-router-dom';
import type { Application } from '@/types';
import { useCompanyMap } from '@/features/companies/useCompanies';

export function ApplicationCard({
  application,
  onDragStart,
}: {
  application: Application;
  onDragStart: (id: string) => void;
}) {
  const companyMap = useCompanyMap();
  const companyName =
    application.company?.name ?? companyMap.get(application.companyId);

  return (
    <Link
      to={`/applications/${application.id}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(application.id);
      }}
      className="card block cursor-grab p-3.5 transition hover:shadow-lift active:cursor-grabbing"
    >
      <p className="font-display text-sm font-semibold leading-snug text-ink-900">
        {application.jobTitle}
      </p>
      {companyName && (
        <p className="mt-0.5 text-sm text-ink-500">{companyName}</p>
      )}
      {application.location && (
        <p className="mt-2 text-xs text-ink-400">{application.location}</p>
      )}
    </Link>
  );
}
