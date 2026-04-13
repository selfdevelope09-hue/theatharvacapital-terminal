import React from 'react';
import './PositionsList.css';

function PositionsList({ positions, marketData }) {
  return (
    <div className="positions-list">
      <div className="section-header">
        <h4>OPEN POSITIONS</h4>
      </div>
      {positions.length === 0 ? (
        <div className="empty-state">No open positions</div>
      ) : (
        positions.map(pos => {
          const currentPrice = marketData[pos.coin]?.price || pos.entryPrice;
          const pnl = (currentPrice - pos.entryPrice) * pos.amount;
          const pnlPercent = ((currentPrice - pos.entryPrice) / pos.entryPrice) * 100;
          
          return (
            <div key={pos.id} className="position-item">
              <div className="position-header">
                <span className="position-coin">{pos.coin.replace('USDT', '')}</span>
                <span className={`position-pnl ${pnl >= 0 ? 'positive' : 'negative'}`}>
                  {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} USDT ({pnlPercent.toFixed(2)}%)
                </span>
              </div>
              <div className="position-details">
                <span>Entry: ${pos.entryPrice.toFixed(2)}</span>
                <span>Current: ${currentPrice.toFixed(2)}</span>
                <span>Amount: {pos.amount.toFixed(6)}</span>
              </div>
              {pos.stopLoss && (
                <div className="position-sl">SL: ${pos.stopLoss}</div>
              )}
              {pos.takeProfit && (
                <div className="position-tp">TP: ${pos.takeProfit}</div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default PositionsList;
