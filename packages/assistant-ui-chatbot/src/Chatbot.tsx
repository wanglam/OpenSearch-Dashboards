import React from 'react';
import { MyRuntimeProvider } from './MyRuntimeProvider';
import { MyAssistant } from './MyAssistant';

export const Chatbot: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '500px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <MyRuntimeProvider>
        <MyAssistant />
      </MyRuntimeProvider>
    </div>
  );
};
