/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { HttpStart, SavedObjectsStart } from '../../../../core/public';
import { SigV4ServiceName } from '../../../../plugins/data_source/common/data_sources';
import { DataSourceConnection, DataSourceConnectionType } from '../types';

export const getDataSourcesList = (client: SavedObjectsStart['client'], workspaces: string[]) => {
  return client
    .find({
      type: 'data-source',
      fields: ['id', 'title', 'auth', 'description', 'dataSourceEngineType'],
      perPage: 10000,
      workspaces,
    })
    .then((response) => {
      const objects = response?.savedObjects;
      if (objects) {
        return objects.map((source) => {
          const id = source.id;
          const title = source.get('title');
          const auth = source.get('auth');
          const description = source.get('description');
          const dataSourceEngineType = source.get('dataSourceEngineType');
          return {
            id,
            title,
            auth,
            description,
            dataSourceEngineType,
          };
        });
      } else {
        return [];
      }
    });
};

// If all connected data sources are serverless, will only allow to select essential use case.
export const getIsOnlyAllowEssentialUseCase = async (client: SavedObjectsStart['client']) => {
  const allDataSources = await getDataSourcesList(client, ['*']);
  if (allDataSources.length > 0) {
    return allDataSources.every(
      (ds) => ds?.auth?.credentials?.service === SigV4ServiceName.OpenSearchServerless
    );
  }
  return false;
};

const getDataSourceConnection = async (
  http: HttpStart,
  dataSourceId: string
): Promise<DataSourceConnection[]> => {
  let payload;
  try {
    payload = await http.get(`/api/directquery/dataconnections/dataSourceMDSId=${dataSourceId}`);
  } catch (e) {
    return [];
  }
  return payload.map(({ name, description, connector }) => ({
    id: `${dataSourceId}-${name}`,
    name,
    description,
    type: connector,
    parentId: dataSourceId,
    connectionType: DataSourceConnectionType.DirectQueryConnection,
  }));
};

export const getDataSourcesConnections = async (http: HttpStart, dataSourceIds: string[]) => {
  const connections: DataSourceConnection[] = [];
  const chunkSize = Math.max(Math.min(3, dataSourceIds.length), 1);
  const groupDataSourceIds = [];

  for (let i = 0; i < dataSourceIds.length; i += chunkSize) {
    groupDataSourceIds.push(dataSourceIds.slice(i, i + chunkSize));
  }
  for (let i = 0; i < groupDataSourceIds.length; i++) {
    const results = await Promise.all(
      groupDataSourceIds[i].map((dataSourceId) => getDataSourceConnection(http, dataSourceId))
    );
    results.forEach((payload) => {
      payload.forEach((connection) => {
        connections.push(connection);
      });
    });
  }
  return connections;
};
