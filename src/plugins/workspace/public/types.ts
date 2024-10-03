/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart } from '../../../core/public';
import { WorkspaceClient } from './workspace_client';
import { DataSourceManagementPluginSetup } from '../../../plugins/data_source_management/public';
import { NavigationPublicPluginStart } from '../../../plugins/navigation/public';
import { ContentManagementPluginStart } from '../../../plugins/content_management/public';
import { DataSourceAttributes } from '../../../plugins/data_source/common/data_sources';

export interface WorkspaceDependServices {
  workspaceClient: WorkspaceClient;
  dataSourceManagement?: DataSourceManagementPluginSetup;
  navigationUI: NavigationPublicPluginStart['ui'];
  contentManagement?: ContentManagementPluginStart;
  collaboratorEditorEnabled?: boolean;
}

export type Services = CoreStart & WorkspaceDependServices;

export interface WorkspaceUseCaseFeature {
  id: string;
  title?: string;
}

export interface WorkspaceUseCase {
  id: string;
  title: string;
  description: string;
  features: WorkspaceUseCaseFeature[];
  systematic?: boolean;
  order?: number;
  icon?: string;
}

export interface DataSourceAttributesWithWorkspaces extends Omit<DataSourceAttributes, 'endpoint'> {
  workspaces?: string[];
}
