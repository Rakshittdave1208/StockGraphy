const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatInr(value: number | undefined): string {
  return INR_FORMATTER.format(value ?? 0);
}

export function formatSignedInr(value: number | undefined): string {
  const amount = value ?? 0;

  if (amount > 0) {
    return `+${formatInr(amount)}`;
  }

  if (amount < 0) {
    return `-${formatInr(Math.abs(amount))}`;
  }

  return formatInr(0);
}
