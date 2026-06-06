const TIME_ZONE = 'America/Sao_Paulo';

/**
 * Obtém a data no fuso de Brasília no formato YYYY-MM-DD (usando fr-CA como localidade para padronizar o separador hífen)
 */
export function obterDataSaoPauloISO(date: Date): string {
  return new Intl.DateTimeFormat('fr-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Formata a data para Dia e Mês abreviado (ex: "12 de jun.")
 */
export function formatToBRLDayMonth(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'short',
  }).format(date);
}

/**
 * Obtém o dia da semana abreviado (ex: "sex.")
 */
export function formatToBRLWeekday(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIME_ZONE,
    weekday: 'short',
  }).format(date);
}

/**
 * Formata a hora e minuto (ex: "16:00")
 */
export function formatToBRLTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formata a data e hora curta (ex: "12/06 16:00")
 */
export function formatToBRLDateTimeShort(date: Date): string {
  return date.toLocaleString('pt-BR', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formata a data longa com hora (ex: "12 de junho, 16:00")
 */
export function formatToBRLDateTimeLong(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
