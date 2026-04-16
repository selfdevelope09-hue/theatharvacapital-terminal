import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signInWithGoogle, signOutUser, getUserProfile, UserProfile } from './services/firebase';
import { connectBinanceWebSocket, fetchKlines, KlineData } from './services/binance';
import { TopBar } from './components/Layout/TopBar';
import { Watchlist } from './components/Watchlist/Watchlist';
import { TradingChart } from './components/Chart/TradingChart';

const App: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [selectedInterval, setSelectedInterval] = useState('1m');
  const [tickers, setTickers] = useState<Record<string, any>>({});
  const [klines, setKlines] = useState<KlineData[]>([]);
  const [lastKline, setLastKline] = useState<KlineData | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);

  // Load user profile
  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(setUserProfile);
    }
  }, [user]);

  // Fetch historical klines
  useEffect(() => {
    const loadKlines = async () => {
      const data = await fetchKlines(selectedSymbol, selectedInterval, 500);
      setKlines(data);
    };
    loadKlines();
  }, [selectedSymbol, selectedInterval]);

  // Binance WebSocket for tickers
  useEffect(() => {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'];
    
    const handleTicker = (data: any) => {
      setTickers(prev => ({ ...prev, [data.symbol]: data }));
      if (data.symbol === selectedSymbol) {
        setCurrentPrice(data.price);
      }
    };
    
    const cleanup = connectBinanceWebSocket(symbols, handleTicker);
    return cleanup;
  }, [selectedSymbol]);

  // Real-time kline updates (simulated)
  useEffect(() => {
    const interval = setInterval(() => {
      if (klines.length > 0 && currentPrice > 0) {
        const last = klines[klines.length - 1];
        const newKline: KlineData = {
          ...last,
          time: Date.now(),
          close: currentPrice,
          high: Math.max(last.high, currentPrice),
          low: Math.min(last.low, currentPrice),
        };
        setLastKline(newKline);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [klines, currentPrice]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setUserProfile(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">A</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">TheAtharvaCapital</h1>
            <p className="text-gray-400">Professional Crypto Trading Terminal</p>
          </div>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center space-x-3 text-gray-300 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Real-time Binance Data</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Virtual Trading with $10,000</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Professional Charts & Indicators</span>
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span>Sign in with Google</span>
          </button>

          <p className="text-xs text-gray-500 text-center mt-6">
            Simulation Only • No Real Money • For Educational Purposes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <TopBar userProfile={userProfile} tickers={tickers} onLogout={handleLogout} />
      
      <div className="flex pt-14 h-screen">
        {/* Left Panel - Watchlist */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <Watchlist 
            tickers={tickers}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbol}
          />
        </div>

        {/* Center Panel - Chart */}
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {['1m', '5m', '15m', '1h', '4h', '1d'].map(interval => (
                <button
                  key={interval}
                  onClick={() => setSelectedInterval(interval)}
                  className={`px-3 py-1 text-sm rounded transition ${
                    selectedInterval === interval 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {interval}
                </button>
              ))}
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-white">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-sm ${tickers[selectedSymbol]?.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {tickers[selectedSymbol]?.change24h >= 0 ? '+' : ''}{tickers[selectedSymbol]?.change24h?.toFixed(2)}%
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <TradingChart 
              klines={klines}
              lastKline={lastKline}
              symbol={selectedSymbol}
              interval={selectedInterval}
              currentPrice={currentPrice}
            />
          </div>
        </div>

        {/* Right Panel - Trading (Coming Soon) */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 p-4">
          <div className="text-center text-gray-400 mt-20">
            <p>Trading Panel Coming Soon</p>
            <p className="text-sm mt-2">Buy/Sell orders, Positions, Stop Loss/Take Profit</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
