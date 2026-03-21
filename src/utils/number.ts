const SUFFIXES = ['', 'k', 'M', 'B', 'T'];

export function formatCompactNumber(value: number): string {
  const tier = Math.floor(Math.log10(Math.abs(value)) / 3);

  if (tier <= 0) return value.toString();

  const suffix = SUFFIXES[tier] ?? `e${tier * 3}`;
  const scaled = value / 10 ** (tier * 3);

  return `${+scaled.toFixed(1)}${suffix}`;
}
