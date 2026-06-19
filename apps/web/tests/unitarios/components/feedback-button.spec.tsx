import { FeedbackButton } from '@/components/feedback/feedback-button';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('FeedbackButton', () => {
  it('deve renderizar o link com texto e ícone', () => {
    render(<FeedbackButton />);

    const link = screen.getByRole('link', { name: /palpita a feature/i });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/feedback');
  });
});
