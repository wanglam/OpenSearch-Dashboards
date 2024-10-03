/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiButton,
  EuiCheckableCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import React, { useState } from 'react';
import { i18n } from '@osd/i18n';

import { WorkspaceCollaboratorType } from '../../services';
import {
  WorkspaceFormDataState,
  WorkspacePermissionItemType,
  WorkspacePermissionSetting,
  WorkspacePermissionSettingPanel,
} from '../workspace_form';

export enum AddCollaboratorModalMode {
  FormInput = 'AddCollaboratorFormInput',
  ImportCSV = 'AddCollaboratorImportCSV',
}

const addCollaboratorCards = [
  {
    id: AddCollaboratorModalMode.FormInput,
    label: i18n.translate('workspace.detail.addCollaboratorModal.enterIDsCard', {
      defaultMessage: 'Enter IDS',
    }),
  },
  {
    id: AddCollaboratorModalMode.ImportCSV,
    label: i18n.translate('workspace.detail.addCollaboratorModal.enterIDsCard', {
      defaultMessage: 'Import CSV',
    }),
  },
];

interface AddCollaboratorsModalProps {
  content: WorkspaceCollaboratorType;
  defaultMode: AddCollaboratorModalMode;
  onClose: () => void;
  onCollaboratorsAdded: (permissionSettings: WorkspacePermissionSetting[]) => void;
}

export const AddCollaboratorsModal = ({
  onClose,
  content,
  defaultMode,
  onCollaboratorsAdded,
}: AddCollaboratorsModalProps) => {
  const [mode, setMode] = useState(defaultMode);
  const [permissionSettings, setPermissionSettings] = useState<
    WorkspaceFormDataState['permissionSettings']
  >([{ id: 1, type: content.permissionSettingType as WorkspacePermissionItemType }]);

  return (
    <EuiModal style={{ minWidth: 748 }} onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <h2>{content.modal.title}</h2>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        {content.modal.description && (
          <>
            <EuiText size="xs">{content.modal.description}</EuiText>
            <EuiSpacer size="m" />
          </>
        )}
        {content.instruction && (
          <>
            <EuiAccordion
              id="workspace-details-add-collaborator-modal-instruction"
              buttonContent={<EuiText size="s">{content.instruction.title}</EuiText>}
            >
              <EuiSpacer size="xs" />
              <EuiSpacer size="s" />
              <EuiText size="xs">{content.instruction.detail}</EuiText>
            </EuiAccordion>
            <EuiHorizontalRule margin="xs" />
            <EuiSpacer size="s" />
          </>
        )}
        <EuiFlexGroup gutterSize="m">
          {addCollaboratorCards.map(({ id, label }) => (
            <EuiFlexItem style={{ maxWidth: '41.85%' }} key={id}>
              <EuiCheckableCard
                id={id}
                onChange={() => {
                  setMode(id);
                }}
                label={label}
                checked={id === mode}
                checkableType="radio"
              />
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        {mode === AddCollaboratorModalMode.FormInput && (
          <WorkspacePermissionSettingPanel
            permissionSettings={permissionSettings}
            disabledUserOrGroupInputIds={[]}
            userOrGroupLabel={
              content.modal.inputLabel ??
              i18n.translate('workspace.detail.addCollaboratorModal.userOrGroupLabel', {
                defaultMessage: '{name} ID',
                values: { name: content.name },
              })
            }
            onChange={setPermissionSettings}
            userOrGroupDescription={content.modal.inputDescription}
            userOrGroupPlaceholder={
              content.modal.inputPlaceholder ??
              i18n.translate('workspace.detail.addCollaboratorModal.userOrGroupPlaceholder', {
                defaultMessage: 'Enter {name} ID',
                values: { name: content.name },
              })
            }
            addAnotherButtonText={i18n.translate(
              'workspace.form.permissionSettingPanel.addCollaborator',
              {
                defaultMessage: 'Add another {name}',
                values: { name: content.name },
              }
            )}
          />
        )}
      </EuiModalBody>

      <EuiModalFooter>
        <EuiSmallButtonEmpty iconType="cross" onClick={onClose}>
          {i18n.translate('workspace.detail.addCollaboratorModal.addCollaboratorButton', {
            defaultMessage: 'Cancel',
          })}
        </EuiSmallButtonEmpty>

        <EuiSmallButton
          type="submit"
          onClick={() => {
            onCollaboratorsAdded(permissionSettings);
          }}
          fill
        >
          {i18n.translate('workspace.detail.addCollaboratorModal.addCollaboratorButton', {
            defaultMessage: 'Add collaborators',
          })}
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
};
