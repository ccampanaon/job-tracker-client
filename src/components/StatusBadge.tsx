import clsx from 'clsx';
import { STATUS_LABEL, type ApplicationStatus } from '@/types';

const styles: Record<ApplicationStatus, string> = {
  applied: 'bg-gray-100 text-stage-applied',
  reviewing: 'bg-amber-50 text-stage-reviewing',
  interview: 'bg-brand-soft text-stage-interview',
  offer: 'bg-green-50 text-stage-offer',
  rejected: 'bg-rose-50 text-stage-rejected',
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
