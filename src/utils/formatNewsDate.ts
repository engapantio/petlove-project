const pad2 = (n: number): string => String(n).padStart(2, '0');

/**
 * Convert backend date strings (e.g. ISO) to deterministic dd/mm/yyyy.
 * Falls back to the original input if it cannot be parsed.
 */
export const formatNewsDate = (input: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(input);
  if (!m) return input;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return input;
  if (month < 1 || month > 12) return input;
  if (day < 1 || day > 31) return input;

  return `${pad2(day)}/${pad2(month)}/${year}`;
};

