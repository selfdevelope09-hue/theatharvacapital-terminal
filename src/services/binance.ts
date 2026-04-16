export interface BinanceTicker {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high24h: number;
  low24h: number;
  bidPrice: number;
  askPrice: number;
}

export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// WebSocket connections
let ws: WebSocket | null = null;
let tickerCallbacks: ((data: any) => void)[] = [];

export const connectBinanceWebSocket = (symbols: string[], callback: (data: any) => void) => {
  const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
  const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;
  
  tickerCallbacks.push(callback);
  
  if (ws) {
    ws.close();
  }
  
  ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('Binance WebSocket connected');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.data) {
      const ticker = {
        symbol: data.data.s,
        price: parseFloat(data.data.c),
        change24h: parseFloat(data.data.P),
        volume: parseFloat(data.data.v),
        high24h: parseFloat(data.data.h),
        low24h: parseFloat(data.data.l),
        bidPrice: parseFloat(data.data.b),
        askPrice: parseFloat(data.data.a)
      };
      tickerCallbacks.forEach(cb => cb(ticker));
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected, reconnecting in 5 seconds...');
    setTimeout(() => connectBinanceWebSocket(symbols, callback), 5000);
  };
  
  return () => {
    if (ws) {
      ws.close();
      ws = null;
    }
  };
};

export const fetchKlines = async (symbol: string, interval: string, limit: number = 500): Promise<KlineData[]> => {
  const response = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`
  );
  const data = await response.json();
  
  return data.map((kline: any[]) => ({
    time: kline[0],
    open: parseFloat(kline[1]),
    high: parseFloat(kline[2]),
    low: parseFloat(kline[3]),
    close: parseFloat(kline[4]),
    volume: parseFloat(kline[5])
  }));
};

export const fetch24hrTicker = async (symbol: string) => {
  const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}`);
  const data = await response.json();
  return {
    symbol: data.symbol,
    price: parseFloat(data.lastPrice),
    change24h: parseFloat(data.priceChangePercent),
    volume: parseFloat(data.volume),
    high24h: parseFloat(data.highPrice),
    low24h: parseFloat(data.lowPrice),
    bidPrice: parseFloat(data.bidPrice),
    askPrice: parseFloat(data.askPrice)
  };
};
