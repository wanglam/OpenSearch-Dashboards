/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateRandomId, convertToFullWorkspacePermissions } from './utils';

describe('workspace utils', () => {
  it('should generate id with the specified size', () => {
    expect(generateRandomId(6)).toHaveLength(6);
  });

  it('should generate random IDs', () => {
    const NUM_OF_ID = 10000;
    const ids = new Set<string>();
    for (let i = 0; i < NUM_OF_ID; i++) {
      ids.add(generateRandomId(6));
    }
    expect(ids.size).toBe(NUM_OF_ID);
  });
});

describe('convertToFullWorkspacePermissions', () => {
  it('should convert partial permissions to full permissions', () => {
    const partialPermissions = {
      library_read: { users: ['user1'], groups: ['group1'] },
      library_write: { users: ['user2'] },
      management: { groups: ['group1'] },
    };

    const expectedFullPermissions = {
      library_read: { users: ['user1'], groups: ['group1'] },
      library_write: { users: ['user2'], groups: [] },
      management: { users: [], groups: ['group1'] },
    };

    expect(convertToFullWorkspacePermissions(partialPermissions)).toEqual(expectedFullPermissions);
  });

  it('should handle empty partial permissions', () => {
    const partialPermissions = {};

    const expectedFullPermissions = {
      management: { users: [], groups: [] },
      library_read: { users: [], groups: [] },
      library_write: { users: [], groups: [] },
    };

    expect(convertToFullWorkspacePermissions(partialPermissions)).toEqual(expectedFullPermissions);
  });
});
