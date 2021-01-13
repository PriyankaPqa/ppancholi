import Vue from 'vue';
import VueRouter from 'vue-router';
import { routes } from '@/ui/router/routes';
import routeConstants from '@/constants/routes';
import authenticationProvider from '@/auth/AuthenticationProvider';
import store from '@/store/store';

Vue.use(VueRouter);

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
      // Check if the user is already signed in and redirect to login page if not
      const isSignedIn = await authenticationProvider.isSignedIn();

      if (!isSignedIn) {
        await authenticationProvider.signIn();
      }

      // Dispatch the action to the store to fetch the user data from the JWT token
      // and store it in module state
      await store.dispatch('user/fetchUserData');
    } catch (e) {
      // If there is an error, redirect to the login error page
      next({
        name: routeConstants.loginError.name,
        params: {
          lang: to.params.lang,
        },
      });

      return;
    }
  }

  next();
});

export default router;
