/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import type { Permissions } from '../../../core/server';
import { WorkspacePermissionMode } from '../../../core/server';

/**
 * Generate URL friendly random ID
 */
export const generateRandomId = (size: number) => {
  return crypto.randomBytes(size).toString('base64url').slice(0, size);
};

const addMissingPrincipals = (principals: Permissions[string]) => ({
  users: principals.users || [],
  groups: principals.groups || [],
});

/**
 * Converts a partial permissions object to a full permissions object by adding missing principals for each permission mode.
 * @param permissions - The partial permissions object.
 * @returns The full permissions object with all permission modes and their corresponding principals.
 */
export const convertToFullWorkspacePermissions = (permissions: Permissions) => ({
  ...permissions,
  ...[
    WorkspacePermissionMode.LibraryRead,
    WorkspacePermissionMode.LibraryWrite,
    WorkspacePermissionMode.Management,
  ].reduce(
    (previousValue, permissionMode) => ({
      ...previousValue,
      [permissionMode]: addMissingPrincipals(permissions[permissionMode] || {}),
    }),
    {}
  ),
});
