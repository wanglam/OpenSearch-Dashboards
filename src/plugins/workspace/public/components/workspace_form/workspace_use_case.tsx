/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { PublicAppInfo } from 'opensearch-dashboards/public';
import { EuiCheckableCard, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';

import { WORKSPACE_USE_CASES } from '../../../common/constants';
import './workspace_use_case.scss';

const ALL_USE_CASES = [
  WORKSPACE_USE_CASES.observability,
  WORKSPACE_USE_CASES.analytics,
  WORKSPACE_USE_CASES['security-analytics'],
  WORKSPACE_USE_CASES.search,
];

export interface WorkspaceUseCaseProps {
  configurableApps?: PublicAppInfo[];
  value: string[];
  onChange: (newValue: string[]) => void;
}

export const WorkspaceUseCase = ({ configurableApps, value, onChange }: WorkspaceUseCaseProps) => {
  const availableUseCases = useMemo(() => {
    if (!configurableApps) {
      return [];
    }
    const configurableAppsId = configurableApps.map((app) => app.id);
    return ALL_USE_CASES.filter((useCase) => {
      return useCase.features.some((featureId) => configurableAppsId.includes(featureId));
    });
  }, [configurableApps]);

  return (
    <EuiFlexGroup>
      {availableUseCases.map(({ id, title, description }) => (
        <EuiFlexItem key={id}>
          <EuiCheckableCard
            id={id}
            checkableType="checkbox"
            style={{ height: '100%' }}
            label={title}
            checked={value.includes(id)}
            className="workspace-use-case-item"
            onChange={() => {
              if (!value.includes(id)) {
                onChange([...value, id]);
                return;
              }
              onChange(value.filter((item) => item !== id));
            }}
            data-test-subj={`workspaceUseCase-${id}`}
          >
            {description}
          </EuiCheckableCard>
        </EuiFlexItem>
      ))}
    </EuiFlexGroup>
  );
};
