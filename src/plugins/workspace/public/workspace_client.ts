/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HttpFetchError,
  HttpFetchOptions,
  HttpSetup,
  WorkspaceAttribute,
  WorkspacesSetup,
  WorkspacePermissionMode,
} from '../../../core/public';

const WORKSPACES_API_BASE_URL = '/api/workspaces';

const join = (...uriComponents: Array<string | undefined>) =>
  uriComponents
    .filter((comp): comp is string => Boolean(comp))
    .map(encodeURIComponent)
    .join('/');

type IResponse<T> =
  | {
      result: T;
      success: true;
    }
  | {
      success: false;
      error?: string;
    };

type WorkspacePermissionItem = {
  modes: Array<
    | WorkspacePermissionMode.LibraryRead
    | WorkspacePermissionMode.LibraryWrite
    | WorkspacePermissionMode.Read
    | WorkspacePermissionMode.Write
  >;
} & ({ type: 'user'; userId: string } | { type: 'group'; group: string });

interface WorkspaceFindOptions {
  page?: number;
  perPage?: number;
  search?: string;
  searchFields?: string[];
  sortField?: string;
  sortOrder?: string;
}

/**
 * Workspaces is OpenSearchDashboards's visualize mechanism allowing admins to
 * organize related features
 *
 * @public
 */
export class WorkspaceClient {
  private http: HttpSetup;
  private workspaces: WorkspacesSetup;

  constructor(http: HttpSetup, workspaces: WorkspacesSetup) {
    this.http = http;
    this.workspaces = workspaces;
  }

  /**
   * Initialize workspace list
   */
  public async init() {
    await this.updateWorkspaceList();
    this.workspaces.initialized$.next(true);
  }

  /**
   * Add a non-throw-error fetch method for internal use.
   */
  private safeFetch = async <T = any>(
    path: string,
    options: HttpFetchOptions
  ): Promise<IResponse<T>> => {
    try {
      return await this.http.fetch<IResponse<T>>(path, options);
    } catch (error: unknown) {
      if (error instanceof HttpFetchError) {
        return {
          success: false,
          error: error.body?.message || error.body?.error || error.message,
        };
      }

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'Unknown error',
      };
    }
  };

  private getPath(...path: Array<string | undefined>): string {
    return [WORKSPACES_API_BASE_URL, join(...path)].filter((item) => item).join('/');
  }

  private async updateWorkspaceList(): Promise<void> {
    const result = await this.list({
      perPage: 999,
    });

    if (result?.success) {
      this.workspaces.workspaceList$.next(result.result.workspaces);
    }
  }

  public async enterWorkspace(id: string): Promise<IResponse<null>> {
    const workspaceResp = await this.get(id);
    if (workspaceResp.success) {
      this.workspaces.currentWorkspaceId$.next(id);
      return {
        success: true,
        result: null,
      };
    } else {
      return workspaceResp;
    }
  }

  public async getCurrentWorkspaceId(): Promise<IResponse<WorkspaceAttribute['id']>> {
    const currentWorkspaceId = this.workspaces.currentWorkspaceId$.getValue();
    if (!currentWorkspaceId) {
      return {
        success: false,
        error: 'You are not in any workspace yet.',
      };
    }

    return {
      success: true,
      result: currentWorkspaceId,
    };
  }

  public async getCurrentWorkspace(): Promise<IResponse<WorkspaceAttribute>> {
    const currentWorkspaceIdResp = await this.getCurrentWorkspaceId();
    if (currentWorkspaceIdResp.success) {
      const currentWorkspaceResp = await this.get(currentWorkspaceIdResp.result);
      return currentWorkspaceResp;
    } else {
      return currentWorkspaceIdResp;
    }
  }

  /**
   * Persists an workspace
   *
   * @param attributes
   * @returns
   */
  public async create(
    attributes: Omit<WorkspaceAttribute, 'id'>,
    permissions?: WorkspacePermissionItem[]
  ): Promise<IResponse<WorkspaceAttribute>> {
    const path = this.getPath();

    const result = await this.safeFetch<WorkspaceAttribute>(path, {
      method: 'POST',
      body: JSON.stringify({
        attributes,
        permissions,
      }),
    });

    if (result.success) {
      await this.updateWorkspaceList();
    }

    return result;
  }

  /**
   * Deletes a workspace
   *
   * @param id
   * @returns
   */
  public async delete(id: string): Promise<IResponse<null>> {
    const result = await this.safeFetch<null>(this.getPath(id), { method: 'DELETE' });

    if (result.success) {
      await this.updateWorkspaceList();
    }

    return result;
  }

  /**
   * Search for workspaces
   *
   * @param {object} [options={}]
   * @property {string} options.search
   * @property {string} options.searchFields - see OpenSearch Simple Query String
   *                                        Query field argument for more information
   * @property {integer} [options.page=1]
   * @property {integer} [options.perPage=20]
   * @property {array} options.fields
   * @returns A find result with workspaces matching the specified search.
   */
  public list(
    options?: WorkspaceFindOptions
  ): Promise<
    IResponse<{
      workspaces: WorkspaceAttribute[];
      total: number;
      per_page: number;
      page: number;
    }>
  > {
    const path = this.getPath('_list');
    return this.safeFetch(path, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  }

  /**
   * Fetches a single workspace
   *
   * @param {string} id
   * @returns The workspace for the given id.
   */
  public get(id: string): Promise<IResponse<WorkspaceAttribute>> {
    const path = this.getPath(id);
    return this.safeFetch(path, {
      method: 'GET',
    });
  }

  /**
   * Updates a workspace
   *
   * @param {string} id
   * @param {object} attributes
   * @returns
   */
  public async update(
    id: string,
    attributes: Partial<WorkspaceAttribute>,
    permissions?: WorkspacePermissionItem[]
  ): Promise<IResponse<boolean>> {
    const path = this.getPath(id);
    const body = {
      attributes,
      permissions,
    };

    const result = await this.safeFetch(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    if (result.success) {
      await this.updateWorkspaceList();
    }

    return result;
  }

  public stop() {
    this.workspaces.workspaceList$.unsubscribe();
    this.workspaces.currentWorkspaceId$.unsubscribe();
  }
}
