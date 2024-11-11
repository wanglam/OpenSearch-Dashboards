/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HomeOpenSearchDashboardsServices } from './opensearch_dashboards_services';

export const isAbleToUpdateUiSettings = ({
  workspaces,
  application,
}: Pick<HomeOpenSearchDashboardsServices, 'workspaces' | 'application'>) => {
  // Able to update ui settings when workspace not enabled and permission not enabled
  if (
    !application.capabilities ||
    !application.capabilities.workspaces ||
    !application.capabilities.workspaces.enabled ||
    !application.capabilities.workspaces.permissionEnabled
  ) {
    return true;
  }

  // Able to update ui settings when is current workspace owner
  if (workspaces) {
    const currentWorkspace = workspaces.currentWorkspace$.getValue();
    if (currentWorkspace && currentWorkspace.owner) {
      return true;
    }
  }

  // Able to update ui settings when is dashboards admin
  return (
    application.capabilities.dashboards &&
    application.capabilities.dashboards.isDashboardAdmin !== false
  );
};
