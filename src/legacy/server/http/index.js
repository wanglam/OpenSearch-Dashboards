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

import Boom from '@hapi/boom';
import { URL } from 'url';

import { registerHapiPlugins } from './register_hapi_plugins';
import { setupBasePathProvider } from './setup_base_path_provider';

export default async function (osdServer, server) {
  server = osdServer.server;

  setupBasePathProvider(osdServer);

  await registerHapiPlugins(server);

  server.route({
    method: 'GET',
    path: '/{p*}',
    handler: function (req, h) {
      const path = req.path;
      if (path === '/' || path.charAt(path.length - 1) !== '/') {
        throw Boom.notFound();
      }

      const pathPrefix = req.getBasePath() ? `${req.getBasePath()}/` : '';
      const pathname = pathPrefix + path.slice(0, -1);
      let url;
      let shouldRemoveOrigin = false;
      try {
        url = new URL(pathname);
      } catch (e) {
        url = new URL(pathname, 'http://localhost');
        shouldRemoveOrigin = true;
      }
      url.search = req.url.search;
      return h
        .redirect(url.toString().substring(shouldRemoveOrigin ? url.origin.length : 0))
        .permanent(true);
    },
  });
}
