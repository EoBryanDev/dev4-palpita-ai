import { LocalDate } from '@/components/ui/local-date';
import * as dateHelpers from '@/helpers/date';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('LocalDate', () => {
  const mockDate = new Date('2026-06-12T16:00:00.000Z');

  beforeEach(() => {
    vi.spyOn(dateHelpers, 'obterFusoHorarioUsuario').mockReturnValue(
      'America/Sao_Paulo',
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve renderizar o formato short por padrão', () => {
    render(<LocalDate date={mockDate} />);
    // Em SP (UTC-3), 2026-06-12T16:00:00Z é 12/06/2026 13:00 (ou similar, dependendo do locale exato do ambiente do vitest)
    // Vamos validar que contém "12/06" e "13:00"
    const content = screen.getByText(/12\/06/);
    expect(content).toBeDefined();
    expect(content.textContent).toContain('13:00');
  });

  it('deve renderizar o formato long', () => {
    render(<LocalDate date={mockDate} format="long" />);
    // "12 de junho, 13:00" ou similar
    const content = screen.getByText(/12 de junho/);
    expect(content).toBeDefined();
    expect(content.textContent).toContain('13:00');
  });

  it('deve renderizar o formato time', () => {
    render(<LocalDate date={mockDate} format="time" />);
    // "13:00"
    expect(screen.getByText('13:00')).toBeDefined();
  });

  it('deve renderizar o formato weekday', () => {
    render(<LocalDate date={mockDate} format="weekday" />);
    // 12 de Junho de 2026 é sexta-feira -> "sex."
    expect(screen.getByText(/sex/i)).toBeDefined();
  });

  it('deve renderizar o formato day-month', () => {
    render(<LocalDate date={mockDate} format="day-month" />);
    // "12 de jun."
    expect(screen.getByText(/12 de/)).toBeDefined();
  });

  it('deve atualizar o fuso horário se o do usuário for diferente de America/Sao_Paulo', () => {
    vi.spyOn(dateHelpers, 'obterFusoHorarioUsuario').mockReturnValue(
      'America/New_York',
    ); // UTC-4
    render(<LocalDate date={mockDate} format="time" />);
    // Em NY (UTC-4), 16:00 UTC é 12:00
    expect(screen.getByText('12:00')).toBeDefined();
  });
});
