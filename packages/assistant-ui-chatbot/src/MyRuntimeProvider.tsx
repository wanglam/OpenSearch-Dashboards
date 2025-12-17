import React, { type ReactNode } from 'react';
import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import type { ChatModelAdapter, ChatModelRunOptions } from '@assistant-ui/react';

const MyModelAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }: ChatModelRunOptions) {
    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    const userMessage =
      lastMessage?.role === 'user'
        ? lastMessage.content
            .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
            .map((part) => part.text)
            .join(' ')
        : '';

    // Simulate a simple echo response
    const responseText = `You said: "${userMessage}"\n\nThis is a basic chatbot response built with @assistant-ui/react v0.11.51. You can customize this adapter to connect to any AI backend service.`;

    // Simulate streaming by yielding the response
    yield {
      content: [{ type: 'text' as const, text: responseText }],
    };
  },
};

interface MyRuntimeProviderProps {
  children: ReactNode;
}

export function MyRuntimeProvider({ children }: MyRuntimeProviderProps) {
  const runtime = useLocalRuntime(MyModelAdapter);

  return <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>;
}
