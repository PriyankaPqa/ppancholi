/* eslint-disable @typescript-eslint/no-unused-vars */
import Vue from 'vue';
import VueMeta from 'vue-meta';
import './registerServiceWorker';

// asset imports
import '@/ui/styles/main.scss';
import '@rctech/web-ui/dist/web-ui.css';

// Import i18n related files

import {
  i18n, Trans,
} from '@/ui/plugins';

// Import other plugins
import '@/ui/plugins/vue-toasted';
import formatCurrency from '@/ui/plugins/formatCurrency';
import '@/ui/plugins/vee-validate';
import vuetify from '@/ui/plugins/vuetify/vuetify';

import moment from '@/ui/plugins/moment';

import prepareServices from '@/ui/plugins/services';
import prepareStorage from '@/ui/plugins/storage';

import VueAxe from 'vue-axe';
import store from './store/store';

import router from './ui/router';
import App from './ui/App.vue';

prepareServices(store);
prepareStorage(store);

Vue.prototype.$i18nRoute = Trans.i18nRoute.bind(Trans);
Vue.config.productionTip = false;

// Some custom plugins
Vue.use(VueMeta);
// Vue.use(rolesAndPermissions);
Vue.use(formatCurrency);

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
