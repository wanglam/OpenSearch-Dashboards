/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedObject } from 'opensearch-dashboards/server';

const generateIdWithPrefix = (id: string, prefix?: string) => {
  return [...(prefix ? [prefix] : []), id].join('_');
};

export const appendDataSourceId = (id: string) => {
  return (dataSourceId?: string) => generateIdWithPrefix(id, dataSourceId);
};

const overrideSavedObjectId = (saveObject: SavedObject, idGenerator: (id: string) => string) => {
  saveObject.id = idGenerator(saveObject.id);
  // update reference
  if (saveObject.type === 'dashboard') {
    saveObject.references.map((reference) => {
      if (reference.id) {
        reference.id = idGenerator(reference.id);
      }
    });
  }

  // update reference
  if (saveObject.type === 'visualization' || saveObject.type === 'search') {
    const searchSourceString = saveObject.attributes?.kibanaSavedObjectMeta?.searchSourceJSON;
    const visStateString = saveObject.attributes?.visState;

    if (searchSourceString) {
      const searchSource = JSON.parse(searchSourceString);
      if (searchSource.index) {
        searchSource.index = idGenerator(searchSource.index);
        saveObject.attributes.kibanaSavedObjectMeta.searchSourceJSON = JSON.stringify(searchSource);
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
      saveObject.attributes.visState = JSON.stringify(visState);
    }
  }
};

export const getSavedObjectsWithDataSource = (
  saveObjectList: SavedObject[],
  dataSourceId?: string,
  dataSourceTitle?: string
): SavedObject[] => {
  if (dataSourceId) {
    const idGeneratorWithDataSource = (id: string) => generateIdWithPrefix(id, dataSourceId);
    return saveObjectList.map((saveObject) => {
      overrideSavedObjectId(saveObject, idGeneratorWithDataSource);

      // update reference
      if (saveObject.type === 'index-pattern') {
        saveObject.references = [
          {
            id: `${dataSourceId}`,
            type: 'data-source',
            name: 'dataSource',
          },
        ];
      }

      if (dataSourceTitle) {
        if (
          saveObject.type === 'dashboard' ||
          saveObject.type === 'visualization' ||
          saveObject.type === 'search'
        ) {
          saveObject.attributes.title = saveObject.attributes.title + `_${dataSourceTitle}`;
        }
      }

      return saveObject;
    });
  }

  return saveObjectList;
};

export const appendWorkspaceId = (id: string) => (workspaceId?: string) =>
  generateIdWithPrefix(id, workspaceId);

export const appendWorkspaceAndDataSourceId = (id: string) => (workspaceId?: string) => (
  dataSourceId?: string
) => appendDataSourceId(appendWorkspaceId(id)(workspaceId))(dataSourceId);

export const enhanceGetSavedObjectsWithWorkspaceAndDataSource = (
  getSavedObjects: () => SavedObject[]
) => (workspaceId?: string) => (dataSourceId?: string, dataSourceTitle?: string) => {
  const idGeneratorWithWorkspace = (id: string) => generateIdWithPrefix(id, workspaceId);
  const savedObjects = workspaceId
    ? getSavedObjects().map((item) => {
        overrideSavedObjectId(item, idGeneratorWithWorkspace);
        return item;
      })
    : getSavedObjects();
  if (!dataSourceId) {
    return savedObjects;
  }
  return getSavedObjectsWithDataSource(savedObjects, dataSourceId, dataSourceTitle);
};
