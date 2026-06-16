import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';
import { APPLICATION_STATUSES, STATUS_LABEL } from '@/types';

describe('StatusBadge', () => {
  it.each(APPLICATION_STATUSES)('renders the correct label for "%s"', (status) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(STATUS_LABEL[status])).toBeInTheDocument();
  });

  it('renders a span element', () => {
    const { container } = render(<StatusBadge status="applied" />);
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});
