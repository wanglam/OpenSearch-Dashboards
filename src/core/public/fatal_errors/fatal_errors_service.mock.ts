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

import type { PublicMethodsOf } from '@osd/utility-types';
import { FatalErrorsService, FatalErrorsSetup } from './fatal_errors_service';
import { BehaviorSubject } from 'rxjs';
import { WorkspaceAttribute } from '../workspace';

const createSetupContractMock = () => {
  const setupContract: jest.Mocked<FatalErrorsSetup> = {
    add: jest.fn<never, any>(() => undefined as never),
    get$: jest.fn(),
  };

  return setupContract;
};
const createStartContractMock = createSetupContractMock;

type FatalErrorsServiceContract = PublicMethodsOf<FatalErrorsService>;
const createMock = () => {
  const mocked: jest.Mocked<FatalErrorsServiceContract> = {
    setup: jest.fn(),
    start: jest.fn(),
  };

  mocked.setup.mockReturnValue(createSetupContractMock());
  mocked.start.mockReturnValue(createStartContractMock());
  return mocked;
};

export const fatalErrorsServiceMock = {
  create: createMock,
  createSetupContract: createSetupContractMock,
  createStartContract: createStartContractMock,
};

const currentWorkspaceId$ = new BehaviorSubject<string>('');
const workspaceList$ = new BehaviorSubject<WorkspaceAttribute[]>([]);
const currentWorkspace$ = new BehaviorSubject<WorkspaceAttribute | null>(null);

const createWorkspacesSetupContractMock = () => ({
  client: {
    currentWorkspaceId$,
    workspaceList$,
    currentWorkspace$,
    stop: jest.fn(),
    enterWorkspace: jest.fn(),
    exitWorkspace: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    list: jest.fn(),
    getCurrentWorkspace: jest.fn(),
    getCurrentWorkspaceId: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
  },
  formatUrlWithWorkspaceId: jest.fn(),
  setFormatUrlWithWorkspaceId: jest.fn(),
});

const createWorkspacesStartContractMock = createWorkspacesSetupContractMock;

export const workspacesServiceMock = {
  createSetupContractMock: createWorkspacesStartContractMock,
  createStartContract: createWorkspacesStartContractMock,
};
