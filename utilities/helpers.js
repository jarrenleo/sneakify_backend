import { locales, currencies } from "./settings.js";

/**
 * Filters the size string to remove the alphabetical characters at the end if present (e.g. '5.5Y').
 * @param {string} size - The size string that may contain a trailing alphabetic character.
 * @returns {string} The filtered size string without the trailing alphabetic character.
 */
export function filterSize(size) {
  const hasAlphabet = /[A-Za-z]/.test(size);

  if (!hasAlphabet) return size;
  return size.slice(0, -1);
}

/**
 * Formats the given price according to the given country's currency format.
 * @param {number} price - The numerical price to format.
 * @param {string} country - The country code used to determine the locale and currency formatting.
 * @returns {string} The price formatted as a string in the given country's currency. Returns a dash if the price is falsy.
 */
export function formatPrice(price, country) {
  if (!price) return "-";

  const locale = locales[country];
  const currency = currencies[country];

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}
