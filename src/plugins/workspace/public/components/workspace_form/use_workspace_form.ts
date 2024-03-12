/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState, FormEventHandler, useRef, useMemo, useEffect } from 'react';
import { groupBy } from 'lodash';
import {
  htmlIdGenerator,
  EuiCheckboxGroupProps,
  EuiCheckboxProps,
  EuiFieldTextProps,
  EuiColorPickerProps,
} from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { AppNavLinkStatus, DEFAULT_APP_CATEGORIES } from '../../../../../core/public';
import { useApplications } from '../../hooks';
import {
  isFeatureDependBySelectedFeatures,
  getFinalFeatureIdsByDependency,
  generateFeatureDependencyMap,
} from '../utils/feature';
import { featureMatchesConfig } from '../../utils';

import { WorkspacePermissionItemType, WorkspaceFormTabs } from './constants';
import {
  WorkspaceFeature,
  WorkspaceFeatureGroup,
  WorkspacePermissionSetting,
  WorkspaceFormProps,
  WorkspaceFormErrors,
} from './types';
import {
  appendDefaultFeatureIds,
  getNumberOfErrors,
  isUserOrGroupPermissionSettingDuplicated,
  isValidNameOrDescription,
  isValidWorkspacePermissionSetting,
  isWorkspaceFeatureGroup,
} from './utils';

const workspaceHtmlIdGenerator = htmlIdGenerator();

export const useWorkspaceForm = ({ application, defaultValues, onSubmit }: WorkspaceFormProps) => {
  const applications = useApplications(application);
  const [name, setName] = useState(defaultValues?.name);
  const [description, setDescription] = useState(defaultValues?.description);
  const [color, setColor] = useState(defaultValues?.color);
  const [icon, setIcon] = useState(defaultValues?.icon);
  const [defaultVISTheme, setDefaultVISTheme] = useState(defaultValues?.defaultVISTheme);

  const [selectedTab, setSelectedTab] = useState(WorkspaceFormTabs.FeatureVisibility);
  const [numberOfErrors, setNumberOfErrors] = useState(0);
  // The matched feature id list based on original feature config,
  // the feature category will be expanded to list of feature ids
  const defaultFeatures = useMemo(() => {
    // The original feature list, may contain feature id and category wildcard like @management, etc.
    const defaultOriginalFeatures = defaultValues?.features ?? [];
    return applications.filter(featureMatchesConfig(defaultOriginalFeatures)).map((app) => app.id);
  }, [defaultValues?.features, applications]);

  const defaultFeaturesRef = useRef(defaultFeatures);
  defaultFeaturesRef.current = defaultFeatures;

  useEffect(() => {
    // When applications changed, reset form feature selection to original value
    setSelectedFeatureIds(appendDefaultFeatureIds(defaultFeaturesRef.current));
  }, [applications]);

  const [selectedFeatureIds, setSelectedFeatureIds] = useState(
    appendDefaultFeatureIds(defaultFeatures)
  );
  const [permissionSettings, setPermissionSettings] = useState<
    Array<Partial<WorkspacePermissionSetting>>
  >(
    defaultValues?.permissions && defaultValues.permissions.length > 0
      ? defaultValues.permissions
      : []
  );

  const [formErrors, setFormErrors] = useState<WorkspaceFormErrors>({});
  const formIdRef = useRef<string>();
  const getFormData = () => ({
    name,
    description,
    features: selectedFeatureIds,
    color,
    icon,
    defaultVISTheme,
    permissions: permissionSettings,
  });
  const getFormDataRef = useRef(getFormData);
  getFormDataRef.current = getFormData;

  const featureOrGroups = useMemo(() => {
    const transformedApplications = applications.map((app) => {
      if (app.category?.id === DEFAULT_APP_CATEGORIES.opensearchDashboards.id) {
        return {
          ...app,
          category: {
            ...app.category,
            label: i18n.translate('core.ui.libraryNavList.label', {
              defaultMessage: 'Library',
            }),
          },
        };
      }
      return app;
    });
    const category2Applications = groupBy(transformedApplications, 'category.label');
    return Object.keys(category2Applications).reduce<
      Array<WorkspaceFeature | WorkspaceFeatureGroup>
    >((previousValue, currentKey) => {
      const apps = category2Applications[currentKey];
      const features = apps
        .filter(
          ({ navLinkStatus, chromeless, category }) =>
            navLinkStatus !== AppNavLinkStatus.hidden &&
            !chromeless &&
            category?.id !== DEFAULT_APP_CATEGORIES.management.id
        )
        .map(({ id, title, dependencies }) => ({
          id,
          name: title,
          dependencies,
        }));
      if (features.length === 0) {
        return previousValue;
      }
      if (currentKey === 'undefined') {
        return [...previousValue, ...features];
      }
      return [
        ...previousValue,
        {
          name: apps[0].category?.label || '',
          features,
        },
      ];
    }, []);
  }, [applications]);

  const allFeatures = useMemo(
    () =>
      featureOrGroups.reduce<WorkspaceFeature[]>(
        (previousData, currentData) => [
          ...previousData,
          ...(isWorkspaceFeatureGroup(currentData) ? currentData.features : [currentData]),
        ],
        []
      ),
    [featureOrGroups]
  );

  const featureDependencies = useMemo(() => generateFeatureDependencyMap(allFeatures), [
    allFeatures,
  ]);

  if (!formIdRef.current) {
    formIdRef.current = workspaceHtmlIdGenerator();
  }

  const handleFeatureChange = useCallback<EuiCheckboxGroupProps['onChange']>(
    (featureId) => {
      setSelectedFeatureIds((previousData) => {
        if (!previousData.includes(featureId)) {
          return getFinalFeatureIdsByDependency([featureId], featureDependencies, previousData);
        }

        if (isFeatureDependBySelectedFeatures(featureId, previousData, featureDependencies)) {
          return previousData;
        }

        return previousData.filter((selectedId) => selectedId !== featureId);
      });
    },
    [featureDependencies]
  );

  const handleFeatureCheckboxChange = useCallback<EuiCheckboxProps['onChange']>(
    (e) => {
      handleFeatureChange(e.target.id);
    },
    [handleFeatureChange]
  );

  const handleFeatureGroupChange = useCallback<EuiCheckboxProps['onChange']>(
    (e) => {
      for (const featureOrGroup of featureOrGroups) {
        if (isWorkspaceFeatureGroup(featureOrGroup) && featureOrGroup.name === e.target.id) {
          const groupFeatureIds = featureOrGroup.features.map((feature) => feature.id);
          setSelectedFeatureIds((previousData) => {
            const notExistsIds = groupFeatureIds.filter((id) => !previousData.includes(id));
            if (notExistsIds.length > 0) {
              return getFinalFeatureIdsByDependency(
                notExistsIds,
                featureDependencies,
                previousData
              );
            }
            let groupRemainFeatureIds = groupFeatureIds;
            const outGroupFeatureIds = previousData.filter(
              (featureId) => !groupFeatureIds.includes(featureId)
            );

            while (true) {
              const lastRemainFeatures = groupRemainFeatureIds.length;
              groupRemainFeatureIds = groupRemainFeatureIds.filter((featureId) =>
                isFeatureDependBySelectedFeatures(
                  featureId,
                  [...outGroupFeatureIds, ...groupRemainFeatureIds],
                  featureDependencies
                )
              );
              if (lastRemainFeatures === groupRemainFeatureIds.length) {
                break;
              }
            }

            return [...outGroupFeatureIds, ...groupRemainFeatureIds];
          });
        }
      }
    },
    [featureOrGroups, featureDependencies]
  );

  const handleFormSubmit = useCallback<FormEventHandler>(
    (e) => {
      e.preventDefault();
      let currentFormErrors: WorkspaceFormErrors = {};
      const formData = getFormDataRef.current();
      if (!formData.name) {
        currentFormErrors = {
          ...currentFormErrors,
          name: i18n.translate('workspace.form.detail.name.empty', {
            defaultMessage: "Name can't be empty.",
          }),
        };
      }
      if (!isValidNameOrDescription(formData.name)) {
        currentFormErrors = {
          ...currentFormErrors,
          name: i18n.translate('workspace.form.detail.name.invalid', {
            defaultMessage: 'Invalid workspace name',
          }),
        };
      }
      if (!isValidNameOrDescription(formData.description)) {
        currentFormErrors = {
          ...currentFormErrors,
          description: i18n.translate('workspace.form.detail.description.invalid', {
            defaultMessage: 'Invalid workspace description',
          }),
        };
      }
      const permissionErrors: string[] = new Array(formData.permissions.length);
      for (let i = 0; i < formData.permissions.length; i++) {
        const permission = formData.permissions[i];
        if (isValidWorkspacePermissionSetting(permission)) {
          if (
            isUserOrGroupPermissionSettingDuplicated(formData.permissions.slice(0, i), permission)
          ) {
            permissionErrors[i] = i18n.translate('workspace.form.permission.invalidate.group', {
              defaultMessage: 'Duplicate permission setting',
            });
            continue;
          }
          continue;
        }
        if (!permission.type) {
          permissionErrors[i] = i18n.translate('workspace.form.permission.invalidate.type', {
            defaultMessage: 'Invalid type',
          });
          continue;
        }
        if (!permission.modes || permission.modes.length === 0) {
          permissionErrors[i] = i18n.translate('workspace.form.permission.invalidate.modes', {
            defaultMessage: 'Invalid permission modes',
          });
          continue;
        }
        if (permission.type === WorkspacePermissionItemType.User && !permission.userId) {
          permissionErrors[i] = i18n.translate('workspace.form.permission.invalidate.userId', {
            defaultMessage: 'Invalid userId',
          });
          continue;
        }
        if (permission.type === WorkspacePermissionItemType.Group && !permission.group) {
          permissionErrors[i] = i18n.translate('workspace.form.permission.invalidate.group', {
            defaultMessage: 'Invalid user group',
          });
          continue; // this line is need for more conditions
        }
      }
      if (permissionErrors.some((error) => !!error)) {
        currentFormErrors = {
          ...currentFormErrors,
          permissions: permissionErrors,
        };
      }
      const currentNumberOfErrors = getNumberOfErrors(currentFormErrors);
      setFormErrors(currentFormErrors);
      setNumberOfErrors(currentNumberOfErrors);
      if (currentNumberOfErrors > 0) {
        return;
      }

      const featureConfigChanged =
        formData.features.length !== defaultFeatures.length ||
        formData.features.some((feat) => !defaultFeatures.includes(feat));

      if (!featureConfigChanged) {
        // If feature config not changed, set workspace feature config to the original value.
        // The reason why we do this is when a workspace feature is configured by wildcard,
        // such as `['@management']` or `['*']`. The form value `formData.features` will be
        // expanded to array of individual feature id, if the feature hasn't changed, we will
        // set the feature config back to the original value so that category wildcard won't
        // expanded to feature ids
        formData.features = defaultValues?.features ?? [];
      }

      const permissions = formData.permissions.filter(isValidWorkspacePermissionSetting);
      onSubmit?.({ ...formData, name: formData.name!, permissions });
    },
    [defaultFeatures, onSubmit, defaultValues?.features]
  );

  const handleNameInputChange = useCallback<Required<EuiFieldTextProps>['onChange']>((e) => {
    setName(e.target.value);
  }, []);

  const handleDescriptionInputChange = useCallback<Required<EuiFieldTextProps>['onChange']>((e) => {
    setDescription(e.target.value);
  }, []);

  const handleColorChange = useCallback<Required<EuiColorPickerProps>['onChange']>((text) => {
    setColor(text);
  }, []);

  const handleIconChange = useCallback((newIcon: string) => {
    setIcon(newIcon);
  }, []);

  const handleTabFeatureClick = useCallback(() => {
    setSelectedTab(WorkspaceFormTabs.FeatureVisibility);
  }, []);

  const handleTabPermissionClick = useCallback(() => {
    setSelectedTab(WorkspaceFormTabs.UsersAndPermissions);
  }, []);

  const handleDefaultVISThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDefaultVISTheme(e.target.value);
  };

  return {
    formId: formIdRef.current,
    formData: getFormData(),
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
  };
};
