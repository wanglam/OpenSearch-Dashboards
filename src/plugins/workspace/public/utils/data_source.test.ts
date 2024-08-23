/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { coreMock } from '../../../../core/public/mocks';
import { SigV4ServiceName } from '../../../../plugins/data_source/common/data_sources';
import { getDataSourcesList, getIsOnlyAllowEssentialUseCase } from './data_source';

const startMock = coreMock.createStart();

describe('workspace utils: getDataSourcesList', () => {
  const mockedSavedObjectClient = startMock.savedObjects.client;

  it('should return result when passed saved object client', async () => {
    mockedSavedObjectClient.find = jest.fn().mockResolvedValue({
      savedObjects: [
        {
          id: 'id1',
          get: (param: string) => {
            switch (param) {
              case 'title':
                return 'title1';
              case 'description':
                return 'description1';
              case 'dataSourceEngineType':
                return 'dataSourceEngineType1';
              case 'auth':
                return 'mock_value';
            }
          },
        },
      ],
    });
    expect(await getDataSourcesList(mockedSavedObjectClient, [])).toStrictEqual([
      {
        id: 'id1',
        title: 'title1',
        auth: 'mock_value',
        description: 'description1',
        dataSourceEngineType: 'dataSourceEngineType1',
      },
    ]);
  });

  it('should return empty array if no saved objects responded', async () => {
    mockedSavedObjectClient.find = jest.fn().mockResolvedValue({});
    expect(await getDataSourcesList(mockedSavedObjectClient, [])).toStrictEqual([]);
  });
});

describe('workspace utils: getIsOnlyAllowEssentialUseCase', () => {
  const mockedSavedObjectClient = startMock.savedObjects.client;

  it('should return true when all data sources are serverless', async () => {
    mockedSavedObjectClient.find = jest.fn().mockResolvedValue({
      savedObjects: [
        {
          id: 'id1',
          get: () => {
            return {
              credentials: {
                service: SigV4ServiceName.OpenSearchServerless,
              },
            };
          },
        },
      ],
    });
    expect(await getIsOnlyAllowEssentialUseCase(mockedSavedObjectClient)).toBe(true);
  });

  it('should return false when not all data sources are serverless', async () => {
    mockedSavedObjectClient.find = jest.fn().mockResolvedValue({
      savedObjects: [
        {
          id: 'id1',
          get: () => {
            return {
              credentials: {
                service: SigV4ServiceName.OpenSearchServerless,
              },
            };
          },
        },
        {
          id: 'id2',
          get: () => {
            return {
              credentials: {
                service: SigV4ServiceName.OpenSearch,
              },
            };
          },
        },
      ],
    });
    expect(await getIsOnlyAllowEssentialUseCase(mockedSavedObjectClient)).toBe(false);
  });
});
