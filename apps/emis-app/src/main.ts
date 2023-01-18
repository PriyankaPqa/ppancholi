/* eslint-disable @typescript-eslint/no-unused-vars */
import Vue from 'vue';
import VueMeta from 'vue-meta';

// asset imports
import '@libs/shared-lib/assets/styles/main.scss';
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
import prepareStorage from '@/ui/plugins/storage';
import { SignalRService } from '@libs/services-lib/signal-r';

import { httpClient } from '@/services/httpClient';
import { SignalR } from '@/ui/plugins/signal-r';
import vuetify from '@libs/shared-lib/plugins/vuetify/vuetify';
import { createPinia, PiniaVuePlugin } from 'pinia';
import { useEventStore, useEventMetadataStore } from '@/pinia/event/event';
import { useUserStore } from '@/pinia/user/user';
import { useCaseFileReferralMetadataStore, useCaseFileReferralStore } from '@/pinia/case-file-referral/case-file-referral';
import { useUiStateStore } from '@/pinia/ui-state/uiState';
import { useCaseFileDocumentMetadataStore, useCaseFileDocumentStore } from '@/pinia/case-file-document/case-file-document';
import { useProgramMetadataStore, useProgramStore } from '@/pinia/program/program';
import { useMassActionMetadataStore, useMassActionStore } from '@/pinia/mass-action/mass-action';
import store from './store/store';
import router from './ui/router';
import App from './ui/App.vue';

Vue.use(PiniaVuePlugin);
const pinia = createPinia();
prepareServices(store);

const storage = prepareStorage(store);
const signalRService = new SignalRService(httpClient);

applicationInsights.initialize({
  connectionString: process.env.VITE_APPLICATION_INSIGHTS_CONNECTION_STRING,
  router,
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
  storage,
  showConsole: false,
});

new Vue({
  render: (h) => h(App),
  router,
  i18n,
  vuetify,
  store,
  pinia,
}).$mount('#app');

SignalR.instance.setPinia({
  userStore: useUserStore(),
  eventStore: useEventStore(),
  eventMetadataStore: useEventMetadataStore(),
  caseFileReferralStore: useCaseFileReferralStore(),
  caseFileReferralMetadataStore: useCaseFileReferralMetadataStore(),
  uiStateStore: useUiStateStore(),
  caseFileDocumentStore: useCaseFileDocumentStore(),
  caseFileDocumentMetadataStore: useCaseFileDocumentMetadataStore(),
  programStore: useProgramStore(),
  programMetadataStore: useProgramMetadataStore(),
  massActionStore: useMassActionStore(),
  massActionMetadataStore: useMassActionMetadataStore(),
});

// Directive fo v-visible so component is hidden but still take its place
Vue.directive('visible', (el, binding) => {
  el.style.visibility = binding.value ? 'visible' : 'hidden';
});
