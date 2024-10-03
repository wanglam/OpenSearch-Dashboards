/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Permissions } from '../server/saved_objects';

export enum PermissionModeId {
  ReadOnly = 'readOnly',
  ReadAndWrite = 'read+write',
  Admin = 'admin',
}

export interface WorkspaceAttribute {
  id: string;
  name: string;
  description?: string;
  features?: string[];
  color?: string;
  icon?: string;
  reserved?: boolean;
  uiSettings?: Record<string, any>;
  lastUpdatedTime?: string;
}

export interface WorkspaceAttributeWithPermission extends WorkspaceAttribute {
  permissions?: Permissions;
  permissionMode?: PermissionModeId;
}
