import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Footer } from '@/components/footer';
import packageInfo from '../../../../../package.json';

describe('Footer', () => {
  it('deve renderizar o texto de direitos reservados e a versão correta do projeto', () => {
    render(<Footer />);

    expect(screen.getByText(/Todos os direitos reservados/i)).toBeDefined();
    expect(screen.getByText(`v${packageInfo.version}`)).toBeDefined();
  });
});
