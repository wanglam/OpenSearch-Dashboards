# Assistant UI Chatbot

A React 19-based chatbot component that can be mounted independently in OpenSearch Dashboards.

## Overview

This package provides a self-contained React 19 chatbot that can be mounted to any DOM element. It's completely isolated from the platform's React 16 instance.

## Installation

```bash
cd packages/assistant-ui-chatbot
yarn install
yarn build
```

## Usage

### In a Plugin

```typescript
import { mount } from '@osd/assistant-ui-chatbot';

// Mount the chatbot to a DOM element
const containerElement = document.getElementById('chatbot-container');
const unmount = mount(containerElement);

// Later, when you need to unmount
unmount();
```

### Example in React 16 Component

```typescript
import React, { useEffect, useRef } from 'react';

export const ChatbotContainer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const unmountRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Dynamically import the React 19 bundle
      import('@osd/assistant-ui-chatbot').then((module) => {
        unmountRef.current = module.mount(containerRef.current!);
      });
    }

    // Cleanup on unmount
    return () => {
      if (unmountRef.current) {
        unmountRef.current();
      }
    };
  }, []);

  return <div ref={containerRef} />;
};
```

## Features

- Built with React 19
- Self-contained bundle (includes React 19)
- Simple mount/unmount API
- Completely isolated from platform React 16
- TypeScript support

## API

### `mount(container: HTMLElement): () => void`

Mounts the chatbot to the specified DOM element.

- **Parameters:**
  - `container`: The DOM element to mount the chatbot to
- **Returns:** An unmount function to remove the chatbot

## Building

```bash
yarn build      # Build production bundle
yarn dev        # Build and watch for changes
```

## Important Notes

1. This package is completely isolated from the platform's React 16
2. Cannot share React context or state with React 16 components
3. Props must be passed via data attributes or events
4. Adds ~45KB (gzipped) to bundle size for React 19
