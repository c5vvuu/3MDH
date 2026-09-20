// Base Currency is SAR (Saudi Riyal - ريال سعودي)
export const BASE_CURRENCY = 'SAR';

export interface CurrencyConfig {
  code: string;
  symbol_ar: string;
  symbol_en: string;
  name_ar: string;
  name_en: string;
  rateFromSAR: number; // 1 SAR = rateFromSAR in target currency
  decimals: number;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  SAR: {
    code: 'SAR',
    symbol_ar: 'ر.س',
    symbol_en: 'SAR',
    name_ar: 'ريال سعودي',
    name_en: 'Saudi Riyal',
    rateFromSAR: 1.0,
    decimals: 2
  },
  USD: {
    code: 'USD',
    symbol_ar: '$',
    symbol_en: '$',
    name_ar: 'دولار أمريكي',
    name_en: 'US Dollar',
    rateFromSAR: 1 / 3.75, // 1 USD = 3.75 SAR => 1 SAR = 0.266667 USD
    decimals: 2
  },
  AED: {
    code: 'AED',
    symbol_ar: 'د.إ',
    symbol_en: 'AED',
    name_ar: 'درهم إماراتي',
    name_en: 'UAE Dirham',
    rateFromSAR: 0.979,
    decimals: 2
  },
  KWD: {
    code: 'KWD',
    symbol_ar: 'د.ك',
    symbol_en: 'KWD',
    name_ar: 'دينار كويتي',
    name_en: 'Kuwaiti Dinar',
    rateFromSAR: 1 / 12.24, // 1 KWD = ~12.24 SAR
    decimals: 3
  },
  JOD: {
    code: 'JOD',
    symbol_ar: 'د.أ',
    symbol_en: 'JOD',
    name_ar: 'دينار أردني',
    name_en: 'Jordanian Dinar',
    rateFromSAR: 1 / 5.29, // 1 JOD = ~5.29 SAR
    decimals: 2
  },
  EGP: {
    code: 'EGP',
    symbol_ar: 'ج.م',
    symbol_en: 'EGP',
    name_ar: 'جنيه مصري',
    name_en: 'Egyptian Pound',
    rateFromSAR: 13.15, // 1 SAR = ~13.15 EGP
    decimals: 2
  }
};

/**
 * Convert an amount given in SAR (base currency) into target currency
 */
export function convertFromSAR(amountInSAR: number, targetCurrency: string): number {
  if (!amountInSAR || isNaN(amountInSAR)) return 0;
  const config = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.SAR;
  return Number((amountInSAR * config.rateFromSAR).toFixed(config.decimals));
}

/**
 * Convert an amount in a specific currency back to SAR (base currency)
 */
export function convertToSAR(amountInCurrency: number, sourceCurrency: string): number {
  if (!amountInCurrency || isNaN(amountInCurrency)) return 0;
  const config = SUPPORTED_CURRENCIES[sourceCurrency] || SUPPORTED_CURRENCIES.SAR;
  return Number((amountInCurrency / config.rateFromSAR).toFixed(2));
}

/**
 * Format an amount originally stored in SAR for display in target currency
 */
export function formatCurrency(
  amountInSAR: number,
  targetCurrency: string = 'SAR',
  isRtl: boolean = true
): { value: string; symbol: string; fullText: string } {
  const config = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.SAR;
  const converted = convertFromSAR(amountInSAR, targetCurrency);
  const formattedNumber = converted.toLocaleString(isRtl ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals
  });
  const symbol = isRtl ? config.symbol_ar : config.symbol_en;

  return {
    value: formattedNumber,
    symbol,
    fullText: `${formattedNumber} ${symbol}`
  };
}

/**
 * Get simple currency symbol
 */
export function getCurrencySymbol(targetCurrency: string, isRtl: boolean = true): string {
  const config = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.SAR;
  return isRtl ? config.symbol_ar : config.symbol_en;
}
