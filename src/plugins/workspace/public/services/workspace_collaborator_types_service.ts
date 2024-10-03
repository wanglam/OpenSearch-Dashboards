/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BehaviorSubject } from 'rxjs';
import { i18n } from '@osd/i18n';
import {
  WorkspacePermissionItemType,
  WorkspacePermissionSetting,
} from '../components/workspace_form';

export interface WorkspaceCollaboratorType {
  id: string;
  name: string;
  pluralName: string;
  // Use string literal avoid import enum outside
  permissionSettingType: 'user' | 'group';
  modal: {
    title: string;
    // Will hide this section if not provided
    description?: string;
    // Will use name with ID suffix for fallback
    inputLabel?: string;
    // Will hide this section if not provided
    inputDescription?: string;
    // Will use name with ID suffix for fallback
    inputPlaceholder?: string;
  };
  // Will hide this section if not provided
  instruction?: {
    title: string;
    detail: string;
    link?: string;
  };
  typeMatcher?: (permissionSetting: WorkspacePermissionSetting) => boolean;
}

export const defaultWorkspaceCollaboratorTypes: WorkspaceCollaboratorType[] = [
  {
    id: 'user',
    name: i18n.translate('workspace.collaboratorType.defaultUser.name', { defaultMessage: 'User' }),
    pluralName: i18n.translate('workspace.collaboratorType.defaultUser.pluralName', {
      defaultMessage: 'Users',
    }),
    permissionSettingType: 'user',
    modal: {
      title: i18n.translate('workspace.collaboratorType.defaultUser.modal.title', {
        defaultMessage: 'Add Users',
      }),
    },
    typeMatcher: (permissionSetting) => permissionSetting.type === WorkspacePermissionItemType.User,
  },
  {
    id: 'group',
    name: i18n.translate('workspace.collaboratorType.defaultGroup.name', {
      defaultMessage: 'Group',
    }),
    pluralName: i18n.translate('workspace.collaboratorType.defaultGroup.pluralName', {
      defaultMessage: 'Groups',
    }),
    permissionSettingType: 'group',
    modal: {
      title: i18n.translate('workspace.collaboratorType.defaultGroup.modal.title', {
        defaultMessage: 'Add Users',
      }),
    },
    typeMatcher: (permissionSetting) =>
      permissionSetting.type === WorkspacePermissionItemType.Group,
  },
];

export class WorkspaceCollaboratorTypesService {
  private _collaboratorTypes$ = new BehaviorSubject<WorkspaceCollaboratorType[]>(
    defaultWorkspaceCollaboratorTypes
  );

  public getTypes$() {
    return this._collaboratorTypes$;
  }

  public setTypes(types: WorkspaceCollaboratorType[]) {
    this._collaboratorTypes$.next(types);
  }

  public stop() {
    this._collaboratorTypes$.complete();
  }
}
