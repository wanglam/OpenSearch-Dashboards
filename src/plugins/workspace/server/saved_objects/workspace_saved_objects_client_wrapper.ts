/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SavedObject,
  SavedObjectsBaseOptions,
  SavedObjectsBulkCreateObject,
  SavedObjectsBulkGetObject,
  SavedObjectsBulkResponse,
  SavedObjectsClientWrapperFactory,
  SavedObjectsCreateOptions,
  SavedObjectsDeleteOptions,
  SavedObjectsFindOptions,
  SavedObjectsUpdateOptions,
  SavedObjectsUpdateResponse,
  SavedObjectsBulkUpdateObject,
  SavedObjectsBulkUpdateResponse,
  SavedObjectsBulkUpdateOptions,
} from '../../../../core/server';

export class WorkspaceSavedObjectsClientWrapper {
  public wrapperFactory: SavedObjectsClientWrapperFactory = (wrapperOptions) => {
    const deleteWithWorkspacePermissionControl = async (
      type: string,
      id: string,
      options: SavedObjectsDeleteOptions = {}
    ) => {
      return await wrapperOptions.client.delete(type, id, options);
    };

    const updateWithWorkspacePermissionControl = async <T = unknown>(
      type: string,
      id: string,
      attributes: Partial<T>,
      options: SavedObjectsUpdateOptions = {}
    ): Promise<SavedObjectsUpdateResponse<T>> => {
      return await wrapperOptions.client.update(type, id, attributes, options);
    };

    const bulkUpdateWithWorkspacePermissionControl = async <T = unknown>(
      objects: Array<SavedObjectsBulkUpdateObject<T>>,
      options?: SavedObjectsBulkUpdateOptions
    ): Promise<SavedObjectsBulkUpdateResponse<T>> => {
      return await wrapperOptions.client.bulkUpdate(objects, options);
    };

    const bulkCreateWithWorkspacePermissionControl = async <T = unknown>(
      objects: Array<SavedObjectsBulkCreateObject<T>>,
      options: SavedObjectsCreateOptions = {}
    ): Promise<SavedObjectsBulkResponse<T>> => {
      return await wrapperOptions.client.bulkCreate(objects, options);
    };

    const createWithWorkspacePermissionControl = async <T = unknown>(
      type: string,
      attributes: T,
      options?: SavedObjectsCreateOptions
    ) => {
      return await wrapperOptions.client.create(type, attributes, options);
    };

    const getWithWorkspacePermissionControl = async <T = unknown>(
      type: string,
      id: string,
      options: SavedObjectsBaseOptions = {}
    ): Promise<SavedObject<T>> => {
      const objectToGet = await wrapperOptions.client.get<T>(type, id, options);
      return objectToGet;
    };

    const bulkGetWithWorkspacePermissionControl = async <T = unknown>(
      objects: SavedObjectsBulkGetObject[] = [],
      options: SavedObjectsBaseOptions = {}
    ): Promise<SavedObjectsBulkResponse<T>> => {
      const objectToBulkGet = await wrapperOptions.client.bulkGet<T>(objects, options);

      return objectToBulkGet;
    };

    const findWithWorkspacePermissionControl = async <T = unknown>(
      options: SavedObjectsFindOptions
    ) => {
      return await wrapperOptions.client.find<T>(options);
    };

    return {
      ...wrapperOptions.client,
      get: getWithWorkspacePermissionControl,
      checkConflicts: wrapperOptions.client.checkConflicts,
      find: findWithWorkspacePermissionControl,
      bulkGet: bulkGetWithWorkspacePermissionControl,
      errors: wrapperOptions.client.errors,
      addToNamespaces: wrapperOptions.client.addToNamespaces,
      deleteFromNamespaces: wrapperOptions.client.deleteFromNamespaces,
      create: createWithWorkspacePermissionControl,
      bulkCreate: bulkCreateWithWorkspacePermissionControl,
      delete: deleteWithWorkspacePermissionControl,
      update: updateWithWorkspacePermissionControl,
      bulkUpdate: bulkUpdateWithWorkspacePermissionControl,
    };
  };

  constructor() {}
}
