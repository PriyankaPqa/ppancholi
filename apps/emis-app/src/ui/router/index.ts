import Vue from 'vue';
import VueRouter, { Route } from 'vue-router';
import applicationInsights from '@libs/core-lib/plugins/applicationInsights/applicationInsights';
import { PublicService } from '@libs/registration-lib/services/public';
import { routes } from '@/ui/router/routes';
import routeConstants from '@/constants/routes';
import AuthenticationProvider from '@/auth/AuthenticationProvider';
import store from '@/store/store';
import { i18n } from '@/ui/plugins/i18n';
import { TENANT_SETTINGS_ENTITIES, USER_ACCOUNT_ENTITIES } from '@/constants/vuex-modules';
import { ITenantSettingsEntity } from '@/entities/tenantSettings';
import { httpClient } from '@/services/httpClient';
import { sessionStorageKeys } from '@/constants/sessionStorage';

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
    const isSignedIn = await AuthenticationProvider.isAuthenticated();
    if (!isSignedIn) {
      await AuthenticationProvider.signIn('authenticationGuard');
    }

    // Dispatch the action to the store to fetch the user data from the JWT token
    // and store it in module state
    const loggedIn = await store.dispatch('user/fetchUserData');
    // if a currentUser is properly fetched, it means the user is allowed access to the app
    // (in the default tenants, even if the user has no access, his token is valid. Therefore, authentication check
    // based only on token check will pass, even if the user should not be allowed access)
    const isAppUser = await store.dispatch(`${USER_ACCOUNT_ENTITIES}/fetchCurrentUserAccount`);

    return loggedIn && isAppUser;
  }
  return true;
};

const featureGuard = async (to: Route) => {
  let featureEnabled = true;
  const { features } = store.getters[`${TENANT_SETTINGS_ENTITIES}/currentTenantSettings`] as ITenantSettingsEntity;
  if (!features?.length) {
    await store.dispatch(`${TENANT_SETTINGS_ENTITIES}/fetchCurrentTenantSettings`);
  }

  if (to.meta.feature) {
    const { features } = store.getters[`${TENANT_SETTINGS_ENTITIES}/currentTenantSettings`] as ITenantSettingsEntity;
    const feature = features.find((f) => f.key === to.meta.feature);
    featureEnabled = feature?.enabled;
  }

  if (!featureEnabled) {
    applicationInsights.trackTrace(`feature disabled ${to.fullPath}`, { to },
      'router', 'featureGuard');
    Vue.toasted.global.error(i18n.t('error.feature_disabled'));
  }

  return featureEnabled;
};

const authorizationGuard = async (to: Route) => {
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

    if ((!hasProperLevel && !hasProperRole)) {
      applicationInsights.trackTrace(`authorizationGuard ${to.fullPath}`, { to }, 'router', 'authorizationGuard');
      Vue.toasted.global.error(i18n.t('error.no_permission'));
      return false;
    }
    return true;
  }
  return true;
};

const initializeMSAL = async () => {
  const currentTenant = await new PublicService(httpClient).getTenantByEmisDomain(window.location.host);
  AuthenticationProvider.setCurrentTenantDomain(currentTenant);

  AuthenticationProvider.init();
  await AuthenticationProvider.loadAuthModule('router');
};

const checkAppVersion = () => {
  if (!sessionStorage.getItem(sessionStorageKeys.appVersion.name) || sessionStorage.getItem(sessionStorageKeys.appVersion.name) === 'Local build') {
    return;
  }
  setTimeout(() => {
    fetch(`/app-details.json?d=${(new Date()).toISOString()}`)
      .then((response) => response.json())
      .then((json) => {
        const newVersion = json.app_version;
        if (sessionStorage.getItem(sessionStorageKeys.appVersion.name) !== newVersion) {
          Vue.toasted.global.info(i18n.t('application_update.refreshing'));
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      });
  }, 3000);
};

router.beforeEach(async (to, from, next) => {
  if (!AuthenticationProvider.msalLibrary) {
    await initializeMSAL();
  }

  localStorage.setItem('fromOutside', (from.name === null).toString());
  let loginError = false;

  try {
    if (to.name === routeConstants.loginError.name || to.name === routeConstants.e2e.name) {
      next();
      return;
    }

    loginError = !await authenticationGuard(to);

    if (!loginError) {
      const authorized = await authorizationGuard(to);

      if (authorized) {
        // eslint-disable-next-line max-depth
        if (hasRole('noAccess')) {
          next();
          return;
        }
        const featureEnabled = await featureGuard(to);
        featureEnabled ? next() : next(from);
      } else {
        next(from);
      }
      checkAppVersion();
    }
  } catch (e) {
    applicationInsights.trackException(e, { context: 'route.beforeEach', to, from }, 'router', 'beforeEach');
    loginError = true;
  }

  if (loginError) {
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
