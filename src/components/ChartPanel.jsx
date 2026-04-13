import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import axios from 'axios';
import './ChartPanel.css';

function ChartPanel({ selectedCoin, marketData }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const [timeframe, setTimeframe] = useState('1h');
  const [currentPrice, setCurrentPrice] = useState(null);

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1D'];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#000000' },
        textColor: '#888888',
      },
      grid: {
        vertLines: { color: '#111111' },
        horzLines: { color: '#111111' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: '#333333', width: 1, style: 2 },
        horzLine: { color: '#333333', width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: '#1a1a1a',
        textColor: '#888888',
      },
      timeScale: {
        borderColor: '#1a1a1a',
        textColor: '#888888',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00ff88',
      downColor: '#ff3355',
      borderUpColor: '#00ff88',
      borderDownColor: '#ff3355',
      wickUpColor: '#00ff88',
      wickDownColor: '#ff3355',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#333333',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

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
  }, []);

  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

    const fetchKlines = async () => {
      try {
        const response = await axios.get('https://api.binance.com/api/v3/klines', {
          params: {
            symbol: selectedCoin,
            interval: timeframe,
            limit: 200,
          },
        });

        const candleData = response.data.map(kline => ({
          time: kline[0] / 1000,
          open: parseFloat(kline[1]),
          high: parseFloat(kline[2]),
          low: parseFloat(kline[3]),
          close: parseFloat(kline[4]),
        }));

        const volumeData = response.data.map(kline => ({
          time: kline[0] / 1000,
          value: parseFloat(kline[5]),
          color: parseFloat(kline[4]) >= parseFloat(kline[1]) ? '#00ff8820' : '#ff335520',
        }));

        candlestickSeriesRef.current.setData(candleData);
        volumeSeriesRef.current.setData(volumeData);
      } catch (error) {
        console.error('Error fetching klines:', error);
      }
    };

    fetchKlines();
  }, [selectedCoin, timeframe]);

  useEffect(() => {
    if (marketData && marketData[selectedCoin]) {
      setCurrentPrice(marketData[selectedCoin].price);
    }
  }, [marketData, selectedCoin]);

  return (
    <div className="chart-panel">
      <div className="chart-header">
        <div className="coin-title">
          <h1>{selectedCoin.replace('USDT', '')}/USDT</h1>
          <div className="current-price">
            ${currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '—'}
          </div>
          <div className={`change-24h ${marketData[selectedCoin]?.change24h >= 0 ? 'positive' : 'negative'}`}>
            {marketData[selectedCoin]?.change24h >= 0 ? '+' : ''}{marketData[selectedCoin]?.change24h?.toFixed(2) || '0'}%
          </div>
        </div>
        <div className="chart-timeframes">
          {timeframes.map(tf => (
            <button
              key={tf}
              className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-container" ref={chartContainerRef} />
      <div className="chart-footer">
        <span className="indicator-hint">📊 RSI | MACD | EMA | BOLL</span>
        <span className="replay-hint">⏪ Trade Replay Available</span>
      </div>
    </div>
  );
}

export default ChartPanel;
