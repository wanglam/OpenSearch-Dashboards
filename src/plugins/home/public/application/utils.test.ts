/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { isAbleToUpdateUiSettings } from './utils';

describe('isAbleToUpdateUiSettings', () => {
  it('should return true when workspace is not enabled and permission is not enabled', () => {
    const application = {
      capabilities: {
        workspaces: {
          enabled: false,
          permissionEnabled: false,
        },
      },
    };
    const workspaces = null;

    const result = isAbleToUpdateUiSettings({ workspaces, application });

    expect(result).toBe(true);
  });

  it('should return true when workspace is enabled but permission is not enabled', () => {
    const application = {
      capabilities: {
        workspaces: {
          enabled: true,
          permissionEnabled: false,
        },
      },
    };
    const workspaces = null;

    const result = isAbleToUpdateUiSettings({ workspaces, application });

    expect(result).toBe(true);
  });

  it('should return true when current workspace owner', () => {
    const application = {
      capabilities: {
        workspaces: {
          enabled: true,
          permissionEnabled: true,
        },
      },
    };
    const workspaces = {
      currentWorkspace$: {
        getValue: () => ({ owner: true }),
      },
    };

    const result = isAbleToUpdateUiSettings({ workspaces, application });

    expect(result).toBe(true);
  });

  it('should return true when user is dashboards admin', () => {
    const application = {
      capabilities: {
        workspaces: {
          enabled: true,
          permissionEnabled: true,
        },
        dashboards: {
          isDashboardAdmin: true,
        },
      },
    };
    const workspaces = {
      currentWorkspace$: {
        getValue: () => ({ owner: false }),
      },
    };

    const result = isAbleToUpdateUiSettings({ workspaces, application });

    expect(result).toBe(true);
  });

  it('should return false when user is not current workspace owner and not dashboards admin', () => {
    const application = {
      capabilities: {
        workspaces: {
          enabled: true,
          permissionEnabled: true,
        },
        dashboards: {
          isDashboardAdmin: false,
        },
      },
    };
    const workspaces = {
      currentWorkspace$: {
        getValue: () => ({ owner: false }),
      },
    };

    const result = isAbleToUpdateUiSettings({ workspaces, application });

    expect(result).toBe(false);
  });
});
