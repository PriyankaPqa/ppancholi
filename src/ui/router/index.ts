import Vue from 'vue';
import VueRouter from 'vue-router';
import { routes } from '@/ui/router/routes';
import { provider } from '@/services/provider';
import { i18n } from '@/ui/plugins/i18n';
import store from '../../store/store';

Vue.use(VueRouter);

const Provider = provider();

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior: (to) => {
    if (to.hash) {
      return { selector: to.hash };
    }
    return { x: 0, y: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  localStorage.setItem('fromOutside', (from.name === null).toString());
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    try {
      // Get the latest sign-in status with msal service
      const isSignedIn = await Provider.authentications.isSignedIn();
      if (!isSignedIn) {
        await Provider.authentications.signIn();
        return;
      }
      await store.dispatch('user/fetchUserData');
    } catch (e) {
      // TODO: EMISDEV-5731
      Vue.toasted.global.error(i18n.t('common.error'));
      // Redirect to MSAL sign-in page
      await Provider.authentications.signIn();
    }
  }
  next();
});

export default router;
