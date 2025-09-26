export const QuickAmounts = (minAmount: number | null) => {
  const base = [5, 10, 20, 30, 50, 100];

  if (!minAmount) return base;

  if (!minAmount || minAmount <= 0) {
    return base;
  }

  // Find the first number greater than or equal to minAmount
  const minCeil = Math.ceil(minAmount);
  const validBase = base.filter((amount) => amount >= minCeil);

  // If all base numbers are less than minAmount, generate new even numbers
  if (validBase.length === 0) {
    // Generate 6 evenly spaced numbers starting from minAmount
    const start = Math.ceil(minCeil / 10) * 10; // Round up to the nearest 10
    return Array.from({ length: 6 }, (_, i) => start + i * 10);
  }

  // If there are less than 6 valid numbers, add more evenly spaced numbers
  if (validBase.length < 6) {
    const maxValid = Math.max(...validBase);
    const additional = [];
    let next = maxValid + 10;

    while (validBase.length + additional.length < 6) {
      additional.push(next);
      next += 10;
    }

    return [...validBase, ...additional];
  }

  // If there are more than 6 valid numbers, return the first 6
  return validBase.slice(0, 6);
};
