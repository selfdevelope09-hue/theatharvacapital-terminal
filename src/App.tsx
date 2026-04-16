import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signInWithGoogle, signOutUser, getUserProfile, UserProfile } from './services/firebase';

// Components
import TopBar from './components/Layout/TopBar';
import Watchlist from './components/Watchlist/Watchlist';
import TradingChart from './components/Chart/TradingChart';
import OrderPanel from './components/Trading/OrderPanel';
import PositionsList from './components/Trading/PositionsList';

function App() {
  const [user, loading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [tickers, setTickers] = useState({});
  const [klines, setKlines] = useState([]);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(setUserProfile);
    }
  }, [user]);

  // Binance WebSocket for real-time prices
  useEffect(() => {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'];
    
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${symbols.map(s => `${s.toLowerCase()}@ticker`).join('/')}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.data) {
        const ticker = {
          symbol: data.data.s,
          price: parseFloat(data.data.c),
          change24h: parseFloat(data.data.P),
          volume: parseFloat(data.data.v),
          high: parseFloat(data.data.h),
          low: parseFloat(data.data.l),
        };
        setTickers(prev => ({ ...prev, [ticker.symbol]: ticker }));
        if (ticker.symbol === selectedSymbol) {
          setCurrentPrice(ticker.price);
        }
      }
    };
    
    return () => ws.close();
  }, [selectedSymbol]);

  // Fetch historical klines
  useEffect(() => {
    const fetchKlines = async () => {
      const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${selectedSymbol}&interval=1m&limit=100`);
      const data = await response.json();
      const formattedKlines = data.map(k => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));
      setKlines(formattedKlines);
    };
    fetchKlines();
  }, [selectedSymbol]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setUserProfile(null);
    } catch (error) {
      console.error(error);
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
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
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
                <button key={interval} className="px-3 py-1 text-sm rounded bg-gray-700 text-gray-300 hover:bg-gray-600">
                  {interval}
                </button>
              ))}
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-white">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-sm ${tickers[selectedSymbol]?.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {tickers[selectedSymbol]?.change24h >= 0 ? '+' : ''}{tickers[selectedSymbol]?.change24h?.toFixed(2)}%
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <TradingChart klines={klines} symbol={selectedSymbol} />
          </div>
        </div>

        {/* Right Panel - Trading */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 overflow-y-auto">
          <OrderPanel 
            symbol={selectedSymbol}
            currentPrice={currentPrice}
            userProfile={userProfile}
            onOrderExecuted={() => {}}
          />
          <PositionsList positions={positions} />
        </div>
      </div>
    </div>
  );
}

export default App;
