export interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  amount: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: Date;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  price?: number;
  stopPrice?: number;
  amount: number;
  filled: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  createdAt: Date;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  virtualBalance: number;
  totalPnL: number;
  totalTrades: number;
  winningTrades: number;
}
