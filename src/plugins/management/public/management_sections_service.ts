/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { ManagementSection, RegisterManagementSectionArgs } from './utils';
import {
  IngestSection,
  DataSection,
  InsightsAndAlertingSection,
  SecuritySection,
  OpenSearchDashboardsSection,
  StackSection,
} from './components/management_sections';

import {
  ManagementSectionId,
  SectionsServiceSetup,
  SectionsServiceStartDeps,
  DefinedSections,
  ManagementSectionsStartPrivate,
} from './types';
import { createGetterSetter } from '../../opensearch_dashboards_utils/public';

const [getSectionsServiceStartPrivate, setSectionsServiceStartPrivate] = createGetterSetter<
  ManagementSectionsStartPrivate
>('SectionsServiceStartPrivate');

/**
 * The management capabilities has `opensearchDashboards` as the key
 * While when registering the opensearchDashboards section, the section id is `opensearch-dashboards`
 * as defined in {@link ManagementSectionId.OpenSearchDashboards} and section id is used as the capability
 * id. Here we have a mapping so that the section id opensearch-dashboards can mapping correctly back to the
 * capability id: opensearchDashboards
 *
 * Why not directly change the capability id to opensearch-dashboards?
 * The issue was introduced in https://github.com/opensearch-project/OpenSearch-Dashboards/pull/260
 * Since then, the capability id `opensearchDashboards` has been used by plugins, having a mapping here
 * is for backward compatibility
 */
const MANAGEMENT_ID_TO_CAPABILITIES: Record<string, string> = {
  'opensearch-dashboards': 'opensearchDashboards',
};

export { getSectionsServiceStartPrivate };

export class ManagementSectionsService {
  definedSections: DefinedSections;

  constructor() {
    // Note on adding sections - sections can be defined in a plugin and exported as a contract
    // It is not necessary to define all sections here, although we've chose to do it for discovery reasons.
    this.definedSections = {
      ingest: this.registerSection(IngestSection),
      data: this.registerSection(DataSection),
      insightsAndAlerting: this.registerSection(InsightsAndAlertingSection),
      security: this.registerSection(SecuritySection),
      opensearchDashboards: this.registerSection(OpenSearchDashboardsSection),
      stack: this.registerSection(StackSection),
    };
  }
  private sections: Map<ManagementSectionId | string, ManagementSection> = new Map();

  private getAllSections = () => [...this.sections.values()];

  private registerSection = (section: RegisterManagementSectionArgs) => {
    if (this.sections.has(section.id)) {
      throw Error(`ManagementSection '${section.id}' already registered`);
    }

    const newSection = new ManagementSection(section);

    this.sections.set(section.id, newSection);
    return newSection;
  };

  setup(): SectionsServiceSetup {
    return {
      register: this.registerSection,
      section: {
        ...this.definedSections,
      },
    };
  }

  start({ capabilities }: SectionsServiceStartDeps) {
    this.getAllSections().forEach((section) => {
      const capabilityId = MANAGEMENT_ID_TO_CAPABILITIES[section.id] || section.id;
      if (capabilities.management.hasOwnProperty(capabilityId)) {
        const sectionCapabilities = capabilities.management[capabilityId];
        section.apps.forEach((app) => {
          if (sectionCapabilities.hasOwnProperty(app.id) && sectionCapabilities[app.id] !== true) {
            app.disable();
          }
        });
      }
    });

    setSectionsServiceStartPrivate({
      getSectionsEnabled: () => this.getAllSections().filter((section) => section.enabled),
    });

    return {};
  }
}
