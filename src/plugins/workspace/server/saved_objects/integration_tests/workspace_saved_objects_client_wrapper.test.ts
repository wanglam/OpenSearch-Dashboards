/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { ISavedObjectsRepository } from 'src/core/server';

import {
  createTestServers,
  TestOpenSearchUtils,
  TestOpenSearchDashboardsUtils,
  TestUtils,
} from '../../../../../core/test_helpers/osd_server';
import { SavedObjectsErrorHelpers } from '../../../../../core/server';
import { httpServerMock } from '../../../../../../src/core/server/mocks';
import * as utilsExports from '../../utils';

const repositoryKit = (() => {
  const savedObjects: Array<{ type: string; id: string }> = [];
  return {
    create: async (
      repository: ISavedObjectsRepository,
      ...params: Parameters<ISavedObjectsRepository['create']>
    ) => {
      let result;
      try {
        result = params[2]?.id ? await repository.get(params[0], params[2].id) : undefined;
      } catch (_e) {
        // ignore error when get failed
      }
      if (!result) {
        result = await repository.create(...params);
      }
      savedObjects.push(result);
      return result;
    },
    clearAll: async (repository: ISavedObjectsRepository) => {
      for (let i = 0; i < savedObjects.length; i++) {
        await repository.delete(savedObjects[i].type, savedObjects[i].id);
      }
    },
  };
})();

describe('WorkspaceSavedObjectsClientWrapper', () => {
  let internalSavedObjectsRepository: ISavedObjectsRepository;
  let servers: TestUtils;
  let opensearchServer: TestOpenSearchUtils;
  let osd: TestOpenSearchDashboardsUtils;

  beforeAll(async function () {
    servers = createTestServers({
      adjustTimeout: (t) => {
        jest.setTimeout(t);
      },
      settings: {
        osd: {
          workspace: {
            enabled: true,
          },
        },
      },
    });
    opensearchServer = await servers.startOpenSearch();
    osd = await servers.startOpenSearchDashboards();

    internalSavedObjectsRepository = osd.coreStart.savedObjects.createInternalRepository();

    await repositoryKit.create(
      internalSavedObjectsRepository,
      'workspace',
      {},
      {
        id: 'workspace-1',
        permissions: {
          library_read: { users: ['foo'] },
          library_write: { users: ['foo'] },
        },
      }
    );

    await repositoryKit.create(
      internalSavedObjectsRepository,
      'dashboard',
      {},
      {
        id: 'inner-workspace-dashboard-1',
        workspaces: ['workspace-1'],
      }
    );

    await repositoryKit.create(
      internalSavedObjectsRepository,
      'dashboard',
      {},
      {
        id: 'acl-controlled-dashboard-2',
        permissions: {
          read: { users: ['foo'], groups: [] },
          write: { users: ['foo'], groups: [] },
        },
      }
    );
  });

  afterAll(async () => {
    await repositoryKit.clearAll(internalSavedObjectsRepository);
    await opensearchServer.stop();
    await osd.stop();
  });

  beforeEach(() => {
    jest.spyOn(utilsExports, 'getPrincipalsFromRequest').mockReturnValue({
      users: ['bar'],
    });
  });

  afterEach(() => {
    jest.spyOn(utilsExports, 'getPrincipalsFromRequest').mockRestore();
  });

  describe('get', () => {
    it('should throw forbidden error when user not permitted', async () => {
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );
      let error;
      try {
        await savedObjectsClient.get('dashboard', 'inner-workspace-dashboard-1');
      } catch (e) {
        error = e;
      }
      expect(error).not.toBeUndefined();
      expect(SavedObjectsErrorHelpers.isForbiddenError(error)).toBe(true);

      error = undefined;
      try {
        await savedObjectsClient.get('dashboard', 'acl-controlled-dashboard-2');
      } catch (e) {
        error = e;
      }
      expect(error).not.toBeUndefined();
      expect(SavedObjectsErrorHelpers.isForbiddenError(error)).toBe(true);
    });

    it('should return consistent dashboard when user permitted', async () => {
      jest.spyOn(utilsExports, 'getPrincipalsFromRequest').mockReturnValue({
        users: ['foo'],
      });
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );

      expect(
        (await savedObjectsClient.get('dashboard', 'inner-workspace-dashboard-1')).error
      ).toBeUndefined();
      expect(
        (await savedObjectsClient.get('dashboard', 'acl-controlled-dashboard-2')).error
      ).toBeUndefined();
    });
  });

  describe('bulkGet', () => {
    it('should throw forbidden error when user not permitted', async () => {
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );
      let error;
      try {
        await savedObjectsClient.bulkGet([
          { type: 'dashboard', id: 'inner-workspace-dashboard-1' },
        ]);
      } catch (e) {
        error = e;
      }
      expect(error).not.toBeUndefined();
      expect(SavedObjectsErrorHelpers.isForbiddenError(error)).toBe(true);

      error = undefined;
      try {
        await savedObjectsClient.bulkGet([{ type: 'dashboard', id: 'acl-controlled-dashboard-2' }]);
      } catch (e) {
        error = e;
      }
      expect(error).not.toBeUndefined();
      expect(SavedObjectsErrorHelpers.isForbiddenError(error)).toBe(true);
    });

    it('should return consistent dashboard when user permitted', async () => {
      jest.spyOn(utilsExports, 'getPrincipalsFromRequest').mockReturnValue({
        users: ['foo'],
      });
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );

      expect(
        (
          await savedObjectsClient.bulkGet([
            { type: 'dashboard', id: 'inner-workspace-dashboard-1' },
          ])
        ).saved_objects.length
      ).toEqual(1);
      expect(
        (
          await savedObjectsClient.bulkGet([
            { type: 'dashboard', id: 'acl-controlled-dashboard-2' },
          ])
        ).saved_objects.length
      ).toEqual(1);
    });
  });

  describe('find', () => {
    it('should throw not authorized error when user not permitted', async () => {
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );
      let error;
      try {
        await savedObjectsClient.find({
          type: 'dashboard',
          workspaces: ['workspace-1'],
          perPage: 999,
          page: 1,
        });
      } catch (e) {
        error = e;
      }

      expect(SavedObjectsErrorHelpers.isNotAuthorizedError(error)).toBe(true);
    });

    it('should return consistent inner workspace data when user permitted', async () => {
      jest.spyOn(utilsExports, 'getPrincipalsFromRequest').mockReturnValue({
        users: ['foo'],
      });
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );
      const result = await savedObjectsClient.find({
        type: 'dashboard',
        workspaces: ['workspace-1'],
        perPage: 999,
        page: 1,
      });

      expect(result.saved_objects.some((item) => item.id === 'inner-workspace-dashboard-1')).toBe(
        true
      );
    });
  });

  describe('create', () => {
    it('should throw forbidden error when workspace not permitted and create called', async () => {
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );
      let error;
      try {
        await savedObjectsClient.create(
          'dashboard',
          {},
          {
            workspaces: ['workspace-1'],
          }
        );
      } catch (e) {
        error = e;
      }

      expect(SavedObjectsErrorHelpers.isForbiddenError(error)).toBe(true);
    });

    it('should able to create saved objects into permitted workspaces after create called', async () => {
      jest.spyOn(utilsExports, 'getPrincipalsFromRequest').mockReturnValue({
        users: ['foo'],
      });
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );
      const createResult = await savedObjectsClient.create(
        'dashboard',
        {},
        {
          workspaces: ['workspace-1'],
        }
      );
      expect(createResult.error).toBeUndefined();
      await savedObjectsClient.delete('dashboard', createResult.id);
    });

    it('should throw forbidden error when create with override', async () => {
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );
      let error;
      try {
        await savedObjectsClient.create(
          'dashboard',
          {},
          {
            id: 'inner-workspace-dashboard-1',
            overwrite: true,
          }
        );
      } catch (e) {
        error = e;
      }

      expect(SavedObjectsErrorHelpers.isForbiddenError(error)).toBe(true);
    });
  });

  describe('bulkCreate', () => {
    it('should throw forbidden error when workspace not permitted and bulkCreate called', async () => {
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );
      let error;
      try {
        await savedObjectsClient.bulkCreate([{ type: 'dashboard', attributes: {} }], {
          workspaces: ['workspace-1'],
        });
      } catch (e) {
        error = e;
      }

      expect(SavedObjectsErrorHelpers.isForbiddenError(error)).toBe(true);
    });

    it('should able to create saved objects into permitted workspaces after bulkCreate called', async () => {
      jest.spyOn(utilsExports, 'getPrincipalsFromRequest').mockReturnValue({
        users: ['foo'],
      });
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );
      const objectId = new Date().getTime().toString(16).toUpperCase();
      const result = await savedObjectsClient.bulkCreate(
        [{ type: 'dashboard', attributes: {}, id: objectId }],
        {
          workspaces: ['workspace-1'],
        }
      );
      expect(result.saved_objects.length).toEqual(1);
      await savedObjectsClient.delete('dashboard', objectId);
    });
  });

  describe('update', () => {
    it('should throw forbidden error when data not permitted', async () => {
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );
      let error;
      try {
        await savedObjectsClient.update('dashboard', 'inner-workspace-dashboard-1', {});
      } catch (e) {
        error = e;
      }

      expect(SavedObjectsErrorHelpers.isForbiddenError(error)).toBe(true);

      error = undefined;
      try {
        await savedObjectsClient.update('dashboard', 'acl-controlled-dashboard-2', {});
      } catch (e) {
        error = e;
      }

      expect(SavedObjectsErrorHelpers.isForbiddenError(error)).toBe(true);
    });

    it('should update saved objects for permitted workspaces', async () => {
      jest.spyOn(utilsExports, 'getPrincipalsFromRequest').mockReturnValue({
        users: ['foo'],
      });
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );

      expect(
        (await savedObjectsClient.update('dashboard', 'inner-workspace-dashboard-1', {})).error
      ).toBeUndefined();
      expect(
        (await savedObjectsClient.update('dashboard', 'acl-controlled-dashboard-2', {})).error
      ).toBeUndefined();
    });
  });

  describe('bulkUpdate', () => {
    it('should throw forbidden error when data not permitted', async () => {
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );
      let error;
      try {
        await savedObjectsClient.bulkUpdate(
          [{ type: 'dashboard', id: 'inner-workspace-dashboard-1', attributes: {} }],
          {}
        );
      } catch (e) {
        error = e;
      }

      expect(SavedObjectsErrorHelpers.isForbiddenError(error)).toBe(true);

      error = undefined;
      try {
        await savedObjectsClient.bulkUpdate(
          [{ type: 'dashboard', id: 'acl-controlled-dashboard-2', attributes: {} }],
          {}
        );
      } catch (e) {
        error = e;
      }

      expect(SavedObjectsErrorHelpers.isForbiddenError(error)).toBe(true);
    });

    it('should bulk update saved objects for permitted workspaces', async () => {
      jest.spyOn(utilsExports, 'getPrincipalsFromRequest').mockReturnValue({
        users: ['foo'],
      });
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );

      expect(
        (
          await savedObjectsClient.bulkUpdate([
            { type: 'dashboard', id: 'inner-workspace-dashboard-1', attributes: {} },
          ])
        ).saved_objects.length
      ).toEqual(1);
      expect(
        (
          await savedObjectsClient.bulkUpdate([
            { type: 'dashboard', id: 'inner-workspace-dashboard-1', attributes: {} },
          ])
        ).saved_objects.length
      ).toEqual(1);
    });
  });

  describe('delete', () => {
    it('should throw forbidden error when data not permitted', async () => {
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );
      let error;
      try {
        await savedObjectsClient.delete('dashboard', 'inner-workspace-dashboard-1');
      } catch (e) {
        error = e;
      }

      expect(SavedObjectsErrorHelpers.isForbiddenError(error)).toBe(true);

      error = undefined;
      try {
        await savedObjectsClient.delete('dashboard', 'acl-controlled-dashboard-2');
      } catch (e) {
        error = e;
      }

      expect(SavedObjectsErrorHelpers.isForbiddenError(error)).toBe(true);
    });

    it('should be able to delete permitted data', async () => {
      jest.spyOn(utilsExports, 'getPrincipalsFromRequest').mockReturnValue({
        users: ['foo'],
      });
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );

      const createResult = await repositoryKit.create(
        internalSavedObjectsRepository,
        'dashboard',
        {},
        {
          workspaces: ['workspace-1'],
        }
      );

      await savedObjectsClient.delete('dashboard', createResult.id);

      let error;
      try {
        error = await savedObjectsClient.get('dashboard', createResult.id);
      } catch (e) {
        error = e;
      }
      expect(SavedObjectsErrorHelpers.isNotFoundError(error)).toBe(true);
    });

    it('should be able to delete acl controlled permitted data', async () => {
      jest.spyOn(utilsExports, 'getPrincipalsFromRequest').mockReturnValue({
        users: ['foo'],
      });
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );

      const createResult = await repositoryKit.create(
        internalSavedObjectsRepository,
        'dashboard',
        {},
        {
          permissions: {
            read: { users: ['foo'] },
            write: { users: ['foo'] },
          },
        }
      );

      await savedObjectsClient.delete('dashboard', createResult.id);

      let error;
      try {
        error = await savedObjectsClient.get('dashboard', createResult.id);
      } catch (e) {
        error = e;
      }
      expect(SavedObjectsErrorHelpers.isNotFoundError(error)).toBe(true);
    });
  });

  describe('addToWorkspaces', () => {
    it('should throw forbidden error when workspace not permitted', async () => {
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );
      let error;
      try {
        await savedObjectsClient.addToWorkspaces(
          [{ type: 'dashboard', id: 'acl-controlled-dashboard-2' }],
          ['workspace-1']
        );
      } catch (e) {
        error = e;
      }

      expect(SavedObjectsErrorHelpers.isForbiddenError(error)).toBe(true);
    });

    it('should throw forbidden error when object ACL not permitted', async () => {
      jest.spyOn(utilsExports, 'getPrincipalsFromRequest').mockReturnValue({
        users: ['foo'],
      });
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );
      const createResult = await repositoryKit.create(
        internalSavedObjectsRepository,
        'dashboard',
        {},
        {
          permissions: {
            read: { users: ['foo'] },
          },
        }
      );
      let error;
      try {
        await savedObjectsClient.addToWorkspaces(
          [{ type: 'dashboard', id: createResult.id }],
          ['workspace-1']
        );
      } catch (e) {
        error = e;
      }

      expect(SavedObjectsErrorHelpers.isForbiddenError(error)).toBe(true);
    });

    it('should be able to add to target workspaces', async () => {
      jest.spyOn(utilsExports, 'getPrincipalsFromRequest').mockReturnValue({
        users: ['foo'],
      });
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );
      const createResult = await repositoryKit.create(
        internalSavedObjectsRepository,
        'dashboard',
        {},
        {
          workspaces: ['workspace-2'],
          permissions: {
            read: { users: ['foo'] },
            write: { users: ['foo'] },
          },
        }
      );
      await savedObjectsClient.addToWorkspaces(
        [{ type: 'dashboard', id: createResult.id }],
        ['workspace-1']
      );

      const result = await savedObjectsClient.find({
        type: 'dashboard',
        workspaces: ['workspace-1'],
        perPage: 999,
        page: 1,
      });

      expect(result.saved_objects.some((item) => item.id === createResult.id)).toBe(true);
    });
  });

  describe('deleteByWorkspace', () => {
    it('should throw forbidden error when workspace not permitted', async () => {
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );

      let error;
      try {
        await savedObjectsClient.deleteByWorkspace('workspace-1');
      } catch (e) {
        error = e;
      }

      expect(SavedObjectsErrorHelpers.isForbiddenError(error)).toBe(true);
    });

    it('should delete workspace 2 inner data when workspace permitted', async () => {
      const savedObjectsClient = osd.coreStart.savedObjects.getScopedClient(
        httpServerMock.createOpenSearchDashboardsRequest()
      );
      jest.spyOn(utilsExports, 'getPrincipalsFromRequest').mockReturnValue({
        users: ['foo'],
      });

      await repositoryKit.create(
        internalSavedObjectsRepository,
        'workspace',
        {},
        {
          id: 'workspace-3',
          permissions: {
            library_read: { users: ['foo'] },
            library_write: { users: ['foo'] },
          },
        }
      );

      await repositoryKit.create(
        internalSavedObjectsRepository,
        'dashboard',
        {},
        {
          workspaces: ['workspace-3'],
        }
      );

      await savedObjectsClient.deleteByWorkspace('workspace-3');

      // Wait for delete be effected
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      expect(
        (
          await savedObjectsClient.find({
            type: 'dashboard',
            workspaces: ['workspace-3'],
            perPage: 999,
            page: 1,
          })
        ).saved_objects.length
      ).toEqual(0);
    });
  });
});
