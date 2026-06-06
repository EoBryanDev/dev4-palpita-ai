/**
 * Formata um valor numérico (armazenado como string float) de acordo com a unidade.
 * @param valor - O valor decimal em formato de string ou número (ex.: "123.44")
 * @param unidade - A unidade (BRL, USD, KG, UN)
 */
export function formatarValorComUnidade(
  valor: string | number,
  unidade: 'BRL' | 'USD' | 'KG' | 'UN' = 'BRL',
): string {
  const numValue = typeof valor === 'string' ? Number.parseFloat(valor) : valor;
  if (Number.isNaN(numValue)) return '';

  switch (unidade) {
    case 'BRL':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(numValue);
    case 'USD':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(numValue);
    case 'KG':
      return `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(numValue)} KG`;
    case 'UN':
      return `${Math.round(numValue)} UN`;
    default:
      return String(valor);
  }
}

/**
 * Converte um valor monetário string (ex: "50.00") para centavos (inteiro) para operações seguras.
 */
export function converterParaCentavos(valor: string): number {
  const parsed = Number.parseFloat(valor);
  if (Number.isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

/**
 * Converte centavos (inteiro) de volta para string float com 2 casas decimais.
 */
export function converterDeCentavos(centavos: number): string {
  return (centavos / 100).toFixed(2);
}
