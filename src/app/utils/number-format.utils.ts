/**
 * Funciones puras de formato/parseo numérico.
 * Display:  1.234,56  (punto miles, coma decimal)
 * Modelo:   1234.56   (número puro sin formato)
 *
 * Regla de parseo:
 *   - Solo comas  → todas son decimales
 *   - Solo puntos → todos son miles
 *   - Mixto       → el último separador (de cualquier tipo) es decimal; los anteriores son miles
 */

export const DEFAULT_DECIMALS = 2;

function addThousandsDots(intStr: string): string {
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseNumber(raw: string | number): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return raw;

  const input = raw.trim();
  if (!input) return null;

  const negative = input.startsWith('-');
  const abs = negative ? input.substring(1) : input;

  const hasDot = abs.includes('.');
  const hasComma = abs.includes(',');

  let intPart: string;
  let decPart = '';

  if (hasDot && hasComma) {
    const lastSepIdx = Math.max(abs.lastIndexOf('.'), abs.lastIndexOf(','));
    intPart = abs.substring(0, lastSepIdx).replace(/[.,]/g, '').replace(/\D/g, '');
    decPart = abs
      .substring(lastSepIdx + 1)
      .replace(/\D/g, '')
      .substring(0, DEFAULT_DECIMALS);
  } else if (hasComma) {
    intPart = abs.substring(0, abs.lastIndexOf(',')).replace(/\D/g, '');
    decPart = abs
      .substring(abs.lastIndexOf(',') + 1)
      .replace(/\D/g, '')
      .substring(0, DEFAULT_DECIMALS);
  } else if (hasDot) {
    intPart = abs.replace(/\./g, '').replace(/\D/g, '');
  } else {
    intPart = abs.replace(/\D/g, '');
  }

  if (!intPart) return null;

  const cleaned = decPart ? intPart + '.' + decPart : intPart;
  const parsed = parseFloat((negative ? '-' : '') + cleaned);
  return isNaN(parsed) ? null : parsed;
}

export function formatNumber(
  value: number | string | null | undefined,
  decimals: number = DEFAULT_DECIMALS,
  forceDecimals: boolean = false,
): string {
  if (value === null || value === undefined || value === '') return '';

  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';

  const [intPart, decPart] = num.toFixed(decimals).split('.');

  const formattedInt = addThousandsDots(intPart);

  if (decimals > 0 && decPart) {
    return formattedInt + ',' + decPart;
  }

  if (decimals > 0 && forceDecimals) {
    return formattedInt + ',' + '0'.repeat(decimals);
  }

  return formattedInt;
}

/** Formatea en tiempo real mientras el usuario escribe. Respeta la cantidad de decimales tecleados. */
export function formatRawInput(raw: string): string {
  if (!raw) return '';

  const trimmed = raw.trim();
  const negative = trimmed.startsWith('-');
  const abs = negative ? trimmed.substring(1) : trimmed;

  const hasDot = abs.includes('.');
  const hasComma = abs.includes(',');

  let intDigits: string;
  let decDigits = '';
  let hasDecimal = false;

  if (hasDot && hasComma) {
    const lastSepIdx = Math.max(abs.lastIndexOf('.'), abs.lastIndexOf(','));
    intDigits = abs.substring(0, lastSepIdx).replace(/[.,]/g, '').replace(/\D/g, '');
    decDigits = abs
      .substring(lastSepIdx + 1)
      .replace(/\D/g, '')
      .substring(0, DEFAULT_DECIMALS);
    hasDecimal = true;
  } else if (hasComma) {
    intDigits = abs.substring(0, abs.lastIndexOf(',')).replace(/\D/g, '');
    decDigits = abs
      .substring(abs.lastIndexOf(',') + 1)
      .replace(/\D/g, '')
      .substring(0, DEFAULT_DECIMALS);
    hasDecimal = true;
  } else if (hasDot) {
    intDigits = abs.replace(/\./g, '').replace(/\D/g, '');

    if (abs.endsWith('.') && intDigits.length > 0) {
      hasDecimal = true;
    }
  } else {
    intDigits = abs.replace(/\D/g, '');
  }

  const prefix = negative ? '-' : '';

  if (!intDigits) {
    if (hasDecimal) return prefix + '0,';
    return negative ? '-' : '';
  }

  const formattedInt = addThousandsDots(intDigits);

  if (hasDecimal && decDigits.length > 0) {
    return prefix + formattedInt + ',' + decDigits;
  }

  if (hasDecimal) {
    return prefix + formattedInt + ',';
  }

  return prefix + formattedInt;
}
