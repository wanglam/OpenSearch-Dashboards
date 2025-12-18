/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { mount } from 'assistant-ui-chat';
import { of } from 'rxjs';
import { useObservable } from 'react-use';

import { useOpenSearchDashboards } from '../../../opensearch_dashboards_react/public';

import './assistant_ui_chat_window.scss';

export const AssistantUiChatWindow = () => {
  const { services } = useOpenSearchDashboards();
  const ref = React.useRef(null);
  const currentWorkspaceId$ = useMemo(() => services.workspaces?.currentWorkspaceId$ ?? of(''), [
    services.workspaces,
  ]);
  const currentWorkspaceId = useObservable(currentWorkspaceId$);
  const currentWorkspaceIdRef = useRef(currentWorkspaceId);
  currentWorkspaceIdRef.current = currentWorkspaceId;

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const unmount = mount({
      element: ref.current,
      api: `${currentWorkspaceIdRef.current ? `/w/${currentWorkspaceIdRef.current}` : ''}/api/chat`,
    });
    return () => {
      unmount();
    };
  }, []);

  return (
    <div
      className="assistant-ui-chat-container"
      style={{ height: '100%', padding: 16 }}
      ref={ref}
    />
  );
};
