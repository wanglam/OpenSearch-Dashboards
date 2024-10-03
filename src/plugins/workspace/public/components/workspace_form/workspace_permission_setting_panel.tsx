/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  EuiSmallButton,
  EuiCompressedFormRow,
  EuiFormLabel,
  EuiText,
  EuiSpacer,
} from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { WorkspaceFormError, WorkspacePermissionSetting } from './types';
import {
  WorkspacePermissionItemType,
  optionIdToWorkspacePermissionModesMap,
  PERMISSION_COLLABORATOR_LABEL_ID,
} from './constants';
import {
  WorkspacePermissionSettingInput,
  WorkspacePermissionSettingInputProps,
} from './workspace_permission_setting_input';
import { generateNextPermissionSettingsId } from './utils';
import { PermissionModeId } from '../../../../../core/public';

export interface WorkspacePermissionSettingPanelProps {
  errors?: { [key: number]: WorkspaceFormError };
  disabledUserOrGroupInputIds: number[];
  permissionSettings: Array<
    Pick<WorkspacePermissionSetting, 'id'> & Partial<WorkspacePermissionSetting>
  >;
  onChange?: (
    value: Array<Pick<WorkspacePermissionSetting, 'id'> & Partial<WorkspacePermissionSetting>>
  ) => void;
  readOnly?: boolean;
  userOrGroupLabel: string;
  userOrGroupDescription?: string;
  userOrGroupPlaceholder?: string;
  addAnotherButtonText: string;
}

export const WorkspacePermissionSettingPanel = ({
  errors,
  onChange,
  readOnly = false,
  permissionSettings,
  disabledUserOrGroupInputIds,
  userOrGroupLabel,
  userOrGroupDescription,
  userOrGroupPlaceholder,
  addAnotherButtonText,
}: WorkspacePermissionSettingPanelProps) => {
  const nextIdRef = useRef(generateNextPermissionSettingsId(permissionSettings));

  const handlePermissionSettingsChange = useCallback(
    (newSettings) => {
      onChange?.([...newSettings]);
    },
    [onChange]
  );

  const nextIdGenerator = useCallback(() => {
    const nextId = nextIdRef.current;
    nextIdRef.current++;
    return nextId;
  }, []);

  useEffect(() => {
    nextIdRef.current = Math.max(
      nextIdRef.current,
      generateNextPermissionSettingsId(permissionSettings)
    );
  }, [permissionSettings]);

  // default permission mode is read
  const handleAddNewOne = useCallback(() => {
    handlePermissionSettingsChange?.([
      ...permissionSettings,
      {
        id: nextIdGenerator(),
        type: WorkspacePermissionItemType.User,
        modes: optionIdToWorkspacePermissionModesMap[PermissionModeId.ReadOnly],
      },
    ]);
  }, [handlePermissionSettingsChange, permissionSettings, nextIdGenerator]);

  const handleDelete = useCallback(
    (index: number) => {
      handlePermissionSettingsChange?.(
        permissionSettings.filter((_item, itemIndex) => itemIndex !== index)
      );
    },
    [handlePermissionSettingsChange, permissionSettings]
  );

  const handlePermissionModesChange = useCallback<
    WorkspacePermissionSettingInputProps['onPermissionModesChange']
  >(
    (modes, index) => {
      handlePermissionSettingsChange?.(
        permissionSettings.map((item, itemIndex) =>
          index === itemIndex ? { ...item, modes } : item
        )
      );
    },
    [handlePermissionSettingsChange, permissionSettings]
  );

  const handleGroupOrUserIdChange = useCallback<
    WorkspacePermissionSettingInputProps['onGroupOrUserIdChange']
  >(
    (userOrGroupIdWithType, index) => {
      handlePermissionSettingsChange?.(
        permissionSettings.map((item, itemIndex) =>
          index === itemIndex
            ? {
                id: item.id,
                ...userOrGroupIdWithType,
                ...(item.modes ? { modes: item.modes } : {}),
              }
            : item
        )
      );
    },
    [handlePermissionSettingsChange, permissionSettings]
  );

  const handleTypeChange = useCallback<WorkspacePermissionSettingInputProps['onTypeChange']>(
    (type, index) => {
      handlePermissionSettingsChange?.(
        permissionSettings.map((item, itemIndex) =>
          index === itemIndex ? { id: item.id, type, modes: item.modes } : item
        )
      );
    },
    [handlePermissionSettingsChange, permissionSettings]
  );

  return (
    <>
      {permissionSettings.length > 0 && (
        <>
          <EuiFormLabel id={PERMISSION_COLLABORATOR_LABEL_ID}>{userOrGroupLabel}</EuiFormLabel>
          <EuiSpacer size="xs" />
          {userOrGroupDescription && (
            <>
              <EuiText color="subdued" size="xs">
                {userOrGroupDescription}
              </EuiText>
              <EuiSpacer size="xs" />
            </>
          )}
        </>
      )}
      {permissionSettings.map((item, index) => (
        <React.Fragment key={item.id}>
          <EuiCompressedFormRow
            fullWidth
            isInvalid={!!errors?.[item.id]}
            error={errors?.[item.id]?.message}
          >
            <WorkspacePermissionSettingInput
              {...item}
              type={item.type || WorkspacePermissionItemType.User}
              index={index}
              userOrGroupDisabled={disabledUserOrGroupInputIds.includes(item.id)}
              onDelete={handleDelete}
              onGroupOrUserIdChange={handleGroupOrUserIdChange}
              onPermissionModesChange={handlePermissionModesChange}
              onTypeChange={handleTypeChange}
              readOnly={readOnly}
              userOrGroupPlaceholder={userOrGroupPlaceholder}
            />
          </EuiCompressedFormRow>
        </React.Fragment>
      ))}
      {!readOnly && (
        <EuiCompressedFormRow fullWidth>
          <EuiSmallButton
            fullWidth={false}
            onClick={handleAddNewOne}
            data-test-subj={`workspaceForm-permissionSettingPanel-addNew`}
            color="primary"
            iconType="plusInCircle"
          >
            {addAnotherButtonText}
          </EuiSmallButton>
        </EuiCompressedFormRow>
      )}
    </>
  );
};
