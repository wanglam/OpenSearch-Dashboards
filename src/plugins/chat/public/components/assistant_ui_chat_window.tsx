/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { mount } from 'assistant-ui-chat';

import { useOpenSearchDashboards } from '../../../opensearch_dashboards_react/public';

import './assistant_ui_chat_window.scss';

export const AssistantUiChatWindow = () => {
  const { services } = useOpenSearchDashboards();
  const ref = React.useRef(null);

  useEffect(() => {
    if (!ref.current || !services.core.workspaces?.currentWorkspaceId$) {
      return;
    }
    const currentWorkspaceId = services.core.workspaces?.currentWorkspaceId$.getValue();
    console.log(currentWorkspaceId);
    const unmount = mount({
      element: ref.current,
      transportOptions: {
        api: `${currentWorkspaceId ? `/w/${currentWorkspaceId}` : ''}/api/chat`,
        headers: {
          'osd-xsrf': 'true',
        },
      },
    });
    return () => {
      unmount();
    };
  }, [services.core.workspaces?.currentWorkspaceId$]);

  return (
    <div
      className="assistant-ui-chat-container"
      style={{ height: '100%', padding: 16 }}
      ref={ref}
    />
  );
};
