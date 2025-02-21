import Vue from 'vue';
import prepareServices from '@/ui/plugins/services';
import '@libs/shared-lib/assets/styles/main.scss';
import '@/ui/plugins/vee-validate';
import {
  i18n, Trans,
} from '@/ui/plugins';
import Multilingual from '@/ui/plugins/multilingual';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import '@libs/shared-lib/plugins/vue-toasted';
import vuetify from '@libs/shared-lib/plugins/vuetify/vuetify';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Survey } from 'survey-vue';
import { createPinia, PiniaVuePlugin } from 'pinia';
import resetStore from '@libs/stores-lib/store-reset';
import registrationStore from '@/ui/plugins/registrationStore';
import App from './ui/App.vue';
import router from './ui/router';
import features from './ui/plugins/features';

Vue.use(PiniaVuePlugin);
const pinia = createPinia();
pinia.use(resetStore);

Vue.component('Survey', Survey);

prepareServices();

Vue.use(Multilingual);
Vue.use(features);

applicationInsights.initialize({
  connectionString: process.env.VITE_APPLICATION_INSIGHTS_CONNECTION_STRING,
  router,
  appName: 'beneficiary-webapp',
  excludeRequestFromAutoTrackingPatterns: [
    'https://maps.googleapis.com/*', // traceparent in request header would cause Google Maps API to not return the "Access-Control-Allow-Origin" in the response headers
  ],
});

applicationInsights.setBasicContext({ app: 'beneficiary-webapp' });

Vue.prototype.$i18nRoute = Trans.i18nRoute.bind(Trans);
Vue.prototype.$appInsights = applicationInsights;

Vue.config.productionTip = false;

new Vue({
  router,
  i18n,
  vuetify,
  pinia,
  render: (h) => h(App),
}).$mount('#app');

Vue.use(registrationStore);
