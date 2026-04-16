// src/components/Chart/TradingChart.tsx
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, CandlestickData, LineStyle } from 'lightweight-charts';
import { KlineData } from '../../services/binance';
import { calculateRSI, calculateMACD, calculateSMA, calculateVWAP } from './indicators';
import { Settings, Plus, X, Eye, EyeOff } from 'lucide-react';

interface Indicator {
  id: string;
  name: string;
  type: 'ema' | 'sma' | 'bb' | 'rsi' | 'macd' | 'vwap';
  visible: boolean;
  color: string;
  period?: number;
}

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
  const indicatorSeriesRef = useRef<Record<string, any>>({});
  
  const [showIndicatorPanel, setShowIndicatorPanel] = useState(false);
  const [indicators, setIndicators] = useState<Indicator[]>([
    { id: 'ema20', name: 'EMA 20', type: 'ema', visible: true, color: '#f59e0b', period: 20 },
    { id: 'ema50', name: 'EMA 50', type: 'ema', visible: true, color: '#8b5cf6', period: 50 },
    { id: 'bb', name: 'Bollinger Bands', type: 'bb', visible: true, color: '#06b6d4' },
    { id: 'rsi', name: 'RSI', type: 'rsi', visible: false, color: '#ec489a', period: 14 },
    { id: 'macd', name: 'MACD', type: 'macd', visible: false, color: '#10b981' },
    { id: 'vwap', name: 'VWAP', type: 'vwap', visible: false, color: '#f97316' }
  ]);

  // Calculate indicators
  const calculateIndicatorData = () => {
    const chartData = klines.map(k => ({
      time: k.time / 1000,
      open: k.open,
      high: k.high,
      low: k.low,
      close: k.close,
    }));
    
    const prices = chartData.map(d => d.close);
    const result: Record<string, any> = {};
    
    indicators.forEach(ind => {
      if (!ind.visible) return;
      
      switch(ind.type) {
        case 'ema':
          // EMA calculation
          const period = ind.period || 20;
          const multiplier = 2 / (period + 1);
          const ema: { time: number; value: number }[] = [];
          for (let i = 0; i < chartData.length; i++) {
            if (i === 0) ema.push({ time: chartData[i].time, value: chartData[i].close });
            else {
              const value = (chartData[i].close - ema[i-1].value) * multiplier + ema[i-1].value;
              ema.push({ time: chartData[i].time, value });
            }
          }
          result[ind.id] = ema;
          break;
          
        case 'sma':
          const smaPeriod = ind.period || 20;
          const sma: { time: number; value: number }[] = [];
          for (let i = smaPeriod - 1; i < chartData.length; i++) {
            const sum = prices.slice(i - smaPeriod + 1, i + 1).reduce((a, b) => a + b, 0);
            sma.push({ time: chartData[i].time, value: sum / smaPeriod });
          }
          result[ind.id] = sma;
          break;
          
        case 'rsi':
          const rsiData = calculateRSI(prices, ind.period || 14);
          result[ind.id] = rsiData.map((d, i) => ({ ...d, time: chartData[i].time }));
          break;
          
        case 'vwap':
          result[ind.id] = calculateVWAP(klines);
          break;
      }
    });
    
    return result;
  };

  // Update indicators on chart
  const updateIndicators = () => {
    const indicatorData = calculateIndicatorData();
    
    indicators.forEach(ind => {
      const data = indicatorData[ind.id];
      const series = indicatorSeriesRef.current[ind.id];
      
      if (data && data.length > 0 && ind.visible) {
        if (series) {
          series.setData(data);
          series.applyOptions({ color: ind.color, lineWidth: 1 });
        } else if (chartRef.current) {
          const newSeries = chartRef.current.addLineSeries({
            color: ind.color,
            lineWidth: 1,
            title: ind.name,
          });
          newSeries.setData(data);
          indicatorSeriesRef.current[ind.id] = newSeries;
        }
      } else if (series && !ind.visible) {
        chartRef.current?.removeSeries(series);
        delete indicatorSeriesRef.current[ind.id];
      }
    });
  };

  // Toggle indicator visibility
  const toggleIndicator = (id: string) => {
    setIndicators(prev => prev.map(ind => 
      ind.id === id ? { ...ind, visible: !ind.visible } : ind
    ));
  };

  // Change indicator color
  const changeIndicatorColor = (id: string, color: string) => {
    setIndicators(prev => prev.map(ind => 
      ind.id === id ? { ...ind, color } : ind
    ));
    if (indicatorSeriesRef.current[id]) {
      indicatorSeriesRef.current[id].applyOptions({ color });
    }
  };

  // Main chart setup
  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartRef.current = createChart(chartContainerRef.current, {
      layout: { background: { color: '#0a0a0f' }, textColor: '#d1d5db' },
      grid: { vertLines: { color: '#1a1a2e' }, horzLines: { color: '#1a1a2e' } },
      crosshair: {
        mode: 1,
        vertLine: { width: 1, color: '#4ade80', style: LineStyle.Dotted },
        horzLine: { width: 1, color: '#4ade80', style: LineStyle.Dotted },
      },
      rightPriceScale: { borderColor: '#1a1a2e' },
      timeScale: { borderColor: '#1a1a2e', timeVisible: true },
      width: chartContainerRef.current.clientWidth,
      height: 550,
    });

    candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#4ade80', downColor: '#ef4444',
      borderDownColor: '#ef4444', borderUpColor: '#4ade80',
      wickDownColor: '#ef4444', wickUpColor: '#4ade80',
    });

    volumeSeriesRef.current = chartRef.current.addHistogramSeries({
      color: '#4ade80', priceFormat: { type: 'volume' }, priceScaleId: 'volume',
    });

    chartRef.current.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update chart data
  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

    const chartData = klines.map(k => ({
      time: k.time / 1000,
      open: k.open, high: k.high, low: k.low, close: k.close,
    }));
    const volumeData = klines.map(k => ({
      time: k.time / 1000, value: k.volume,
      color: k.close >= k.open ? '#4ade8040' : '#ef444440',
    }));

    candlestickSeriesRef.current.setData(chartData);
    volumeSeriesRef.current.setData(volumeData);
    chartRef.current?.timeScale().fitContent();
    updateIndicators();
  }, [klines]);

  // Real-time update
  useEffect(() => {
    if (candlestickSeriesRef.current && lastKline) {
      candlestickSeriesRef.current.update({
        time: lastKline.time / 1000,
        open: lastKline.open, high: lastKline.high,
        low: lastKline.low, close: lastKline.close,
      });
      volumeSeriesRef.current.update({
        time: lastKline.time / 1000, value: lastKline.volume,
        color: lastKline.close >= lastKline.open ? '#4ade8040' : '#ef444440',
      });
    }
  }, [lastKline]);

  // Update indicators when visibility/colors change
  useEffect(() => {
    updateIndicators();
  }, [indicators]);

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* Indicator Panel Button */}
      <button
        onClick={() => setShowIndicatorPanel(!showIndicatorPanel)}
        className="absolute top-2 right-2 z-20 bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition"
      >
        <Settings size={18} className="text-green-500" />
      </button>

      {/* Indicator Panel */}
      {showIndicatorPanel && (
        <div className="absolute top-12 right-2 z-20 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          <div className="p-3 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white">Indicators</h3>
            <button onClick={() => setShowIndicatorPanel(false)}>
              <X size={14} className="text-gray-400" />
            </button>
          </div>
          <div className="p-2 max-h-96 overflow-y-auto">
            {indicators.map(ind => (
              <div key={ind.id} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded">
                <div className="flex items-center space-x-2">
                  <button onClick={() => toggleIndicator(ind.id)}>
                    {ind.visible ? <Eye size={14} className="text-green-500" /> : <EyeOff size={14} className="text-gray-500" />}
                  </button>
                  <span className="text-sm text-gray-300">{ind.name}</span>
                </div>
                <input
                  type="color"
                  value={ind.color}
                  onChange={(e) => changeIndicatorColor(ind.id, e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div ref={chartContainerRef} className="w-full h-full" />
      
      {/* Chart Info */}
      <div className="absolute top-2 left-2 bg-gray-800/90 px-2 py-1 rounded text-xs text-gray-300">
        {symbol} • {interval}
      </div>
    </div>
  );
};
