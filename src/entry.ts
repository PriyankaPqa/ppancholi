import _Vue, { PluginFunction } from 'vue';

// Import vue components
import * as components from '@/components/index';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface InstallFunction extends PluginFunction<any> {
  installed?: boolean;
}

// install function executed by Vue.use()
const install: InstallFunction = function installTest(Vue: typeof _Vue) {
  if (install.installed) return;
  install.installed = true;
  Object.entries(components).forEach(([componentName, component]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Vue.component(componentName, component as any);
  });
};

// Create module definition for Vue.use()
const Components = {
  install,
};

// Default export is library as a whole, registered via Vue.use()
export default Components;

// To allow individual component use, export components
// each can be registered via Vue.component()
export * from '@/components/index';

export * from '@/entities/beneficiary';
