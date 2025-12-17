# @osd/assistant-ui-chatbot

A basic chatbot built with `@assistant-ui/react` v0.11.51 (latest) and React 19.

## Features

- **Latest @assistant-ui/react**: Built with version 0.11.51
- **React 19**: Uses the latest React version
- **Primitive Components**: Uses ThreadPrimitive, ComposerPrimitive, and MessagePrimitive
- **Custom Runtime Provider**: Includes a basic echo adapter that can be customized
- **Vite Bundling**: Fast builds with Vite

## Installation

```bash
cd packages/assistant-ui-chatbot
yarn install
```

## Build

```bash
yarn build
```

## Usage

### Mount the Chatbot

```javascript
import { mount } from '@osd/assistant-ui-chatbot';

const container = document.getElementById('chatbot-container');
const unmount = mount(container);

// To unmount later
unmount();
```

### Use Components Directly

```jsx
import { Chatbot, MyRuntimeProvider, MyAssistant } from '@osd/assistant-ui-chatbot';

// Full chatbot with container
function App() {
  return <Chatbot />;
}

// Or use components separately
function CustomApp() {
  return (
    <MyRuntimeProvider>
      <MyAssistant />
    </MyRuntimeProvider>
  );
}
```

## Customizing the Model Adapter

The `MyRuntimeProvider` component uses a basic echo adapter. To connect to a real AI backend, modify the `MyModelAdapter` in `src/MyRuntimeProvider.tsx`:

```typescript
const MyModelAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }: ChatModelRunOptions) {
    // Your custom implementation here
    // Connect to OpenAI, Anthropic, or any other AI service
    
    yield {
      content: [{ type: 'text', text: 'Response from AI' }],
    };
  },
};
```

## File Structure

```
packages/assistant-ui-chatbot/
├── src/
│   ├── index.ts           # Main entry point with mount function
│   ├── Chatbot.tsx        # Main chatbot component
│   ├── MyAssistant.tsx    # Thread UI component using primitives
│   └── MyRuntimeProvider.tsx  # Runtime provider with model adapter
├── demo.html              # Demo HTML file
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Demo

After building, open `demo.html` in a browser to see the chatbot in action:

```bash
yarn build
# Then open demo.html in browser or use a local server
```

## Dependencies

- `@assistant-ui/react`: ^0.11.51
- `react`: ^19.0.0
- `react-dom`: ^19.0.0
