/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonIcon,
  EuiFieldText,
  EuiButtonGroup,
  EuiText,
} from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { WorkspacePermissionMode } from '../../../common/constants';
import {
  WorkspacePermissionItemType,
  optionIdToWorkspacePermissionModesMap,
  PERMISSION_COLLABORATOR_LABEL_ID,
  permissionModeOptions,
} from './constants';
import { getPermissionModeId } from './utils';

export interface WorkspacePermissionSettingInputProps {
  index: number;
  type: WorkspacePermissionItemType;
  userId?: string;
  group?: string;
  modes?: WorkspacePermissionMode[];
  readOnly?: boolean;
  deletable?: boolean;
  userOrGroupDisabled: boolean;
  onGroupOrUserIdChange: (
    id:
      | { type: WorkspacePermissionItemType.User; userId?: string }
      | { type: WorkspacePermissionItemType.Group; group?: string },
    index: number
  ) => void;
  onPermissionModesChange: (modes: WorkspacePermissionMode[], index: number) => void;
  onTypeChange: (
    type: WorkspacePermissionItemType.User | WorkspacePermissionItemType.Group,
    index: number
  ) => void;
  onDelete: (index: number) => void;
  userOrGroupPlaceholder?: string;
}

const accessLevelButtonGroupOptions = permissionModeOptions.map((option) => ({
  id: option.value,
  label: <EuiText size="xs">{option.inputDisplay}</EuiText>,
}));

export const WorkspacePermissionSettingInput = ({
  index,
  type,
  userId,
  group,
  modes,
  readOnly = false,
  deletable = true,
  userOrGroupDisabled,
  onDelete,
  onGroupOrUserIdChange,
  onPermissionModesChange,
  userOrGroupPlaceholder,
}: WorkspacePermissionSettingInputProps) => {
  const permissionModesSelected = useMemo(() => getPermissionModeId(modes ?? []), [modes]);

  const handleGroupOrUserIdChange = useCallback(
    (event) => {
      const groupOrUserId = event.target.value;
      onGroupOrUserIdChange(
        type === WorkspacePermissionItemType.Group
          ? { type, group: groupOrUserId }
          : { type, userId: groupOrUserId },
        index
      );
    },
    [index, type, onGroupOrUserIdChange]
  );

  const handlePermissionModeOptionChange = useCallback(
    (id: string) => {
      if (optionIdToWorkspacePermissionModesMap[id]) {
        onPermissionModesChange([...optionIdToWorkspacePermissionModesMap[id]], index);
      }
    },
    [index, onPermissionModesChange]
  );

  const handleDelete = useCallback(() => {
    onDelete(index);
  }, [index, onDelete]);

  return (
    <EuiFlexGroup alignItems="center" gutterSize="s">
      <EuiFlexItem>
        <EuiFieldText
          compressed={true}
          disabled={userOrGroupDisabled}
          readOnly={readOnly}
          onChange={handleGroupOrUserIdChange}
          value={(type === WorkspacePermissionItemType.User ? userId : group) ?? ''}
          data-test-subj="workspaceFormUserIdOrGroupInput"
          placeholder={userOrGroupPlaceholder}
          aria-labelledby={PERMISSION_COLLABORATOR_LABEL_ID}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButtonGroup
          options={accessLevelButtonGroupOptions}
          legend={i18n.translate('workspace.form.permissionSettingInput.accessLevelLegend', {
            defaultMessage: 'This is a access level button group',
          })}
          buttonSize="compressed"
          type="single"
          idSelected={permissionModesSelected}
          onChange={handlePermissionModeOptionChange}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        {deletable && !readOnly && (
          <EuiButtonIcon
            color="danger"
            aria-label="Delete permission setting"
            iconType="trash"
            display="empty"
            size="xs"
            onClick={handleDelete}
            isDisabled={!deletable}
          />
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
