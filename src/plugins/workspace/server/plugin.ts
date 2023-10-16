/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PluginInitializerContext,
  CoreSetup,
  Plugin,
  Logger,
  CoreStart,
} from '../../../core/server';
import { WORKSPACE_SAVED_OBJECTS_CLIENT_WRAPPER_ID } from '../common/constants';
import { IWorkspaceDBImpl } from './types';
import { WorkspaceClientWithSavedObject } from './workspace_client';
import { registerRoutes } from './routes';
import { WorkspaceSavedObjectsClientWrapper } from './saved_objects';
import { cleanWorkspaceId, getWorkspaceIdFromUrl } from '../../../core/server/utils';

export class WorkspacePlugin implements Plugin<{}, {}> {
  private readonly logger: Logger;
  private client?: IWorkspaceDBImpl;

  private proxyWorkspaceTrafficToRealHandler(setupDeps: CoreSetup) {
    /**
     * Proxy all {basePath}/w/{workspaceId}{osdPath*} paths to {basePath}{osdPath*}
     */
    setupDeps.http.registerOnPreRouting(async (request, response, toolkit) => {
      const workspaceId = getWorkspaceIdFromUrl(request.url.toString());

      if (workspaceId) {
        const requestUrl = new URL(request.url.toString());
        requestUrl.pathname = cleanWorkspaceId(requestUrl.pathname);
        return toolkit.rewriteUrl(requestUrl.toString());
      }
      return toolkit.next();
    });
  }

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get('plugins', 'workspace');
  }

  public async setup(core: CoreSetup) {
    this.logger.debug('Setting up Workspaces service');

    this.client = new WorkspaceClientWithSavedObject(core);

    await this.client.setup(core);

    this.proxyWorkspaceTrafficToRealHandler(core);
    const workspaceSavedObjectsClientWrapper = new WorkspaceSavedObjectsClientWrapper();

    core.savedObjects.addClientWrapper(
      0,
      WORKSPACE_SAVED_OBJECTS_CLIENT_WRAPPER_ID,
      workspaceSavedObjectsClientWrapper.wrapperFactory
    );

    registerRoutes({
      http: core.http,
      logger: this.logger,
      client: this.client as IWorkspaceDBImpl,
    });

    return {
      client: this.client,
    };
  }

  public start(core: CoreStart) {
    this.logger.debug('Starting Workspace service');
    this.client?.setSavedObjects(core.savedObjects);

    return {
      client: this.client as IWorkspaceDBImpl,
    };
  }

  public stop() {}
}
