import Vue from 'vue';
import { i18n } from '@/plugins/i18n';
import App from './App.vue';
import vuetify from './plugins/vuetify/vuetify';

Vue.config.productionTip = false;

new Vue({
  i18n,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
