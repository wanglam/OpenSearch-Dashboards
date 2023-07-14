/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { isFeatureDependOnSelectedFeatures, getFinalFeatureIdsByDependency } from './feature';

describe('feature utils', () => {
  describe('isFeatureDependOnSelectedFeatures', () => {
    it('should return true', () => {
      expect(isFeatureDependOnSelectedFeatures('a', ['b'], { b: ['a'] })).toBe(true);
      expect(isFeatureDependOnSelectedFeatures('a', ['b'], { b: ['a', 'c'] })).toBe(true);
    });
    it('should return false', () => {
      expect(isFeatureDependOnSelectedFeatures('a', ['b'], { b: ['c'] })).toBe(false);
      expect(isFeatureDependOnSelectedFeatures('a', ['b'], {})).toBe(false);
    });
  });

  describe('getFinalFeatureIdsByDependency', () => {
    it('should return consistent feature ids', () => {
      expect(getFinalFeatureIdsByDependency(['a'], { a: ['b'] }, ['c', 'd'])).toStrictEqual([
        'c',
        'd',
        'a',
        'b',
      ]);
      expect(getFinalFeatureIdsByDependency(['a'], { a: ['b', 'e'] }, ['c', 'd'])).toStrictEqual([
        'c',
        'd',
        'a',
        'b',
        'e',
      ]);
    });
  });
});
