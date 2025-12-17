/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * Example component showing how to integrate the React 19 chatbot
 * into a React 16 OpenSearch Dashboards plugin
 */

import React, { useEffect, useRef } from 'react';

interface ChatbotContainerProps {
  /** Optional CSS class name */
  className?: string;
}

/**
 * Container component that mounts the React 19 chatbot
 * This component is built with React 16 (platform version)
 * but mounts a React 19 component in an isolated way
 */
export const ChatbotContainer: React.FC<ChatbotContainerProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const unmountRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    // Dynamically import the React 19 chatbot bundle
    // This keeps it isolated from the React 16 platform
    import('@osd/assistant-ui-chatbot')
      .then((module) => {
        if (containerRef.current) {
          // Mount the chatbot and store the unmount function
          unmountRef.current = module.mount(containerRef.current);
          console.log('Chatbot mounted successfully');
        }
      })
      .catch((error) => {
        console.error('Failed to load chatbot:', error);
      });

    // Cleanup function - unmount when component unmounts
    return () => {
      if (unmountRef.current) {
        unmountRef.current();
        unmountRef.current = null;
        console.log('Chatbot unmounted');
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        minHeight: '200px',
      }}
    />
  );
};
