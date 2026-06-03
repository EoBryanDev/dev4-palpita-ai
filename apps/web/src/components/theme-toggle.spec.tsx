import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from './theme-toggle';

// Mock next-themes
const setThemeMock = vi.fn();
let currentTheme = 'light';

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: currentTheme,
    setTheme: (newTheme: string) => {
      currentTheme = newTheme;
      setThemeMock(newTheme);
    },
  }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    setThemeMock.mockClear();
    currentTheme = 'light';
  });

  it('should render the toggle button when mounted', () => {
    // Arrange & Act
    render(<ThemeToggle />);

    // Assert
    const button = screen.getByLabelText('Alternar tema');
    expect(button).toBeDefined();
  });

  it('should call setTheme when toggled from light to dark', () => {
    // Arrange
    render(<ThemeToggle />);
    const button = screen.getByLabelText('Alternar tema');

    // Act
    fireEvent.click(button);

    // Assert
    expect(setThemeMock).toHaveBeenCalledWith('dark');
  });

  it('should call setTheme when toggled from dark to light', () => {
    // Arrange
    currentTheme = 'dark';
    render(<ThemeToggle />);
    const button = screen.getByLabelText('Alternar tema');

    // Act
    fireEvent.click(button);

    // Assert
    expect(setThemeMock).toHaveBeenCalledWith('light');
  });
});
