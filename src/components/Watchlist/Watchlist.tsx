import React, { useState } from 'react';
import { Search, Star, TrendingUp, TrendingDown, Plus } from 'lucide-react';

interface WatchlistProps {
  tickers: Record<string, any>;
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

const defaultWatchlist = [
  { symbol: 'BTCUSDT', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', name: 'Ethereum' },
  { symbol: 'BNBUSDT', name: 'Binance Coin' },
  { symbol: 'SOLUSDT', name: 'Solana' },
  { symbol: 'XRPUSDT', name: 'Ripple' },
  { symbol: 'ADAUSDT', name: 'Cardano' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin' },
  { symbol: 'AVAXUSDT', name: 'Avalanche' }
];

export const Watchlist: React.FC<WatchlistProps> = ({ tickers, selectedSymbol, onSelectSymbol }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWatchlist = defaultWatchlist.filter(item =>
    item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-2">Watchlist</h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search coins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 text-white text-sm pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredWatchlist.map((item) => {
          const ticker = tickers[item.symbol];
          const isSelected = selectedSymbol === item.symbol;
          
          return (
            <div
              key={item.symbol}
              onClick={() => onSelectSymbol(item.symbol)}
              className={`p-3 cursor-pointer transition-all duration-150 hover:bg-gray-700/50 ${
                isSelected ? 'bg-gray-700 border-l-2 border-green-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Star size={14} className="text-gray-500" />
                    <span className="font-medium text-white text-sm">{item.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{item.symbol}</span>
                </div>
                
                {ticker && (
                  <div className="text-right">
                    <div className="text-sm font-mono text-white">
                      ${ticker.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={`text-xs flex items-center justify-end ${ticker.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {ticker.change24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(ticker.change24h).toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add button */}
      <div className="p-3 border-t border-gray-700">
        <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
          <Plus size={16} className="text-green-500" />
          <span className="text-sm text-gray-300">Add to Watchlist</span>
        </button>
      </div>
    </div>
  );
};
