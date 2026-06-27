import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InterviewFormDialog } from './InterviewFormDialog';
import type { Interview } from '@/types';

const mockMutate = vi.fn();

vi.mock('@/features/interviews/useInterviews', () => ({
  useCreateInterview: () => ({ mutate: mockMutate, isPending: false }),
  useUpdateInterview: () => ({ mutate: mockMutate, isPending: false }),
  useDeleteInterview: () => ({ mutate: mockMutate, isPending: false }),
}));

const onClose = vi.fn();

beforeEach(() => {
  mockMutate.mockReset();
  onClose.mockReset();
});

describe('InterviewFormDialog — create mode', () => {
  beforeEach(() => {
    render(<InterviewFormDialog appId="app-1" onClose={onClose} />);
  });

  it('shows "Add interview round" heading', () => {
    expect(screen.getByRole('heading', { name: 'Add interview round' })).toBeInTheDocument();
  });

  it('renders title field', () => {
    expect(
      screen.getByPlaceholderText('e.g. Technical round, HR screen'),
    ).toBeInTheDocument();
  });

  it('renders interview date input with future-date constraint', () => {
    const dateInput = screen
      .getAllByDisplayValue('')
      .find((el) => el.getAttribute('type') === 'date');
    expect(dateInput).toBeInTheDocument();
    expect(dateInput?.getAttribute('min')).toBeTruthy();
  });

  it('renders location dropdown', () => {
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(1);
  });

  it('does not render call URL field by default', () => {
    expect(screen.queryByPlaceholderText(/meet\.google\.com/)).not.toBeInTheDocument();
  });

  it('renders notes textarea', () => {
    expect(screen.getByPlaceholderText('Any additional information…')).toBeInTheDocument();
  });

  it('shows Cancel and Add round buttons', () => {
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add round/i })).toBeInTheDocument();
  });

  it('does not show a Delete button', () => {
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('does not show status dropdown', () => {
    const selects = screen.getAllByRole('combobox').map((s) => s.getAttribute('name'));
    expect(selects).not.toContain('status');
  });

  it('does not show post-interview fields', () => {
    expect(
      screen.queryByPlaceholderText('List the questions you were asked…'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('Describe any coding exercise or take-home test…'),
    ).not.toBeInTheDocument();
  });
});

describe('InterviewFormDialog — edit mode', () => {
  const interview: Interview = {
    id: 'iv-1',
    applicationId: 'app-1',
    roundNumber: 1,
    title: 'HR screen',
    status: 'scheduled',
    scheduledAt: '2026-06-20',
    location: 'phone',
    callUrl: null,
    interviewerName: 'Jane Smith',
    interviewerEmail: 'jane@co.com',
    notes: 'Intro call',
    questionsAsked: 'Tell me about yourself',
    codeChallenge: null,
  };

  beforeEach(() => {
    render(<InterviewFormDialog appId="app-1" interview={interview} onClose={onClose} />);
  });

  it('shows "Edit interview round" heading', () => {
    expect(screen.getByRole('heading', { name: 'Edit interview round' })).toBeInTheDocument();
  });

  it('pre-fills the title', () => {
    expect(screen.getByDisplayValue('HR screen')).toBeInTheDocument();
  });

  it('pre-fills interviewer name', () => {
    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
  });

  it('pre-fills notes', () => {
    expect(screen.getByDisplayValue('Intro call')).toBeInTheDocument();
  });

  it('pre-fills questionsAsked', () => {
    expect(screen.getByDisplayValue('Tell me about yourself')).toBeInTheDocument();
  });

  it('renders status dropdown', () => {
    const selects = screen.getAllByRole('combobox').map((s) => s.getAttribute('name'));
    expect(selects).toContain('status');
  });

  it('shows all interview statuses in the status dropdown', () => {
    const statusSelect = screen
      .getAllByRole('combobox')
      .find((s) => s.getAttribute('name') === 'status');
    expect(statusSelect).toBeDefined();
    const options = Array.from(statusSelect!.querySelectorAll('option')).map(
      (o) => o.textContent,
    );
    expect(options).toContain('Pending');
    expect(options).toContain('Done');
    expect(options).toContain('Passed');
    expect(options).toContain('Failed');
    expect(options).toContain('Cancelled');
  });

  it('shows post-interview fields', () => {
    expect(
      screen.getByPlaceholderText('List the questions you were asked…'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Describe any coding exercise or take-home test…'),
    ).toBeInTheDocument();
  });

  it('shows "Save changes" button', () => {
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('shows a Delete button', () => {
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('does not show "Add round" button', () => {
    expect(screen.queryByRole('button', { name: /add round/i })).not.toBeInTheDocument();
  });
});
