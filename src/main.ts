import prepareServices from '@/ui/plugins/services';
import prepareStorage from '@/ui/plugins/storage';
import Vue from 'vue';
import '@/ui/styles/main.scss';
import '@/ui/plugins/vee-validate';
import {
  i18n, Trans,
} from '@/ui/plugins';
import Multilingual from '@/ui/plugins/multilingual';
import applicationInsights from '@crctech/registration-lib/src/plugins/applicationInsights/applicationInsights';
import '@/ui/plugins/vue-toasted';
import vuetify from '@/ui/plugins/vuetify/vuetify';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import VueProgrammaticInvisibleGoogleRecaptcha from 'vue-programmatic-invisible-google-recaptcha';
import App from './ui/App.vue';
import './registerServiceWorker';
import router from './ui/router';
import store from './store/store';
import features from './ui/plugins/features';

Vue.component('VueProgrammaticInvisibleGoogleRecaptcha', VueProgrammaticInvisibleGoogleRecaptcha);

prepareServices(store);
prepareStorage(store);

Vue.use(Multilingual);
Vue.use(features);

applicationInsights.initialize({
  connectionString: process.env.VUE_APP_APPLICATION_INSIGHTS_CONNECTION_STRING,
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
