/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Fragment, useEffect, useMemo, useState } from 'react';
import React from 'react';
import {
  EuiText,
  EuiModal,
  EuiButton,
  EuiModalBody,
  EuiSelectable,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSelectableOption,
} from '@elastic/eui';
import { FormattedMessage } from 'react-intl';
import { getDataSourcesConnections, getDataSourcesList } from '../../utils';
import { DataSource } from '../../../common/types';
import { SavedObjectsStart } from '../../../../../core/public';
import { useOpenSearchDashboards } from '../../../../opensearch_dashboards_react/public';

export interface AssociationDataSourceModalProps {
  savedObjects: SavedObjectsStart;
  assignedDataSources: DataSource[];
  closeModal: () => void;
  handleAssignDataSources: (dataSources: DataSource[]) => Promise<void>;
}

export const AssociationDataSourceModal = ({
  closeModal,
  savedObjects,
  assignedDataSources,
  handleAssignDataSources,
}: AssociationDataSourceModalProps) => {
  const {
    services: { http },
  } = useOpenSearchDashboards();
  const [options, setOptions] = useState<EuiSelectableOption[]>([]);
  const [allDataSources, setAllDataSources] = useState<DataSource[]>([]);

  useEffect(() => {
    getDataSourcesList(savedObjects.client, ['*']).then((result) => {
      const filteredDataSources = result.filter(
        ({ id }: DataSource) => !assignedDataSources.some((ds) => ds.id === id)
      );
      setAllDataSources(filteredDataSources);
      setOptions(
        filteredDataSources.map((dataSource) => ({
          label: dataSource.title,
          key: dataSource.id,
        }))
      );
    });
  }, [assignedDataSources, savedObjects]);

  useEffect(() => {
    const allDataSourcesIds = allDataSources.map(({ id }) => id);
    if (allDataSourcesIds.length === 0 || !http) {
      return;
    }
    getDataSourcesConnections(http, allDataSourcesIds).then((connections) => {
      console.log(connections);
    });
  }, [allDataSources]);

  const selectedDataSources = useMemo(() => {
    const selectedIds = options
      .filter((option: EuiSelectableOption) => option.checked)
      .map((option: EuiSelectableOption) => option.key);

    return allDataSources.filter((ds) => selectedIds.includes(ds.id));
  }, [options, allDataSources]);

  return (
    <EuiModal onClose={closeModal}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <h1>
            <FormattedMessage
              id="workspace.detail.dataSources.associateModal.title"
              defaultMessage="Associate OpenSearch connections"
            />
          </h1>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiText size="s" color="subdued">
          <FormattedMessage
            id="workspace.detail.dataSources.associateModal.message"
            defaultMessage="Add OpenSearch connections that will be available in the workspace."
          />
        </EuiText>
        <EuiSelectable
          aria-label="Searchable"
          searchable
          listProps={{ bordered: true }}
          searchProps={{
            'data-test-subj': 'workspace-detail-dataSources-associateModal-search',
          }}
          options={options}
          onChange={(newOptions) => setOptions(newOptions)}
        >
          {(list, search) => (
            <Fragment>
              {search}
              {list}
            </Fragment>
          )}
        </EuiSelectable>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButton onClick={closeModal} fill>
          <FormattedMessage
            id="workspace.detail.dataSources.associateModal.close.button"
            defaultMessage="Close"
          />
        </EuiButton>
        <EuiButton
          onClick={() => handleAssignDataSources(selectedDataSources)}
          isDisabled={!selectedDataSources || selectedDataSources.length === 0}
          fill
        >
          <FormattedMessage
            id="workspace.detail.dataSources.associateModal.save.button"
            defaultMessage="Save changes"
          />
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
};
