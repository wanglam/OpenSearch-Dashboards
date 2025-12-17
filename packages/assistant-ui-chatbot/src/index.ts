import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Chatbot } from './Chatbot';

/**
 * Mount the Assistant UI Chatbot to a DOM element
 * @param container - The DOM element to mount the chatbot to
 * @returns An unmount function to remove the chatbot
 */
export function mount(container: HTMLElement): () => void {
  console.log('Mounting Assistant UI Chatbot (React 19) with @assistant-ui/react v0.11.51');

  // Create a root for React 19
  const root: Root = createRoot(container);

  // Render the chatbot component
  root.render(React.createElement(Chatbot));

  // Return the unmount function
  return () => {
    console.log('Unmounting Assistant UI Chatbot (React 19)');
    root.unmount();
  };
}

// Export the chatbot components for direct use
export { Chatbot } from './Chatbot';
export { MyAssistant } from './MyAssistant';
export { MyRuntimeProvider } from './MyRuntimeProvider';

// Export types for TypeScript users
export type { Root } from 'react-dom/client';
