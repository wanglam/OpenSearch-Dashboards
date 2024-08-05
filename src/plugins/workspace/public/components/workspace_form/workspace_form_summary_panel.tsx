/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import {
  EuiSmallButtonEmpty,
  EuiCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiSpacer,
  EuiText,
  EuiTextColor,
  EuiLink,
} from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { WorkspaceFormSubmitData } from './types';
import { WorkspaceUseCase } from '../../types';
import { RightSidebarScrollField, RIGHT_SIDEBAR_SCROLL_KEY } from './utils';

const SummaryItem = ({
  scrollField,
  title,
  children,
  bottomGap = true,
}: React.PropsWithChildren<{
  scrollField: RightSidebarScrollField;
  title: string;
  bottomGap?: boolean;
}>) => {
  const handleTitleClick = useCallback(() => {
    const element = document.querySelector(
      `.workspaceCreateFormContainer [${RIGHT_SIDEBAR_SCROLL_KEY}="${scrollField}"]`
    );

    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [scrollField]);

  return (
    <>
      <EuiText size="xs">
        <h5>
          <EuiLink color="text" onClick={handleTitleClick}>
            <u>{title}</u>
          </EuiLink>
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
        scrollField={RightSidebarScrollField.UseCase}
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
        scrollField={RightSidebarScrollField.Name}
      >
        {formData.name}
      </SummaryItem>
      <SummaryItem
        title={i18n.translate('workspace.form.summary.panel.description.title', {
          defaultMessage: 'Description',
        })}
        scrollField={RightSidebarScrollField.Description}
      >
        {formData.description?.trim()}
      </SummaryItem>
      <SummaryItem
        title={i18n.translate('workspace.form.summary.panel.color.title', {
          defaultMessage: 'Accent color',
        })}
        scrollField={RightSidebarScrollField.Color}
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
        scrollField={RightSidebarScrollField.DataSource}
      />
      <SummaryItem
        title={i18n.translate('workspace.form.summary.panel.members.title', {
          defaultMessage: 'Members',
        })}
        bottomGap={false}
        scrollField={RightSidebarScrollField.Member}
      />
    </EuiCard>
  );
};
