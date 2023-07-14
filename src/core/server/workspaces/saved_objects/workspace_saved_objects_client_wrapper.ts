/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OpenSearchDashboardsRequest,
  SavedObjectsClientWrapperFactory,
  SavedObjectsCreateOptions,
  SavedObjectsDeleteOptions,
} from 'opensearch-dashboards/server';
import {
  WorkspacePermissionControl,
  WorkspacePermissionMode,
} from '../workspace_permission_control';

const getWorkspaceIdFromRequest = (request: OpenSearchDashboardsRequest) => {
  if (typeof request.headers.referer !== 'string') {
    return null;
  }
  const refererURL = new URL(request.headers.referer);
  return /^\/w\/([^\/]+)/.exec(refererURL.pathname)?.[1];
};

export class WorkspaceSavedObjectsClientWrapper {
  private async validatePermissionByRequest(
    request: OpenSearchDashboardsRequest,
    permissionMode: WorkspacePermissionMode | WorkspacePermissionMode[]
  ) {
    const requestWorkspaceId = getWorkspaceIdFromRequest(request);
    if (
      requestWorkspaceId &&
      !(await this.permissionControl.validate(requestWorkspaceId, permissionMode, request))
    ) {
      throw new Error('Invalidate workspace permission');
    }
  }
  public wrapperFactory: SavedObjectsClientWrapperFactory = (wrapperOptions) => {
    const deleteWithWorkspacePermissionControl = async (
      type: string,
      id: string,
      options: SavedObjectsDeleteOptions = {}
    ) => {
      await this.validatePermissionByRequest(wrapperOptions.request, WorkspacePermissionMode.Admin);
      return await wrapperOptions.client.delete(type, id, options);
    };

    const createWithWorkspacePermissionControl = async <T = unknown>(
      type: string,
      attributes: T,
      options?: SavedObjectsCreateOptions
    ) => {
      await this.validatePermissionByRequest(wrapperOptions.request, WorkspacePermissionMode.Admin);
      return await wrapperOptions.client.create(type, attributes, options);
    };

    return {
      ...wrapperOptions.client,
      get: wrapperOptions.client.get,
      checkConflicts: wrapperOptions.client.checkConflicts,
      find: wrapperOptions.client.find,
      bulkGet: wrapperOptions.client.bulkGet,
      errors: wrapperOptions.client.errors,
      addToNamespaces: wrapperOptions.client.addToNamespaces,
      deleteFromNamespaces: wrapperOptions.client.deleteFromNamespaces,
      create: createWithWorkspacePermissionControl,
      delete: deleteWithWorkspacePermissionControl,
    };
  };

  constructor(private readonly permissionControl: WorkspacePermissionControl) {}
}
