import { locales, currencies } from "./settings.js";

export function filterSize(size) {
  const hasAlphabet = /[A-Za-z]/.test(size);

  if (!hasAlphabet) return size;
  return size.slice(0, -1);
}

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
