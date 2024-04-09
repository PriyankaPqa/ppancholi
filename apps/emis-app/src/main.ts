/* eslint-disable @typescript-eslint/no-unused-vars */
import Vue from 'vue';
import VueMeta from 'vue-meta';

// asset imports
import '@libs/shared-lib/assets/styles/main.scss';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';

// Import i18n related files

import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import VueCookies from 'vue-cookies';
import {
  i18n, Trans,
} from '@/ui/plugins';

// Import other plugins
import '@libs/shared-lib/plugins/vue-toasted';
import formatCurrency from '@/ui/plugins/formatCurrency';
import Multilingual from '@libs/shared-lib/plugins/multilingual';
import rolesAndPermissions from '@/ui/plugins/rolesAndPermissions';
import features from '@/ui/plugins/features';
import '@/ui/plugins/vee-validate';
import prepareServices from '@/ui/plugins/services';
import { SignalRService } from '@libs/services-lib/signal-r';

import { httpClient } from '@/services/httpClient';
import { SignalR } from '@/ui/plugins/signal-r';
import vuetify from '@libs/shared-lib/plugins/vuetify/vuetify';
import { createPinia, PiniaVuePlugin } from 'pinia';
import resetStore from '@libs/stores-lib/store-reset';
import registrationStore from '@/ui/plugins/registrationStore';
import router from './ui/router';
import App from './ui/App.vue';

Vue.use(PiniaVuePlugin);
const pinia = createPinia();
pinia.use(resetStore);
prepareServices();
const signalRService = new SignalRService(httpClient);

applicationInsights.initialize({
  connectionString: process.env.VITE_APPLICATION_INSIGHTS_CONNECTION_STRING,
  router,
  excludeRequestFromAutoTrackingPatterns: [
    'https://maps.googleapis.com/*', // traceparent in request header would cause Google Maps API to not return the "Access-Control-Allow-Origin" in the response headers
  ],
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

SignalR.Initialize({
  service: signalRService,
  showConsole: false,
});

const app = new Vue({
  render: (h) => h(App),
  router,
  i18n,
  vuetify,
  pinia,
}).$mount('#app');

// @ts-ignore
if (window.Cypress) {
  // @ts-ignore
  window._app = app;
}
Vue.use(registrationStore);

// Directive fo v-visible so component is hidden but still take its place
Vue.directive('visible', (el, binding) => {
  el.style.visibility = binding.value ? 'visible' : 'hidden';
});
