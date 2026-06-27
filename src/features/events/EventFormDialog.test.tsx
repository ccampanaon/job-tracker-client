import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventFormDialog } from './EventFormDialog';
import type { ApplicationEvent } from '@/types';

const mockMutate = vi.fn();

vi.mock('@/features/events/useEvents', () => ({
  useCreateEvent: () => ({ mutate: mockMutate, isPending: false }),
  useUpdateEvent: () => ({ mutate: mockMutate, isPending: false }),
  useDeleteEvent: () => ({ mutate: mockMutate, isPending: false }),
}));

const onClose = vi.fn();

beforeEach(() => {
  mockMutate.mockReset();
  onClose.mockReset();
});

describe('EventFormDialog — create mode', () => {
  beforeEach(() => {
    render(<EventFormDialog appId="app-1" onClose={onClose} />);
  });

  it('shows "Log event" heading', () => {
    expect(screen.getByRole('heading', { name: 'Log event' })).toBeInTheDocument();
  });

  it('renders name, event type, and notes fields', () => {
    expect(screen.getByPlaceholderText('HR asking for availability')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Optional details…')).toBeInTheDocument();
  });

  it('does not include Status change in the event type dropdown', () => {
    const options = screen.getAllByRole('option').map((o) => o.textContent);
    expect(options).not.toContain('Status change');
  });

  it('shows Cancel and Log event buttons', () => {
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log event/i })).toBeInTheDocument();
  });

  it('does not show a Delete button', () => {
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });
});

describe('EventFormDialog — edit mode', () => {
  const event: ApplicationEvent = {
    id: 'evt-1',
    applicationId: 'app-1',
    name: 'Phone screen',
    eventType: 'call',
    date: '2026-06-20',
    notes: 'Quick intro call',
    createdAt: '2026-06-20T00:00:00Z',
  };

  beforeEach(() => {
    render(<EventFormDialog appId="app-1" event={event} onClose={onClose} />);
  });

  it('shows "Edit event" heading', () => {
    expect(screen.getByText('Edit event')).toBeInTheDocument();
  });

  it('pre-fills the name field', () => {
    expect(screen.getByDisplayValue('Phone screen')).toBeInTheDocument();
  });

  it('pre-fills the notes field', () => {
    expect(screen.getByDisplayValue('Quick intro call')).toBeInTheDocument();
  });

  it('shows "Save changes" on the submit button', () => {
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('shows a Delete button', () => {
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
});

describe('EventFormDialog — status_change read-only view', () => {
  const event: ApplicationEvent = {
    id: 'evt-2',
    applicationId: 'app-1',
    name: 'Status change',
    eventType: 'status_change',
    date: '2026-06-18',
    previousStatus: 'applied',
    newStatus: 'reviewing',
    createdAt: '2026-06-18T00:00:00Z',
  };

  beforeEach(() => {
    render(<EventFormDialog appId="app-1" event={event} onClose={onClose} />);
  });

  it('shows "Status change" heading', () => {
    expect(screen.getByRole('heading', { name: 'Status change' })).toBeInTheDocument();
  });

  it('shows the status transition label', () => {
    expect(screen.getByText(/Applied.*Reviewing/)).toBeInTheDocument();
  });

  it('does not render any editable text inputs', () => {
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('does not render any dropdowns', () => {
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('shows a Close button', () => {
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('shows a Delete button', () => {
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
});
