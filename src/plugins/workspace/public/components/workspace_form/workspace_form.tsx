/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiPanel,
  EuiSpacer,
  EuiTitle,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiSelect,
  EuiText,
  EuiFlexItem,
  EuiCheckbox,
  EuiCheckboxGroup,
  EuiColorPicker,
  EuiHorizontalRule,
  EuiFlexGroup,
  EuiTab,
  EuiTabs,
} from '@elastic/eui';
import { i18n } from '@osd/i18n';

import { WorkspaceBottomBar } from './workspace_bottom_bar';
import { WorkspaceIconSelector } from './workspace_icon_selector';
import { WorkspacePermissionSettingPanel } from './workspace_permission_setting_panel';
import { WorkspaceFormProps } from './types';
import { WorkspaceFormTabs } from './constants';
import { useWorkspaceForm } from './use_workspace_form';
import { isDefaultCheckedFeatureId, isWorkspaceFeatureGroup } from './utils';

const defaultVISThemeOptions = [{ value: 'categorical', text: 'Categorical' }];

export const WorkspaceForm = (props: WorkspaceFormProps) => {
  const {
    application,
    defaultValues,
    operationType,
    permissionEnabled,
    permissionLastAdminItemDeletable,
  } = props;
  const {
    formId,
    formData,
    formErrors,
    selectedTab,
    numberOfErrors,
    featureOrGroups,
    handleFormSubmit,
    handleIconChange,
    handleColorChange,
    handleFeatureChange,
    handleNameInputChange,
    handleTabFeatureClick,
    setPermissionSettings,
    handleFeatureGroupChange,
    handleTabPermissionClick,
    handleDefaultVISThemeChange,
    handleFeatureCheckboxChange,
    handleDescriptionInputChange,
  } = useWorkspaceForm(props);
  const workspaceDetailsTitle = i18n.translate('workspace.form.workspaceDetails.title', {
    defaultMessage: 'Workspace Details',
  });
  const featureVisibilityTitle = i18n.translate('workspace.form.featureVisibility.title', {
    defaultMessage: 'Feature Visibility',
  });
  const usersAndPermissionsTitle = i18n.translate('workspace.form.usersAndPermissions.title', {
    defaultMessage: 'Users & Permissions',
  });
  const libraryCategoryLabel = i18n.translate('core.ui.libraryNavList.label', {
    defaultMessage: 'Library',
  });
  const categoryToDescription: { [key: string]: string } = {
    [libraryCategoryLabel]: i18n.translate(
      'workspace.form.featureVisibility.libraryCategory.Description',
      {
        defaultMessage: 'Workspace-owned library items',
      }
    ),
  };

  return (
    <EuiForm id={formId} onSubmit={handleFormSubmit} component="form">
      <EuiPanel>
        <EuiTitle size="s">
          <h2>{workspaceDetailsTitle}</h2>
        </EuiTitle>
        <EuiHorizontalRule margin="xs" />
        <EuiSpacer size="s" />
        <EuiFormRow
          label={i18n.translate('workspace.form.workspaceDetails.name.label', {
            defaultMessage: 'Name',
          })}
          helpText={i18n.translate('workspace.form.workspaceDetails.name.helpText', {
            defaultMessage:
              'Valid characters are a-z, A-Z, 0-9, (), [], _ (underscore), - (hyphen) and (space).',
          })}
          isInvalid={!!formErrors.name}
          error={formErrors.name}
        >
          <EuiFieldText
            value={formData.name}
            onChange={handleNameInputChange}
            readOnly={!!defaultValues?.reserved}
            data-test-subj="workspaceForm-workspaceDetails-nameInputText"
          />
        </EuiFormRow>
        <EuiFormRow
          label={
            <>
              Description - <i>optional</i>
            </>
          }
          helpText={i18n.translate('workspace.form.workspaceDetails.description.helpText', {
            defaultMessage:
              'Valid characters are a-z, A-Z, 0-9, (), [], _ (underscore), - (hyphen) and (space).',
          })}
          isInvalid={!!formErrors.description}
          error={formErrors.description}
        >
          <EuiFieldText
            value={formData.description}
            onChange={handleDescriptionInputChange}
            data-test-subj="workspaceForm-workspaceDetails-descriptionInputText"
          />
        </EuiFormRow>
        <EuiFormRow
          label={i18n.translate('workspace.form.workspaceDetails.color.label', {
            defaultMessage: 'Color',
          })}
          isInvalid={!!formErrors.color}
          error={formErrors.color}
        >
          <div>
            <EuiText size="xs" color="subdued">
              {i18n.translate('workspace.form.workspaceDetails.color.helpText', {
                defaultMessage: 'Accent color for your workspace',
              })}
            </EuiText>
            <EuiSpacer size={'s'} />
            <EuiColorPicker
              color={formData.color}
              onChange={handleColorChange}
              data-test-subj="workspaceForm-workspaceDetails-colorPicker"
            />
          </div>
        </EuiFormRow>
        <EuiFormRow
          label={i18n.translate('workspace.form.workspaceDetails.icon.label', {
            defaultMessage: 'Icon',
          })}
          isInvalid={!!formErrors.icon}
          error={formErrors.icon}
        >
          <WorkspaceIconSelector
            value={formData.icon}
            onChange={handleIconChange}
            color={formData.color}
          />
        </EuiFormRow>
        <EuiFormRow
          label={i18n.translate('workspace.form.workspaceDetails.defaultVisualizationTheme.label', {
            defaultMessage: 'Default visualization theme',
          })}
          isInvalid={!!formErrors.defaultVISTheme}
          error={formErrors.defaultVISTheme}
        >
          <EuiSelect
            hasNoInitialSelection
            value={formData.defaultVISTheme}
            options={defaultVISThemeOptions}
            onChange={handleDefaultVISThemeChange}
            data-test-subj="workspaceForm-workspaceDetails-defaultVISThemeSelector"
          />
        </EuiFormRow>
      </EuiPanel>
      <EuiSpacer />

      <EuiTabs>
        <EuiTab
          onClick={handleTabFeatureClick}
          isSelected={selectedTab === WorkspaceFormTabs.FeatureVisibility}
        >
          <EuiText>{featureVisibilityTitle}</EuiText>
        </EuiTab>
        {permissionEnabled && (
          <EuiTab
            onClick={handleTabPermissionClick}
            isSelected={selectedTab === WorkspaceFormTabs.UsersAndPermissions}
          >
            <EuiText>{usersAndPermissionsTitle}</EuiText>
          </EuiTab>
        )}
      </EuiTabs>

      {selectedTab === WorkspaceFormTabs.FeatureVisibility && (
        <EuiPanel>
          <EuiTitle size="s">
            <h2>{featureVisibilityTitle}</h2>
          </EuiTitle>
          <EuiHorizontalRule margin="xs" />
          <EuiSpacer size="s" />
          {featureOrGroups.map((featureOrGroup) => {
            const features = isWorkspaceFeatureGroup(featureOrGroup) ? featureOrGroup.features : [];
            const selectedIds = formData.features.filter((id) =>
              (isWorkspaceFeatureGroup(featureOrGroup)
                ? featureOrGroup.features
                : [featureOrGroup]
              ).find((item) => item.id === id)
            );
            const featureOrGroupId = isWorkspaceFeatureGroup(featureOrGroup)
              ? featureOrGroup.name
              : featureOrGroup.id;
            return (
              <EuiFlexGroup key={featureOrGroup.name}>
                <EuiFlexItem>
                  <div>
                    <EuiText>
                      <strong>{featureOrGroup.name}</strong>
                    </EuiText>
                    {isWorkspaceFeatureGroup(featureOrGroup) && (
                      <EuiText>{categoryToDescription[featureOrGroup.name] ?? ''}</EuiText>
                    )}
                  </div>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiCheckbox
                    id={featureOrGroupId}
                    onChange={
                      isWorkspaceFeatureGroup(featureOrGroup)
                        ? handleFeatureGroupChange
                        : handleFeatureCheckboxChange
                    }
                    label={`${featureOrGroup.name}${
                      features.length > 0 ? ` (${selectedIds.length}/${features.length})` : ''
                    }`}
                    checked={selectedIds.length > 0}
                    disabled={
                      !isWorkspaceFeatureGroup(featureOrGroup) &&
                      isDefaultCheckedFeatureId(featureOrGroup.id)
                    }
                    indeterminate={
                      isWorkspaceFeatureGroup(featureOrGroup) &&
                      selectedIds.length > 0 &&
                      selectedIds.length < features.length
                    }
                    data-test-subj={`workspaceForm-workspaceFeatureVisibility-${featureOrGroupId}`}
                  />
                  {isWorkspaceFeatureGroup(featureOrGroup) && (
                    <EuiCheckboxGroup
                      options={featureOrGroup.features.map((item) => ({
                        id: item.id,
                        label: item.name,
                        disabled: isDefaultCheckedFeatureId(item.id),
                      }))}
                      idToSelectedMap={selectedIds.reduce(
                        (previousValue, currentValue) => ({
                          ...previousValue,
                          [currentValue]: true,
                        }),
                        {}
                      )}
                      onChange={handleFeatureChange}
                      style={{ marginLeft: 40 }}
                      data-test-subj={`workspaceForm-workspaceFeatureVisibility-featureWithCategory-${featureOrGroupId}`}
                    />
                  )}
                </EuiFlexItem>
              </EuiFlexGroup>
            );
          })}
        </EuiPanel>
      )}

      {selectedTab === WorkspaceFormTabs.UsersAndPermissions && (
        <EuiPanel>
          <EuiTitle size="s">
            <h2>{usersAndPermissionsTitle}</h2>
          </EuiTitle>
          <EuiHorizontalRule margin="xs" />
          <WorkspacePermissionSettingPanel
            errors={formErrors.permissions}
            onChange={setPermissionSettings}
            permissionSettings={formData.permissions}
            lastAdminItemDeletable={!!permissionLastAdminItemDeletable}
            data-test-subj={`workspaceForm-permissionSettingPanel`}
          />
        </EuiPanel>
      )}
      <EuiSpacer />
      <WorkspaceBottomBar
        operationType={operationType}
        formId={formId}
        application={application}
        numberOfErrors={numberOfErrors}
      />
    </EuiForm>
  );
};
