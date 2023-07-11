/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export enum WorkspacePermissionMode {
  Read,
  Admin,
}

export class WorkspacePermissionControl {
  public async validate(
    workspaceId: string,
    permissionModeOrModes: WorkspacePermissionMode | WorkspacePermissionMode[]
  ) {
    return true;
  }

  public async setup() {}
}
