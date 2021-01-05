/* eslint-disable no-unused-vars */
import Vue from 'vue';
import VueMeta from 'vue-meta';
import './registerServiceWorker';
import '@/ui/plugins/vee-validate';
// asset imports
import '@/ui/styles/main.scss';
import '@rctech/web-ui/dist/web-ui.css';

// Import i18n related files
import { i18n } from '@/ui/plugins/i18n';
import { Trans } from '@/ui/plugins/Translation';
import Multilingual from '@/ui/plugins/multilingual';
// import rolesAndPermissions from '@/ui/plugins/rolesAndPermissions';
import formatCurrency from '@/ui/plugins/formatCurrency';

// Import other plugins
import vuetify from '@/ui/plugins/vuetify/vuetify';

import '@/ui/plugins/moment';
import prepareServices from '@/ui/plugins/services';

import VueAxe from 'vue-axe';
import Toasted from 'vue-toasted';
import router from './ui/router';
import App from './ui/App.vue';

Vue.use(Toasted, {
  position: 'top-right',
  duration: 5000,
  keepOnHover: false,
  fullWidth: false,
  type: 'error',
  fitToScreen: true,
  className: 'emis-toast',
  iconPack: 'mdi',
  closeOnSwipe: true,
  singleton: true,
});

// Declaration of global toaster used in whole application. We can then customize them with their respective class name

Vue.toasted.register('error', (message) => message, {
  type: 'error',
  icon: 'close-circle',
  className: 'emis-toast emis-toast-error',
  duration: null,
  action: {
    text: 'close',
    icon: 'mdi-close',
    onClick: (e, toastObject) => {
      toastObject.goAway(0);
    },
  },
});

Vue.toasted.register('warning', (message) => message, {
  type: 'warning',
  icon: 'alert',
  className: 'emis-toast emis-toast-warning',
});

Vue.toasted.register('success', (message) => message, {
  type: 'success',
  icon: 'check-circle',
  className: 'emis-toast emis-toast-success',
});

Vue.toasted.register('info', (message) => message, {
  type: 'info',
  icon: 'information',
  className: 'emis-toast emis-toast-info',
});

prepareServices(/* store */);

Vue.prototype.$i18nRoute = Trans.i18nRoute.bind(Trans);
Vue.config.productionTip = false;

// Some custom plugins
Vue.use(VueMeta);
Vue.use(Multilingual);
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

}).$mount('#app');
