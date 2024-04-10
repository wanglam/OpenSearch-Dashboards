/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedObject } from 'opensearch-dashboards/server';
import {
  extractVegaSpecFromSavedObject,
  updateDataSourceNameInVegaSpec,
} from '../../../../../../core/server';

const cloneDeep = <T extends unknown>(payload: T): T => JSON.parse(JSON.stringify(payload));

const withPrefix = (...args: Array<string | undefined>) => (id: string) => {
  const prefix = args.filter(Boolean).join('_');
  if (prefix) {
    return `${prefix}_${id}`;
  }
  return id;
};

export const addPrefixTo = (id: string) => (...args: Array<string | undefined>) => {
  return withPrefix(...args)(id);
};

const overrideSavedObjectId = (savedObject: SavedObject, idGenerator: (id: string) => string) => {
  savedObject.id = idGenerator(savedObject.id);
  // update reference
  if (savedObject.type === 'dashboard') {
    savedObject.references.map((reference) => {
      if (reference.id) {
        reference.id = idGenerator(reference.id);
      }
    });
  }

  // update reference
  if (savedObject.type === 'visualization' || savedObject.type === 'search') {
    const searchSourceString = savedObject.attributes?.kibanaSavedObjectMeta?.searchSourceJSON;
    const visStateString = savedObject.attributes?.visState;

    if (searchSourceString) {
      const searchSource = JSON.parse(searchSourceString);
      if (searchSource.index) {
        searchSource.index = idGenerator(searchSource.index);
        savedObject.attributes.kibanaSavedObjectMeta.searchSourceJSON = JSON.stringify(
          searchSource
        );
      }
    }

    if (visStateString) {
      const visState = JSON.parse(visStateString);
      const controlList = visState.params?.controls;
      if (controlList) {
        controlList.map((control) => {
          if (control.indexPattern) {
            control.indexPattern = idGenerator(control.indexPattern);
          }
        });
      }
      savedObject.attributes.visState = JSON.stringify(visState);
    }
  }
};

export const getDataSourceIntegratedSavedObjects = (
  savedObjectList: SavedObject[],
  dataSourceId?: string,
  dataSourceTitle?: string
): SavedObject[] => {
  savedObjectList = cloneDeep(savedObjectList);
  if (dataSourceId) {
    return savedObjectList.map((savedObject) => {
      overrideSavedObjectId(savedObject, withPrefix(dataSourceId));

      // update reference
      if (savedObject.type === 'index-pattern') {
        savedObject.references = [
          {
            id: `${dataSourceId}`,
            type: 'data-source',
            name: 'dataSource',
          },
        ];
      }

      if (dataSourceTitle) {
        if (
          savedObject.type === 'dashboard' ||
          savedObject.type === 'visualization' ||
          savedObject.type === 'search'
        ) {
          savedObject.attributes.title = savedObject.attributes.title + `_${dataSourceTitle}`;
        }

        if (saveObject.type === 'visualization') {
          const vegaSpec = extractVegaSpecFromSavedObject(saveObject);

          if (!!vegaSpec) {
            const updatedVegaSpec = updateDataSourceNameInVegaSpec({
              spec: vegaSpec,
              newDataSourceName: dataSourceTitle,
              // Spacing of 1 prevents the Sankey visualization in logs data from exceeding the default url length and breaking
              spacing: 1,
            });

            // @ts-expect-error
            const visStateObject = JSON.parse(saveObject.attributes?.visState);
            visStateObject.params.spec = updatedVegaSpec;

            // @ts-expect-error
            saveObject.attributes.visState = JSON.stringify(visStateObject);
            saveObject.references.push({
              id: `${dataSourceId}`,
              type: 'data-source',
              name: 'dataSource',
            });
          }
        }
      }

      return savedObject;
    });
  }

  return savedObjectList;
};

export const getWorkspaceIntegratedSavedObjects = (
  savedObjectList: SavedObject[],
  workspaceId?: string
) => {
  const savedObjectListCopy = cloneDeep(savedObjectList);

  savedObjectListCopy.forEach((savedObject) => {
    overrideSavedObjectId(savedObject, withPrefix(workspaceId));
  });
  return savedObjectListCopy;
};
