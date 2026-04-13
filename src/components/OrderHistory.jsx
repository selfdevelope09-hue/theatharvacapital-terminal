import React from 'react';
import './OrderHistory.css';

function OrderHistory({ orders }) {
  return (
    <div className="order-history">
      <div className="section-header">
        <h4>RECENT TRADES</h4>
      </div>
      {orders.length === 0 ? (
        <div className="empty-state">No trades yet</div>
      ) : (
        orders.slice(0, 5).map(order => (
          <div key={order.id} className="order-item">
            <div className="order-header">
              <span className="order-coin">{order.coin.replace('USDT', '')}</span>
              <span className={`order-pnl ${order.pnl >= 0 ? 'positive' : 'negative'}`}>
                {order.pnl >= 0 ? '+' : ''}{order.pnl?.toFixed(2)} USDT
              </span>
            </div>
            <div className="order-details">
              <span>Entry: ${order.entryPrice?.toFixed(2)}</span>
              <span>Exit: ${order.exitPrice?.toFixed(2)}</span>
              <span>{new Date(order.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default OrderHistory;
