import React from 'react';
import { Wallet, TrendingUp, TrendingDown, User, LogOut, Bell, Settings, Activity } from 'lucide-react';
import { UserProfile } from '../../services/firebase';

interface TopBarProps {
  userProfile: UserProfile | null;
  tickers: Record<string, any>;
  onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ userProfile, tickers, onLogout }) => {
  const totalValue = userProfile?.virtualBalance || 0;
  const totalPnL = userProfile?.totalPnL || 0;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-700 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                TheAtharvaCapital
              </h1>
              <p className="text-xs text-gray-500">Trading Terminal</p>
            </div>
          </div>
        </div>

        {/* Market Summary */}
        <div className="flex items-center space-x-4">
          {Object.entries(tickers).slice(0, 3).map(([symbol, data]: [string, any]) => (
            <div key={symbol} className="flex items-center space-x-2 px-3 py-1 bg-gray-800 rounded-lg">
              <span className="text-sm font-medium text-gray-300">{symbol.replace('USDT', '')}</span>
              <span className="text-sm font-mono text-white">${data.price?.toLocaleString()}</span>
              <span className={`text-xs flex items-center ${data.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {data.change24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(data.change24h).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>

        {/* Portfolio */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 px-3 py-1 bg-gray-800 rounded-lg">
            <Wallet size={16} className="text-green-500" />
            <div>
              <p className="text-xs text-gray-400">Virtual Balance</p>
              <p className="text-sm font-bold text-white">${totalValue.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 px-3 py-1 bg-gray-800 rounded-lg">
            <Activity size={16} className={totalPnL >= 0 ? 'text-green-500' : 'text-red-500'} />
            <div>
              <p className="text-xs text-gray-400">Total P&L</p>
              <p className={`text-sm font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${totalPnL.toLocaleString()}
              </p>
            </div>
          </div>

          <button className="p-2 hover:bg-gray-800 rounded-lg transition">
            <Bell size={18} className="text-gray-400" />
          </button>
          
          <button className="p-2 hover:bg-gray-800 rounded-lg transition">
            <Settings size={18} className="text-gray-400" />
          </button>

          <div className="relative group">
            <button className="flex items-center space-x-2 px-3 py-1 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="User" className="w-6 h-6 rounded-full" />
              ) : (
                <User size={18} className="text-gray-400" />
              )}
              <span className="text-sm text-gray-300">{userProfile?.displayName?.split(' ')[0]}</span>
            </button>
            
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 hidden group-hover:block">
              <button 
                onClick={onLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 rounded-lg flex items-center space-x-2"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
