import React, { useState, useEffect } from 'react';
import './App.css';
import TopBar from './components/TopBar';
import Watchlist from './components/Watchlist';
import ChartPanel from './components/ChartPanel';
import TradingPanel from './components/TradingPanel';
import StatusBar from './components/StatusBar';

function App() {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT');
  const [virtualBalance, setVirtualBalance] = useState(10000);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [tradeHistory, setTradeHistory] = useState([]);

  return (
    <div className="app">
      <TopBar 
        virtualBalance={virtualBalance} 
        marketData={marketData}
        positions={positions}
      />
      <div className="main-layout">
        <Watchlist 
          onSelectCoin={setSelectedCoin} 
          selectedCoin={selectedCoin}
          setMarketData={setMarketData}
        />
        <ChartPanel 
          selectedCoin={selectedCoin} 
          marketData={marketData}
        />
        <TradingPanel 
          selectedCoin={selectedCoin}
          virtualBalance={virtualBalance}
          setVirtualBalance={setVirtualBalance}
          positions={positions}
          setPositions={setPositions}
          orders={orders}
          setOrders={setOrders}
          marketData={marketData}
          tradeHistory={tradeHistory}
          setTradeHistory={setTradeHistory}
        />
      </div>
      <StatusBar orders={orders} />
    </div>
  );
}

export default App;
