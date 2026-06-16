import type { ReactNode } from 'react';

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <h3 className="font-display text-lg font-semibold text-ink-900">
        {title}
      </h3>
      <p className="max-w-sm text-sm text-ink-500">{body}</p>
      {action}
    </div>
  );
}
