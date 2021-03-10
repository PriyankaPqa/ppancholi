import prepareServices from '@/ui/plugins/services';
import prepareStorage from '@/ui/plugins/storage';
import Vue from 'vue';
import '@/ui/styles/main.scss';
import '@/ui/plugins/vee-validate';
import {
  i18n, Trans,
} from '@/ui/plugins';
import Multilingual from '@/ui/plugins/multilingual';

import vuetify from '@/ui/plugins/vuetify/vuetify';
import App from './ui/App.vue';
import './registerServiceWorker';
import router from './ui/router';
import store from './store/store';

prepareServices(store);
prepareStorage(store);

Vue.use(Multilingual);

Vue.prototype.$i18nRoute = Trans.i18nRoute.bind(Trans);
Vue.config.productionTip = false;

new Vue({
  router,
  i18n,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
