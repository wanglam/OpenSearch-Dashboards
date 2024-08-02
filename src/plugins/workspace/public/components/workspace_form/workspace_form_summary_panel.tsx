/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiSpacer,
  EuiText,
  EuiTextColor,
} from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { WorkspaceFormSubmitData } from './types';
import { WorkspaceUseCase } from '../../types';

const SummaryItem = ({
  id,
  title,
  children,
  bottomGap = true,
}: React.PropsWithChildren<{ id?: string; title: string; bottomGap?: boolean }>) => {
  return (
    <>
      <EuiText size="xs">
        <h5>
          <u>{title}</u>
        </h5>
      </EuiText>
      <EuiSpacer size="xs" />
      <EuiText size="xs">
        {children ?? (
          <EuiTextColor color="subdued">
            {i18n.translate('workspace.form.summary.panel.useCase.noneValue', {
              defaultMessage: 'None',
            })}
          </EuiTextColor>
        )}
      </EuiText>
      {bottomGap && (
        <>
          <EuiSpacer size="s" />
          <EuiSpacer size="xs" />
        </>
      )}
    </>
  );
};

interface WorkspaceFormSummaryPanelProps {
  formData: Partial<WorkspaceFormSubmitData & { useCase: string }>;
  availableUseCases: WorkspaceUseCase[];
}

export const WorkspaceFormSummaryPanel = ({
  formData,
  availableUseCases,
}: WorkspaceFormSummaryPanelProps) => {
  const useCase = availableUseCases.find((item) => item.id === formData.useCase);
  return (
    <EuiCard
      title={i18n.translate('workspace.form.summary.panel.title', { defaultMessage: 'Summary' })}
      textAlign="left"
      titleSize="xs"
    >
      <SummaryItem
        title={i18n.translate('workspace.form.summary.panel.useCase.title', {
          defaultMessage: 'Use case',
        })}
      >
        {useCase && (
          <>
            {useCase.title}
            <br />
            {useCase.description}
          </>
        )}
      </SummaryItem>
      <SummaryItem
        title={i18n.translate('workspace.form.summary.panel.name.title', {
          defaultMessage: 'Name',
        })}
      >
        {formData.name}
      </SummaryItem>
      <SummaryItem
        title={i18n.translate('workspace.form.summary.panel.description.title', {
          defaultMessage: 'Description',
        })}
      >
        {formData.description?.trim()}
      </SummaryItem>
      <SummaryItem
        title={i18n.translate('workspace.form.summary.panel.color.title', {
          defaultMessage: 'Accent color',
        })}
      >
        {formData.color && (
          <EuiFlexGroup gutterSize="xs" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiIcon type="swatchInput" color={formData.color} />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">{formData.color}</EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
      </SummaryItem>
      <SummaryItem
        title={i18n.translate('workspace.form.summary.panel.dataSources.title', {
          defaultMessage: 'Data sources',
        })}
      />
      <SummaryItem
        title={i18n.translate('workspace.form.summary.panel.members.title', {
          defaultMessage: 'Members',
        })}
        bottomGap={false}
      />
    </EuiCard>
  );
};
