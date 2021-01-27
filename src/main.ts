import Vue from 'vue';
import {
  i18n, Trans,
} from '@/ui/plugins';

import vuetify from '@/ui/plugins/vuetify/vuetify';
import App from './ui/App.vue';
import './registerServiceWorker';
import router from './ui/router';
import store from './store';

Vue.prototype.$i18nRoute = Trans.i18nRoute.bind(Trans);
Vue.config.productionTip = false;

new Vue({
  router,
  i18n,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
