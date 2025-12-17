import React from 'react';
import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
} from '@assistant-ui/react';

export const MyAssistant: React.FC = () => {
  return (
    <ThreadPrimitive.Root
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff',
      }}
    >
      <ThreadPrimitive.Viewport
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
        }}
      >
        <ThreadPrimitive.Empty>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#6b7280',
              fontSize: '14px',
            }}
          >
            Start a conversation...
          </div>
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            AssistantMessage: AssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      <div
        style={{
          borderTop: '1px solid #e5e7eb',
          padding: '16px',
          backgroundColor: '#f9fafb',
        }}
      >
        <ComposerPrimitive.Root
          style={{
            display: 'flex',
            gap: '8px',
          }}
        >
          <ComposerPrimitive.Input
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <ComposerPrimitive.Send
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Send
          </ComposerPrimitive.Send>
        </ComposerPrimitive.Root>
      </div>
    </ThreadPrimitive.Root>
  );
};

const UserMessage: React.FC = () => {
  return (
    <MessagePrimitive.Root
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          padding: '10px 14px',
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '12px 12px 2px 12px',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
      >
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantMessage: React.FC = () => {
  return (
    <MessagePrimitive.Root
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          padding: '10px 14px',
          backgroundColor: '#f3f4f6',
          color: '#1f2937',
          borderRadius: '12px 12px 12px 2px',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
      >
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
};
