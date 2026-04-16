// src/components/Chart/indicators.ts

// RSI Calculator
export const calculateRSI = (prices: number[], period: number = 14) => {
  const rsi: { time: number; value: number }[] = [];
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change >= 0) gains += change;
    else losses -= change;
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  let rs = avgGain / avgLoss;
  let rsiValue = 100 - (100 / (1 + rs));
  
  rsi.push({ time: i, value: rsiValue });
  
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change >= 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - change) / period;
    }
    rs = avgGain / avgLoss;
    rsiValue = 100 - (100 / (1 + rs));
    rsi.push({ time: i, value: rsiValue });
  }
  
  return rsi;
};

// MACD Calculator
export const calculateMACD = (prices: number[]) => {
  const ema12: number[] = [];
  const ema26: number[] = [];
  const macd: number[] = [];
  const signal: number[] = [];
  const histogram: number[] = [];
  
  // Calculate EMA 12
  let multiplier12 = 2 / (12 + 1);
  let multiplier26 = 2 / (26 + 1);
  
  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      ema12.push(prices[i]);
      ema26.push(prices[i]);
    } else {
      ema12.push((prices[i] - ema12[i-1]) * multiplier12 + ema12[i-1]);
      ema26.push((prices[i] - ema26[i-1]) * multiplier26 + ema26[i-1]);
    }
    macd.push(ema12[i] - ema26[i]);
  }
  
  // Calculate Signal (EMA 9 of MACD)
  let multiplier9 = 2 / (9 + 1);
  for (let i = 0; i < macd.length; i++) {
    if (i === 0) signal.push(macd[i]);
    else signal.push((macd[i] - signal[i-1]) * multiplier9 + signal[i-1]);
    histogram.push(macd[i] - signal[i]);
  }
  
  return { macd, signal, histogram };
};

// SMA Calculator
export const calculateSMA = (prices: number[], period: number) => {
  const sma: { time: number; value: number }[] = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push({ time: i, value: sum / period });
  }
  
  return sma;
};

// VWAP Calculator
export const calculateVWAP = (klines: any[]) => {
  let cumulativePV = 0;
  let cumulativeVolume = 0;
  const vwap: { time: number; value: number }[] = [];
  
  for (let i = 0; i < klines.length; i++) {
    const typicalPrice = (klines[i].high + klines[i].low + klines[i].close) / 3;
    cumulativePV += typicalPrice * klines[i].volume;
    cumulativeVolume += klines[i].volume;
    vwap.push({ time: klines[i].time / 1000, value: cumulativePV / cumulativeVolume });
  }
  
  return vwap;
};
