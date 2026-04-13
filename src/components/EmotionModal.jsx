import React, { useState } from 'react';
import './EmotionModal.css';

function EmotionModal({ onClose, trade }) {
  const [selectedEmotion, setSelectedEmotion] = useState(null);

  const emotions = [
    { id: 'fear', name: '😨 Fear', color: '#666' },
    { id: 'greed', name: '🤑 Greed', color: '#ffaa00' },
    { id: 'fomo', name: '😍 FOMO', color: '#ff6600' },
    { id: 'revenge', name: '😤 Revenge', color: '#ff3355' },
    { id: 'confident', name: '😎 Confident', color: '#00ff88' },
    { id: 'calm', name: '😌 Calm', color: '#00aaff' },
  ];

  const handleSubmit = () => {
    if (selectedEmotion) {
      // Save to localStorage for analytics
      const emotions = JSON.parse(localStorage.getItem('emotionTracking') || '[]');
      emotions.push({
        tradeId: trade?.id,
        emotion: selectedEmotion,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('emotionTracking', JSON.stringify(emotions));
    }
    onClose();
  };

  return (
    <div className="emotion-modal-overlay">
      <div className="emotion-modal">
        <div className="emotion-modal-header">
          <h3>🤔 How did you feel?</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="emotion-buttons">
          {emotions.map(emotion => (
            <button
              key={emotion.id}
              className={`emotion-btn ${selectedEmotion === emotion.id ? 'selected' : ''}`}
              onClick={() => setSelectedEmotion(emotion.id)}
              style={{ '--emotion-color': emotion.color }}
            >
              {emotion.name}
            </button>
          ))}
        </div>
        <button className="submit-btn" onClick={handleSubmit}>
          Continue Trading
        </button>
        <div className="emotion-footer">
          <span>Track your emotions to improve trading discipline</span>
        </div>
      </div>
    </div>
  );
}

export default EmotionModal;
