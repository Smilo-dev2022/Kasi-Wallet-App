export function simulateFXConversion(amountZAR, targetCurrency) {
  const fxRates = {
    ZWL: 36.5,
    BWP: 0.78,
    KES: 7.2
  };

  if (!fxRates[targetCurrency]) throw new Error("Unsupported currency");
  const converted = amountZAR * fxRates[targetCurrency];
  return { amountConverted: converted, rate: fxRates[targetCurrency] };
}
