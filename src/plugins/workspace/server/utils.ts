/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import {
  AuthStatus,
  HttpAuth,
  OpenSearchDashboardsRequest,
  Principals,
  PrincipalType,
} from '../../../core/server';
import { AuthInfo } from './types';

/**
 * Generate URL friendly random ID
 */
export const generateRandomId = (size: number) => {
  return crypto.randomBytes(size).toString('base64url').slice(0, size);
};

export const getPrincipalsFromRequest = (
  request: OpenSearchDashboardsRequest,
  auth?: HttpAuth
): Principals => {
  const payload: Principals = {};
  const authInfoResp = auth?.get(request);
  if (authInfoResp?.status === AuthStatus.unknown) {
    /**
     * Login user have access to all the workspaces when no authentication is presented.
     */
    return payload;
  }

  if (authInfoResp?.status === AuthStatus.unauthenticated) {
    /**
     * use a fake user that won't be granted permission explicitly when authenticated error.
     */
    payload[PrincipalType.Users] = [`_user_fake_${Date.now()}_`];
    return payload;
  }
  const authInfo = authInfoResp?.state as AuthInfo | null;
  if (authInfo?.backend_roles) {
    payload[PrincipalType.Groups] = authInfo.backend_roles;
  }
  if (authInfo?.user_name) {
    payload[PrincipalType.Users] = [authInfo.user_name];
  }
  return payload;
};
