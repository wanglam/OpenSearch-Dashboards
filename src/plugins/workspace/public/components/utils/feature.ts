/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const isFeatureDependOnSelectedFeatures = (
  featureId: string,
  selectedFeatureIds: string[],
  featureDependencies: { [key: string]: string[] }
) =>
  selectedFeatureIds.some((selectedFeatureId) =>
    (featureDependencies[selectedFeatureId] || []).some((dependencies) =>
      dependencies.includes(featureId)
    )
  );

export const getFinalFeatureIdsByDependency = (
  featureIds: string[],
  featureDependencies: { [key: string]: string[] },
  oldFeatureIds: string[] = []
) =>
  Array.from(
    new Set([
      ...oldFeatureIds,
      ...featureIds.reduce(
        (pValue, featureId) => [...pValue, ...(featureDependencies[featureId] || [])],
        featureIds
      ),
    ])
  );
