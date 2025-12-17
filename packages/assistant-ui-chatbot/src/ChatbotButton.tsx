import React, { useState } from 'react';

export const ChatbotButton: React.FC = () => {
  const [count, setCount] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);

  const handleClick = () => {
    const newCount = count + 1;
    setCount(newCount);
    setMessages((prev) => [...prev, `Button clicked ${newCount} times!`]);
    console.log('Assistant UI Chatbot button clicked:', newCount);
  };

  const handleReset = () => {
    setCount(0);
    setMessages([]);
    console.log('Assistant UI Chatbot reset');
  };

  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid #0066cc',
        borderRadius: '8px',
        backgroundColor: '#f0f8ff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h3 style={{ margin: '0 0 15px 0', color: '#0066cc' }}>Assistant UI Chatbot (React 19)</h3>

      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={handleClick}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          Click Me! (Count: {count})
        </button>

        <button
          onClick={handleReset}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      {messages.length > 0 && (
        <div
          style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: 'white',
            borderRadius: '5px',
            maxHeight: '150px',
            overflowY: 'auto',
          }}
        >
          <strong>Messages:</strong>
          {messages.map((msg, index) => (
            <div key={index} style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
              {msg}
            </div>
          ))}
        </div>
      )}

      <p style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        ✨ This component is built with React 19 and bundled independently
      </p>
    </div>
  );
};
