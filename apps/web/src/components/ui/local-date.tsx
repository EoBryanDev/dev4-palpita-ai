'use client';

import {
  formatToBRLDateTimeLong,
  formatToBRLDateTimeShort,
  formatToBRLDayMonth,
  formatToBRLTime,
  formatToBRLWeekday,
  obterFusoHorarioUsuario,
} from '@/helpers/date';
import React, { useEffect, useState } from 'react';

interface ILocalDateProps {
  date: Date | string;
  format?: 'short' | 'long' | 'time' | 'weekday' | 'day-month';
  className?: string;
}

export function LocalDate({
  date,
  format = 'short',
  className,
}: ILocalDateProps) {
  const d = typeof date === 'string' ? new Date(date) : date;

  // Função auxiliar de formatação com base no formato escolhido e fuso horário
  const formatFn = (targetDate: Date, tz?: string) => {
    switch (format) {
      case 'day-month':
        return formatToBRLDayMonth(targetDate, tz);
      case 'weekday':
        return formatToBRLWeekday(targetDate, tz);
      case 'time':
        return formatToBRLTime(targetDate, tz);
      case 'long':
        return formatToBRLDateTimeLong(targetDate, tz);
      default:
        return formatToBRLDateTimeShort(targetDate, tz);
    }
  };

  // Pré-renderiza no servidor usando fuso horário padrão de Brasília (America/Sao_Paulo)
  const [formattedDate, setFormattedDate] = useState(() => formatFn(d));

  // biome-ignore lint/correctness/useExhaustiveDependencies: formatFn depends on format, and d/format are the correct triggers
  useEffect(() => {
    const fusoReal = obterFusoHorarioUsuario();
    if (fusoReal !== 'America/Sao_Paulo') {
      setFormattedDate(formatFn(d, fusoReal));
    }
  }, [d, format]);

  return <span className={className}>{formattedDate}</span>;
}
