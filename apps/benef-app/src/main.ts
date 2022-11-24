import Vue from 'vue';
import prepareServices from '@/ui/plugins/services';
import prepareStorage from '@/ui/plugins/storage';
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
import VueProgrammaticInvisibleGoogleRecaptcha from 'vue-programmatic-invisible-google-recaptcha';
import { Survey } from 'survey-vue';
import App from './ui/App.vue';
import router from './ui/router';
import store from './store/store';
import features from './ui/plugins/features';

Vue.component('Survey', Survey);
Vue.component('VueProgrammaticInvisibleGoogleRecaptcha', VueProgrammaticInvisibleGoogleRecaptcha);

prepareServices(store);
prepareStorage(store);

Vue.use(Multilingual);
Vue.use(features);

applicationInsights.initialize({
  connectionString: process.env.VITE_APPLICATION_INSIGHTS_CONNECTION_STRING,
  router,
  appName: 'beneficiary-webapp',
});

applicationInsights.setBasicContext({ app: 'beneficiary-webapp' });

Vue.prototype.$i18nRoute = Trans.i18nRoute.bind(Trans);
Vue.prototype.$appInsights = applicationInsights;

Vue.config.productionTip = false;

new Vue({
  router,
  i18n,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
