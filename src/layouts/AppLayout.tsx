import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { useAuthStore } from '@/store/auth';
import { useLogout, useRestoreSession } from '@/features/auth/useAuth';
import { Spinner } from '@/components/Spinner';

function IconTable() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 9v9" />
    </svg>
  );
}

function IconBoard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="18" rx="1" />
      <rect x="14" y="3" width="7" height="10" rx="1" />
      <rect x="14" y="17" width="7" height="4" rx="1" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M9 21V7l6-4v18M9 7H5a2 2 0 0 0-2 2v12" />
      <path d="M13 21V11l4-2v12" />
      <path d="M9 11h.01M9 15h.01" />
    </svg>
  );
}

function SidebarLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all',
          isActive
            ? 'bg-brand text-white shadow-sm'
            : 'text-ink-500 hover:bg-paper hover:text-ink-900',
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const isRestoring = useRestoreSession();

  if (isRestoring) return <Spinner label="Restoring session…" />;

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      {/* ── Sidebar ── */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-paper-edge bg-paper-card">
        <div className="flex h-16 items-center gap-2.5 border-b border-paper-edge px-5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
            T
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-ink-900">
            Trackboard
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
            Menu
          </p>
          <ul className="space-y-1">
            <li>
              <SidebarLink to="/" icon={<IconTable />} label="Applications" />
            </li>
            <li>
              <SidebarLink to="/board" icon={<IconBoard />} label="Board" />
            </li>
            <li>
              <SidebarLink to="/companies" icon={<IconBuilding />} label="Companies" />
            </li>
          </ul>
        </nav>
      </aside>

      {/* ── Main column ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-end border-b border-paper-edge bg-paper-card px-6">
          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden text-sm text-ink-500 sm:inline">
                {user.name}
              </span>
            )}
            {user && (
              <div className="grid h-8 w-8 place-items-center rounded-full bg-brand text-xs font-semibold text-white">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <button onClick={logout} className="btn-outline text-sm">
              Sign out
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
