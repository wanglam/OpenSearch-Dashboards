/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateRandomId, convertToFullPermissions } from './utils';

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

describe('convertToFullPermissions', () => {
  it('should convert partial permissions to full permissions', () => {
    // Arrange
    const partialPermissions = {
      read: { users: ['user1'], groups: ['group1'] },
      write: { users: ['user2'] },
      management: { groups: ['group1'] },
    };

    const expectedFullPermissions = {
      read: { users: ['user1'], groups: ['group1'] },
      write: { users: ['user2'], groups: [] },
      management: { users: [], groups: ['group1'] },
      library_read: { users: [], groups: [] },
      library_write: { users: [], groups: [] },
    };

    expect(convertToFullPermissions(partialPermissions)).toEqual(expectedFullPermissions);
  });

  it('should handle empty partial permissions', () => {
    const partialPermissions = {};

    const expectedFullPermissions = {
      read: { users: [], groups: [] },
      write: { users: [], groups: [] },
      management: { users: [], groups: [] },
      library_read: { users: [], groups: [] },
      library_write: { users: [], groups: [] },
    };

    expect(convertToFullPermissions(partialPermissions)).toEqual(expectedFullPermissions);
  });
});
