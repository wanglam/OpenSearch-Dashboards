/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import { i18n } from '@osd/i18n';
import {
  EuiCheckableCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiText,
  EuiButton,
  EuiLink,
} from '@elastic/eui';

import { ALL_USE_CASE_ID } from '../../../../../core/public';
import { WorkspaceUseCase as WorkspaceUseCaseObject } from '../../types';
import { WorkspaceFormErrors } from './types';
import './workspace_use_case.scss';

interface WorkspaceUseCaseCardProps {
  id: string;
  title: string;
  checked: boolean;
  description: string;
  features: { id: string; title?: string }[];
  onChange: (id: string) => void;
}

const WorkspaceUseCaseCard = ({
  id,
  title,
  features,
  description,
  checked,
  onChange,
}: WorkspaceUseCaseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = useCallback(() => {
    onChange(id);
  }, [id, onChange]);
  const toggleExpanded = useCallback(() => {
    setIsExpanded((flag) => !flag);
  }, []);
  return (
    <EuiCheckableCard
      id={id}
      checkableType="radio"
      style={{ height: '100%' }}
      label={title}
      checked={checked}
      className="workspace-use-case-item"
      onChange={handleChange}
      data-test-subj={`workspaceUseCase-${id}`}
    >
      <EuiText size="xs">{description}</EuiText>
      {features.length > 0 && (
        <EuiText size="xs">
          {isExpanded && (
            <>
              {i18n.translate('workspace.form.useCase.featureExpandedTitle', {
                defaultMessage: 'Feature includes:',
              })}
              <ul style={{ marginBottom: 0 }}>
                {features.map(({ id, title }) => (
                  <li key={id}>{title}</li>
                ))}
              </ul>
            </>
          )}
          <EuiLink onClick={toggleExpanded} color="text">
            <u>
              {isExpanded
                ? i18n.translate('workspace.form.useCase.showLessButton', {
                    defaultMessage: 'See less....',
                  })
                : i18n.translate('workspace.form.useCase.showMoreButton', {
                    defaultMessage: 'See more....',
                  })}
            </u>
          </EuiLink>
        </EuiText>
      )}
    </EuiCheckableCard>
  );
};

export interface WorkspaceUseCaseProps {
  value: string | undefined;
  onChange: (newValue: string) => void;
  formErrors: WorkspaceFormErrors;
  availableUseCases: Array<
    Pick<WorkspaceUseCaseObject, 'id' | 'title' | 'features' | 'description' | 'systematic'>
  >;
}

export const WorkspaceUseCase = ({
  value,
  onChange,
  formErrors,
  availableUseCases,
}: WorkspaceUseCaseProps) => {
  return (
    <EuiCompressedFormRow
      label={i18n.translate('workspace.form.workspaceUseCase.name.label', {
        defaultMessage: 'Use case',
      })}
      isInvalid={!!formErrors.features}
      error={formErrors.features?.message}
      fullWidth
    >
      <EuiFlexGroup direction="column">
        {availableUseCases
          .filter((item) => !item.systematic || item.id === ALL_USE_CASE_ID)
          .map(({ id, title, features, description }) => (
            <EuiFlexItem key={id}>
              <WorkspaceUseCaseCard
                id={id}
                title={title}
                description={description}
                checked={value === id}
                features={features}
                onChange={onChange}
              />
            </EuiFlexItem>
          ))}
      </EuiFlexGroup>
    </EuiCompressedFormRow>
  );
};
