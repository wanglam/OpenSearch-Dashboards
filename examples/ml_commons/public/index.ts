import './index.scss';

import { MlCommonsPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.
export function plugin() {
  return new MlCommonsPlugin();
}
export { MlCommonsPluginSetup, MlCommonsPluginStart } from './types';
