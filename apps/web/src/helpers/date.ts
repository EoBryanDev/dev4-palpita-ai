const TIME_ZONE = 'America/Sao_Paulo';

/**
 * Detecta o fuso horário do navegador se estiver no cliente, caso contrário usa America/Sao_Paulo.
 */
export function obterFusoHorarioUsuario(): string {
  if (typeof window !== 'undefined' && window.Intl) {
    return window.Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return TIME_ZONE;
}

/**
 * Converte uma data local inserida (sem fuso horário apontado) assumindo que o usuário está no horário de Brasília (GMT-3)
 * para salvar no banco em GMT 0 (UTC).
 */
export function converterParaUTC(dataLocalString: string): Date {
  // datetime-local retorna "YYYY-MM-DDTHH:MM"
  const isoWithOffset = `${dataLocalString}:00-03:00`;
  return new Date(isoWithOffset);
}

/**
 * Obtém a data no fuso de Brasília no formato YYYY-MM-DD (usando fr-CA como localidade para padronizar o separador hífen)
 */
export function obterDataSaoPauloISO(date: Date, timeZone: string = TIME_ZONE): string {
  return new Intl.DateTimeFormat('fr-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Formata a data para Dia e Mês abreviado (ex: "12 de jun.")
 */
export function formatToBRLDayMonth(date: Date, timeZone: string = TIME_ZONE): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    day: 'numeric',
    month: 'short',
  }).format(date);
}

/**
 * Obtém o dia da semana abreviado (ex: "sex.")
 */
export function formatToBRLWeekday(date: Date, timeZone: string = TIME_ZONE): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    weekday: 'short',
  }).format(date);
}

/**
 * Formata a hora e minuto (ex: "16:00")
 */
export function formatToBRLTime(date: Date, timeZone: string = TIME_ZONE): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formata a data e hora curta (ex: "12/06 16:00")
 */
export function formatToBRLDateTimeShort(date: Date, timeZone: string = TIME_ZONE): string {
  return date.toLocaleString('pt-BR', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formata a data longa com hora (ex: "12 de junho, 16:00")
 */
export function formatToBRLDateTimeLong(date: Date, timeZone: string = TIME_ZONE): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
