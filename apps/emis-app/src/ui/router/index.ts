import Vue from 'vue';
import VueRouter, { Route } from 'vue-router';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { PublicService } from '@libs/services-lib/public';
import { routes } from '@/ui/router/routes';
import routeConstants from '@/constants/routes';
import AuthenticationProvider from '@/auth/AuthenticationProvider';
import { i18n } from '@/ui/plugins/i18n';
import { FeatureKeys, IFeatureEntity } from '@libs/entities-lib/tenantSettings';
import { httpClient } from '@/services/httpClient';
import { useUserStore } from '@/pinia/user/user';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import { useUserAccountStore } from '@/pinia/user-account/user-account';
import { UserRoles } from '@libs/entities-lib/user';
import helpers from '@/ui/helpers/helpers';
import { isTemporaryBranch } from '@libs/shared-lib/helpers/temporary-branch';

Vue.use(VueRouter);

let isCheckingAppVersion = false;

const router = new VueRouter({
  mode: 'history',
  base: process.env.VITE_BASE_URL,
  routes,
  scrollBehavior: (to) => {
    if (to.hash) {
      return { selector: to.hash };
    }
    return { x: 0, y: 0 };
  },
});

const hasLevel = (levelToCheck: string) => {
  const user = useUserStore().getUser();
  return user.hasLevel(levelToCheck);
};

const hasRole = (roleToCheck: string) => {
  const user = useUserStore().getUser();
  return user.hasRole(roleToCheck);
};

const errorContent = {
  title: '',
  message: '',
};

const setErrorContent = (title: string, message: string) => {
  errorContent.title = title;
  errorContent.message = message;
};

const authenticationGuard = async (to: Route) => {
  if (to.matched.some((record) => record.meta.requiresAuthentication)) {
    // Check if the user is already signed in and redirect to login page if not
    const isSignedIn = await AuthenticationProvider.isAuthenticated();
    if (!isSignedIn) {
      await AuthenticationProvider.signIn();
    }

    // Dispatch the action to the store to fetch the user data from the JWT token
    // and store it in module state
    let loggedIn = false;
    try {
      loggedIn = await useUserStore().fetchUserData();
    } catch (e) {
      setErrorContent('loginError.fetchingUser.title', 'loginError.fetchingUser.message');
      return false;
    }
    // if a currentUser is properly fetched, it means the user is allowed access to the app
    // (in the default tenants, even if the user has no access, his token is valid. Therefore, authentication check
    // based only on token check will pass, even if the user should not be allowed access)
    const isAppUser = await useUserAccountStore().fetchCurrentUserAccount();

    return loggedIn && isAppUser;
  }
  return true;
};

const featureGuard = async (to: Route) => {
  let featureEnabled = true;

  const features = useTenantSettingsStore().currentTenantSettings.features;

  if (!features?.length) {
    try {
      await useTenantSettingsStore().fetchCurrentTenantSettings();
    } catch (e) {
      setErrorContent('loginError.tenantSettings.title', 'loginError.tenantSettings.message');
    }
  }

  if (to.meta.feature) {
    const features = useTenantSettingsStore().currentTenantSettings.features;
    const feature = features?.find((f: IFeatureEntity) => f.key === to.meta.feature);
    featureEnabled = feature?.enabled;
  }

  if (!featureEnabled) {
    applicationInsights.trackTrace(
      `feature disabled ${to.fullPath}`,
      { to },
      'router',
      'featureGuard',
    );
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
  const publicService = new PublicService(httpClient);
  let currentTenant = null;
  const urlSearchParams = new URLSearchParams(window.location.search);
  const forceTenant = urlSearchParams.get('force-tenant') || sessionStorage.getItem('force-tenant');

  if ((window.location.host.startsWith('localhost') || window.location.host.startsWith('emis-'))
      && forceTenant && forceTenant !== 'null') {
    currentTenant = forceTenant;
    sessionStorage.setItem('force-tenant', currentTenant);
    AuthenticationProvider.setCurrentTenantDomain(currentTenant);
  } else if (!window.location.host.startsWith('localhost')) {
    currentTenant = await publicService.getTenantByEmisDomain(window.location.host);
    AuthenticationProvider.setCurrentTenantDomain(currentTenant);
  }

  // FeatureKeys.UseIdentityServer
  // Use default tenant id for the public features lookup if localhost,
  //   or if tenant not resolved (feature branch subdomain)
  const tenant = currentTenant || process.env.VITE_LOCALHOST_DEFAULT_TENANTID;
  httpClient.setHeadersTenant(tenant);

  const features = await publicService.getPublicFeatures();
  const feature = features?.find((f: IFeatureEntity) => f.key === FeatureKeys.UseIdentityServer);
  const useIdentityServer = !!feature?.enabled;

  // Feature branch case for IdentityServer
  if (useIdentityServer && !window.location.host.startsWith('localhost') && !currentTenant) {
    AuthenticationProvider.setCurrentTenantDomain(tenant);
  }

  if (useIdentityServer) {
    const invitationCode = urlSearchParams.get('invite-code');
    const invitationEmail = urlSearchParams.get('invite-email');
    if (invitationCode) {
      AuthenticationProvider.setUserInvitationParameters(invitationCode, invitationEmail);
    }
  }

  AuthenticationProvider.init(useIdentityServer, tenant);
  await AuthenticationProvider.loadAuthModule('router');
};

const notifyUserRefresh = () => {
  Vue.toasted.global.info(i18n.t('application_update.refreshing'));
  setTimeout(() => {
    window.location.reload();
  }, 3000);
};

const checkAppVersion = () => {
  const currentVersion = process.env.VITE_VERSION;
  if (isCheckingAppVersion || !currentVersion || currentVersion === 'Local build') {
    return;
  }
  isCheckingAppVersion = true;
  const features = useTenantSettingsStore().currentTenantSettings.features;
  const isVersionFlagOn = !!features?.find((f: IFeatureEntity) => f.key === FeatureKeys.NoReloadOnNewVersion)?.enabled;

  setTimeout(() => {
    fetch(`/app-details.json?d=${(new Date()).toISOString()}`)
      .then((response) => response.json())
      .then((json) => {
        const newVersion = json.app_version;
        if (isVersionFlagOn) {
          const isVersionBump = helpers.isMinorOrMajorVersionBump(currentVersion, newVersion);
          if (isVersionBump) {
            // eslint-disable-next-line vue/max-len
            applicationInsights.trackTrace(`Minor or major version was increased - build version ${currentVersion}, CDN version ${newVersion} -immediate reload necessary`, { }, 'router', 'checkAppVersion');
            notifyUserRefresh();
          } else {
            isCheckingAppVersion = false;
          }
        } else if (currentVersion === newVersion) {
          isCheckingAppVersion = false;
        } else if (currentVersion > newVersion) {
          applicationInsights.trackTrace(`Version mismatch, but continuing as build version ${currentVersion} > CDN version ${newVersion}`, { }, 'router', 'checkAppVersion');
          isCheckingAppVersion = false;
        } else {
            applicationInsights.trackTrace(`Version mismatch - build version ${currentVersion}, CDN version ${newVersion}`, { }, 'router', 'checkAppVersion');
            notifyUserRefresh();
          }
      })
      .catch(() => {
        isCheckingAppVersion = false;
      });
  }, 3000);
};

router.onError((error: Error) => {
  if (error.message.includes('Failed to fetch dynamically imported module') || error.message.includes('error loading dynamically imported module')) {
    applicationInsights.trackTrace('Error fetching module', { }, 'router', 'onError');
    notifyUserRefresh();
  }
});

router.beforeEach(async (to, from, next) => {
  if (to.name === routeConstants.loginError.name) {
    next();
    return;
  }

  let loginError = false;

  try {
    if (!AuthenticationProvider.msalLibrary) {
      await initializeMSAL();
    }

    localStorage.setItem('fromOutside', (from.name === null).toString());

    loginError = !await authenticationGuard(to);
    if (!loginError) {
      const authorized = await authorizationGuard(to);

      if (authorized) {
        // eslint-disable-next-line max-depth
        if (hasRole(UserRoles.noAccess)) {
          next();
          return;
        }
        const featureEnabled = await featureGuard(to);
        featureEnabled ? next() : next(from);
      } else {
        next(from);
      }
      // We don't want to check app version when testing a feature branch
      if (!isTemporaryBranch(process.env.VITE_TEMP_BRANCH_ID)) {
        checkAppVersion();
      }
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
        title: errorContent.title,
        message: errorContent.message,
      },
    });
  }
});

export default router;
