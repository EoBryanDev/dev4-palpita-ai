import { TimeoutBanner } from '@/components/timeout-banner';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('TimeoutBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render standard countdown when more than 24 hours remain', () => {
    // Arrange: set current time to exactly 5 days before target (June 12, 2026 at 16:00)
    const targetDate = new Date('2026-06-12T16:00:00').getTime();
    const fiveDaysBefore = targetDate - 5 * 24 * 60 * 60 * 1000;
    vi.setSystemTime(new Date(fiveDaysBefore));

    // Act
    render(<TimeoutBanner />);

    // Assert
    expect(screen.getByText(/começa em/i)).toBeDefined();
    // Verify that "05" (days) is displayed
    const daysElement = screen.getByText('05');
    expect(daysElement).toBeDefined();
  });

  it('should render urgent state when less than 24 hours remain', () => {
    // Arrange: set current time to exactly 2 hours before target
    const targetDate = new Date('2026-06-12T16:00:00').getTime();
    const twoHoursBefore = targetDate - 2 * 60 * 60 * 1000;
    vi.setSystemTime(new Date(twoHoursBefore));

    // Act
    render(<TimeoutBanner />);

    // Assert
    // Verify that "02" (hours) is displayed
    const hoursElement = screen.getByText('02');
    expect(hoursElement).toBeDefined();
  });

  it('should render expired state when deadline is reached or passed', () => {
    // Arrange: set current time to after target time
    const targetDate = new Date('2026-06-12T16:00:00').getTime();
    vi.setSystemTime(new Date(targetDate + 1000));

    // Act
    const { container } = render(<TimeoutBanner />);

    // Assert
    expect(container.firstChild).toBeNull();
  });
});
