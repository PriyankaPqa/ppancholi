import prepareServices from '@/ui/plugins/services';
import prepareStorage from '@/ui/plugins/storage';
import Vue from 'vue';
import '@/ui/styles/main.scss';
import '@/ui/plugins/vee-validate';
import {
  i18n, Trans,
} from '@/ui/plugins';
import Multilingual from '@/ui/plugins/multilingual';
import '@/ui/plugins/vue-toasted';
import vuetify from '@/ui/plugins/vuetify/vuetify';
import { VueReCaptcha } from 'vue-recaptcha-v3';
import App from './ui/App.vue';
import './registerServiceWorker';
import router from './ui/router';
import store from './store/store';

prepareServices(store);
prepareStorage(store);

Vue.use(VueReCaptcha, {
  siteKey: process.env.VUE_APP_GOOGLE_RECAPTCHA_KEY,
  loaderOptions: {
    autoHideBadge: true,
  },
});

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
