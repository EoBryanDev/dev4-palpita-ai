import { ScrollToTop } from '@/components/scroll-to-top';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ScrollToTop', () => {
  beforeEach(() => {
    // Reset page scroll position and mocks
    window.scrollY = 0;
    vi.stubGlobal('scrollTo', vi.fn());
  });

  it('should not be visible initially when scroll position is 0', () => {
    // Arrange & Act
    render(<ScrollToTop />);

    // Assert
    const button = screen.queryByLabelText('Voltar ao topo');
    expect(button).toBeNull();
  });

  it('should become visible after scrolling past 300px', () => {
    // Arrange
    render(<ScrollToTop />);

    // Act
    window.scrollY = 301;
    fireEvent.scroll(window);

    // Assert
    const button = screen.getByLabelText('Voltar ao topo');
    expect(button).toBeInTheDocument();
  });

  it('should call window.scrollTo when clicked', () => {
    // Arrange
    render(<ScrollToTop />);
    window.scrollY = 350;
    fireEvent.scroll(window);

    const button = screen.getByLabelText('Voltar ao topo');

    // Act
    fireEvent.click(button);

    // Assert
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('should hide again if user scrolls back up below 300px', () => {
    // Arrange
    render(<ScrollToTop />);
    window.scrollY = 350;
    fireEvent.scroll(window);
    expect(screen.getByLabelText('Voltar ao topo')).toBeInTheDocument();

    // Act
    window.scrollY = 150;
    fireEvent.scroll(window);

    // Assert
    const button = screen.queryByLabelText('Voltar ao topo');
    expect(button).toBeNull();
  });
});
