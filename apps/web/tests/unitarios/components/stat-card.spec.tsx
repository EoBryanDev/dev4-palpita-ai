import { StatCard } from '@/components/ui/stat-card';
import { render, screen } from '@testing-library/react';
import { Users } from 'lucide-react';
import { describe, expect, it } from 'vitest';

describe('StatCard', () => {
  it('deve renderizar o titulo, valor e icone corretamente', () => {
    const { container } = render(
      <StatCard
        title="Usuários Ativos"
        value={15}
        icon={Users}
        color="emerald"
      />,
    );

    expect(screen.getByText('Usuários Ativos')).toBeDefined();
    expect(screen.getByText('15')).toBeDefined();

    // Verifica se renderizou o ícone
    const svgElement = container.querySelector('svg');
    expect(svgElement).not.toBeNull();
  });

  it('deve aplicar as classes corretas de acordo com a cor informada', () => {
    const { container } = render(
      <StatCard title="Pendentes" value={3} icon={Users} color="amber" />,
    );

    // Para color="amber", a classe correspondente ao background do icone deve ser "bg-amber-100" ou similar
    const iconContainer = container.querySelector('.bg-amber-100');
    expect(iconContainer).not.toBeNull();
  });

  it('deve usar azul (blue) como cor padrao', () => {
    const { container } = render(
      <StatCard title="Total" value={20} icon={Users} />,
    );

    // Para cor padrao (blue), deve ter a classe "bg-blue-100"
    const iconContainer = container.querySelector('.bg-blue-100');
    expect(iconContainer).not.toBeNull();
  });
});
