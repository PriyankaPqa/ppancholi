import Vue from 'vue';
import VueRouter, { NavigationGuardNext, Route } from 'vue-router';
import { routes } from '@/ui/router/routes';
import routeConstants from '@/constants/routes';
import authenticationProvider from '@/auth/AuthenticationProvider';
import store from '@/store/store';
import { i18n } from '@/ui/plugins/i18n';

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

const hasLevel = (levelToCheck: string) => {
  const user = store.getters['user/user'];
  return user.hasLevel(levelToCheck);
};

const hasRole = (roleToCheck: string) => {
  const user = store.getters['user/user'];
  return user.hasRole(roleToCheck);
};

const authenticationGuard = async (to: Route) => {
  if (to.matched.some((record) => record.meta.requiresAuthentication)) {
    // Check if the user is already signed in and redirect to login page if not
    const isSignedIn = await authenticationProvider.isSignedIn();

    if (!isSignedIn) {
      await authenticationProvider.signIn();
    }

    // Dispatch the action to the store to fetch the user data from the JWT token
    // and store it in module state
    await store.dispatch('user/fetchUserData');
  }
};

const authorizationGuard = async (to: Route, from: Route, next: NavigationGuardNext) => {
  if (to.matched.some((record) => record.meta.requiresAuthorization)) {
    let hasProperLevel;
    let hasProperRole;

    if (to.meta.level) {
      hasProperLevel = hasLevel(to.meta.level);
    } else {
      hasProperLevel = false;
    }

    if (to.meta.roles) {
      hasProperRole = to.meta.roles.some((r: string) => hasRole(r));
    } else {
      hasProperRole = false;
    }

    if (hasProperLevel || hasProperRole) {
      next();
    } else {
      next(from);
      Vue.toasted.global.error(i18n.t('error.no_permission'));
    }
  }
};

router.beforeEach(async (to, from, next) => {
  localStorage.setItem('fromOutside', (from.name === null).toString());

  try {
    await authenticationGuard(to);
    await authorizationGuard(to, from, next);
    next();
  } catch (e) {
    // If there is an error, redirect to the login error page
    next({
      name: routeConstants.loginError.name,
      params: {
        lang: to.params.lang,
      },
    });
  }
});

export default router;
