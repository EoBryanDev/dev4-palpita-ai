import { PageHeader } from '@/components/ui/page-header';
import { render, screen } from '@testing-library/react';
import { Calendar } from 'lucide-react';
import { describe, expect, it } from 'vitest';

describe('PageHeader', () => {
  it('deve renderizar o titulo e a descricao corretamente', () => {
    render(
      <PageHeader
        title="Painel Administrativo"
        description="Gerenciamento de rodadas e apostas."
      />,
    );

    expect(screen.getByText('Painel Administrativo')).toBeDefined();
    expect(
      screen.getByText('Gerenciamento de rodadas e apostas.'),
    ).toBeDefined();
  });

  it('deve renderizar o badge e o icone quando fornecidos', () => {
    const { container } = render(
      <PageHeader
        title="Partidas"
        description="Jogos cadastrados."
        badgeText="Fase de Grupos"
        icon={Calendar}
      />,
    );

    expect(screen.getByText('Fase de Grupos')).toBeDefined();
    // Verifica se o svg do icone Calendar está presente
    const svgElement = container.querySelector('svg');
    expect(svgElement).not.toBeNull();
  });

  it('nao deve renderizar o badge quando badgeText nao for informado', () => {
    const { container } = render(
      <PageHeader title="Partidas" description="Jogos cadastrados." />,
    );

    // Sem badge, nao deve ter o container do badge
    const badgeContainer = container.querySelector('.bg-emerald-500\\/5');
    expect(badgeContainer).toBeNull();
  });
});
