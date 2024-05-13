/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { EuiText, EuiPanel, EuiCollapsibleNavGroup, EuiListGroup } from '@elastic/eui';

import { WorkspaceFeatureGroup } from '../workspace_form/types';

interface WorkspacePreviewMenuPanelProps {
  selectedFeatures: string[];
  featureGroups: WorkspaceFeatureGroup[];
}

export const WorkspacePreviewMenuPanel = ({
  selectedFeatures,
  featureGroups,
}: WorkspacePreviewMenuPanelProps) => {
  const menuGroups = useMemo(() => {
    const result: Array<{ title: string; listItems: { label: string }[] }> = [];
    featureGroups.forEach((featureGroup) => {
      const features = featureGroup.features.filter((feature) =>
        selectedFeatures.includes(feature.id)
      );
      if (features.length > 0) {
        result.push({
          title: featureGroup.name,
          listItems: features.map((feature) => ({ label: feature.name })),
        });
      }
    });
    return result;
  }, [featureGroups, selectedFeatures]);
  return (
    <EuiPanel paddingSize="l" color="subdued">
      <EuiText textAlign="center">preview your workspace navigation menu</EuiText>
      <div>
        {menuGroups.map((group) => (
          <EuiCollapsibleNavGroup
            title={group.title}
            style={{ background: 'white' }}
            isCollapsible
            initialIsOpen
          >
            <EuiListGroup
              listItems={group.listItems}
              maxWidth="none"
              color="subdued"
              gutterSize="none"
              size="s"
            />
          </EuiCollapsibleNavGroup>
        ))}
      </div>
    </EuiPanel>
  );
};
