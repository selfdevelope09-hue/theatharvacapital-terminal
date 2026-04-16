import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, CandlestickData, LineStyle } from 'lightweight-charts';
import { KlineData } from '../../services/binance';

interface TradingChartProps {
  klines: KlineData[];
  lastKline: KlineData | null;
  symbol: string;
  interval: string;
  currentPrice: number;
}

export const TradingChart: React.FC<TradingChartProps> = ({ 
  klines, 
  lastKline, 
  symbol, 
  interval, 
  currentPrice 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0a0a0f' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#1a1a2e' },
        horzLines: { color: '#1a1a2e' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: '#4ade80',
          style: LineStyle.Dotted,
        },
        horzLine: {
          width: 1,
          color: '#4ade80',
          style: LineStyle.Dotted,
        },
      },
      rightPriceScale: {
        borderColor: '#1a1a2e',
      },
      timeScale: {
        borderColor: '#1a1a2e',
        timeVisible: true,
        secondsVisible: interval === '1m',
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });

    // Candlestick series
    candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#4ade80',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#4ade80',
      wickDownColor: '#ef4444',
      wickUpColor: '#4ade80',
    });

    // Volume series
    volumeSeriesRef.current = chartRef.current.addHistogramSeries({
      color: '#4ade80',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chartRef.current.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    // Set initial data
    const chartData = klines.map(k => ({
      time: k.time / 1000,
      open: k.open,
      high: k.high,
      low: k.low,
      close: k.close,
    }));

    const volumeData = klines.map(k => ({
      time: k.time / 1000,
      value: k.volume,
      color: k.close >= k.open ? '#4ade8040' : '#ef444440',
    }));

    candlestickSeriesRef.current.setData(chartData);
    volumeSeriesRef.current.setData(volumeData);
    chartRef.current.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [klines, interval]);

  // Update last candle in real-time
  useEffect(() => {
    if (candlestickSeriesRef.current && lastKline) {
      candlestickSeriesRef.current.update({
        time: lastKline.time / 1000,
        open: lastKline.open,
        high: lastKline.high,
        low: lastKline.low,
        close: lastKline.close,
      });

      if (volumeSeriesRef.current) {
        volumeSeriesRef.current.update({
          time: lastKline.time / 1000,
          value: lastKline.volume,
          color: lastKline.close >= lastKline.open ? '#4ade8040' : '#ef444440',
        });
      }
    }
  }, [lastKline]);

  return (
    <div className="relative w-full h-full bg-gray-900">
      <div ref={chartContainerRef} className="w-full h-full" />
      <div className="absolute top-2 left-2 bg-gray-800/90 px-2 py-1 rounded text-xs text-gray-300">
        {symbol} • {interval}
      </div>
    </div>
  );
};
