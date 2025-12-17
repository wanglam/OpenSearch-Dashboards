/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { mount } from 'assistant-ui-chat';

import './assistant_ui_chat_window.scss';

export const AssistantUiChatWindow = () => {
  const ref = React.useRef(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const unmount = mount({ element: ref.current, api: '/api/chat' });
    return () => {
      unmount();
    };
  }, []);

  return <div style={{ height: '100%', padding: 16 }} ref={ref} />;
};
