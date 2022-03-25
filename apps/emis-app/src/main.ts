/* eslint-disable @typescript-eslint/no-unused-vars */
import Vue from 'vue';
import VueMeta from 'vue-meta';
import './registerServiceWorker';

// asset imports
import '../../../libs/assets/styles/main.scss';
// Import i18n related files

import VueAxe from 'vue-axe';
import applicationInsights from '@libs/registration-lib/plugins/applicationInsights/applicationInsights';
import VueCookies from 'vue-cookies';
import {
  i18n, Trans,
} from '@/ui/plugins';

// Import other plugins
import '@/ui/plugins/vue-toasted';
import formatCurrency from '@/ui/plugins/formatCurrency';
import Multilingual from '@/ui/plugins/multilingual';
import rolesAndPermissions from '@/ui/plugins/rolesAndPermissions';
import features from '@/ui/plugins/features';
import '@/ui/plugins/vee-validate';
import vuetify from '@/ui/plugins/vuetify/vuetify';

import { SignalR } from '@/ui/plugins/signalR';
import prepareServices from '@/ui/plugins/services';
import prepareStorage from '@/ui/plugins/storage';

import store from './store/store';

import router from './ui/router';
import App from './ui/App.vue';

prepareServices(store);
const storage = prepareStorage(store);

SignalR.Initialize({
  storage,
  showConsole: false,
});

applicationInsights.initialize({
  connectionString: process.env.VUE_APP_APPLICATION_INSIGHTS_CONNECTION_STRING,
  router,
  appName: 'EMISv2',
});

Vue.prototype.$i18nRoute = Trans.i18nRoute.bind(Trans);
Vue.prototype.$appInsights = applicationInsights;
Vue.config.productionTip = false;

// Some custom plugins
Vue.use(VueMeta);
Vue.use(Multilingual);
Vue.use(formatCurrency);
Vue.use(rolesAndPermissions);
Vue.use(features);
Vue.use(VueCookies);

if (process.env.NODE_ENV === 'development') {
  Vue.use(VueAxe, {
    auto: false, // Disable auto check.
  });
}

new Vue({
  render: (h) => h(App),
  router,
  i18n,
  vuetify,
  store,
}).$mount('#app');

// Directive fo v-visible so component is hidden but still take its place
Vue.directive('visible', (el, binding) => {
  el.style.visibility = binding.value ? 'visible' : 'hidden';
});
