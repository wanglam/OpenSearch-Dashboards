/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  EuiText,
  EuiTitle,
  EuiCheckableCard,
  htmlIdGenerator,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
} from '@elastic/eui';
import { BehaviorSubject, of } from 'rxjs';
import { PublicAppInfo } from 'opensearch-dashboards/public';
import { useObservable } from 'react-use';

import { workspacePresetData, CUSTOM_PRESET_ID } from './workspace_preset_data';
import {
  isWorkspaceFeatureGroup,
  convertApplicationsToFeaturesOrGroups,
} from '../workspace_form/utils';
import './workspace_presets.scss';
import { WorkspaceFeature, WorkspaceFeatureGroup } from '../workspace_form/types';

const EMPTY_ARRAY: PublicAppInfo[] = [];

export interface WorkspacePresetsProps {
  workspaceConfigurableApps$?: BehaviorSubject<PublicAppInfo[]>;
}

export const WorkspacePresets = ({ workspaceConfigurableApps$ }: WorkspacePresetsProps) => {
  const [selectedPreset, setSelectedPreset] = useState<string>();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const configurableApps = useObservable(workspaceConfigurableApps$ ?? of(EMPTY_ARRAY));
  const featureGroups = useMemo(() => {
    if (!configurableApps) {
      return [];
    }
    const featuresOrGroups = convertApplicationsToFeaturesOrGroups(configurableApps);
    const featureGroups = featuresOrGroups.filter((featureOrGroup) =>
      isWorkspaceFeatureGroup(featureOrGroup)
    ) as WorkspaceFeatureGroup[];
    const features = featuresOrGroups.filter(
      (featureOrGroup) => !isWorkspaceFeatureGroup(featureOrGroup)
    ) as WorkspaceFeature[];
    return [
      ...featureGroups,
      ...(features.length > 0 ? [{ name: 'Uncategorized', features }] : []),
    ];
  }, [configurableApps]);

  return (
    <EuiPage>
      <EuiPageBody panelled>
        <EuiTitle>
          <h2>first, select the focus for your workspace</h2>
        </EuiTitle>
        <EuiText>
          what kind of work will you be doing here? adding or removing features will not impact you
          or your collaborator’s access to data.
        </EuiText>
        <EuiText>use cases</EuiText>
        <EuiFlexGroup gutterSize="l">
          {workspacePresetData.map((item) => (
            <EuiFlexItem key={item.id}>
              <EuiCheckableCard
                style={{ height: '100%' }}
                id={htmlIdGenerator()()}
                label={item.title}
                checked={item.id === selectedPreset}
                onChange={() => {
                  setSelectedPreset(item.id);
                  if (item.id !== CUSTOM_PRESET_ID) {
                    const apps = configurableApps?.filter((app) => item.features?.includes(app.id));
                    setSelectedFeatures(apps?.map((item) => item.id) || []);
                  }
                }}
                className="workspace-preset-use-case-item"
              >
                {item.description}
              </EuiCheckableCard>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
        <EuiText>features</EuiText>
        <EuiFlexGroup gutterSize="l" direction="column">
          {featureGroups.map((group) => (
            <EuiFlexItem key={group.name}>
              <EuiText>{group.name}</EuiText>
              <EuiFlexGrid columns={2}>
                {group.features.map((feature) => (
                  <EuiFlexItem key={feature.id}>
                    <EuiCheckableCard
                      id={htmlIdGenerator()()}
                      label={feature.name}
                      checkableType="checkbox"
                      checked={selectedFeatures.includes(feature.id)}
                      onChange={() => {
                        setSelectedFeatures(
                          selectedFeatures.includes(feature.id)
                            ? selectedFeatures.filter((item) => item != feature.id)
                            : [...selectedFeatures, feature.id]
                        );
                        if (selectedPreset !== CUSTOM_PRESET_ID) {
                          setSelectedPreset(CUSTOM_PRESET_ID);
                        }
                      }}
                    />
                  </EuiFlexItem>
                ))}
              </EuiFlexGrid>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
      </EuiPageBody>
    </EuiPage>
  );
};
