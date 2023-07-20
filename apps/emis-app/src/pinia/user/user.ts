import Vue, { ref } from 'vue';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import _intersection from 'lodash/intersection';

import {
  IMSALUserData,
  User,
  UserRoles,
} from '@libs/entities-lib/user';
import { i18n } from '@/ui/plugins';
import { defineStore } from 'pinia';

import userHelpers from './userHelpers';
import helpers from '../../ui/helpers/helpers';
import AuthenticationProvider from '../../auth/AuthenticationProvider';
import { localStorageKeys } from '../../constants/localStorage';

export const useUserStore = defineStore('user', () => {
  const oid = ref('');
  const family_name = ref('');
  const given_name = ref('');
  const email = ref('');
  const roles = ref([]);
  const homeAccountId = ref('');

  function getUser() {
    return new User({
      oid: oid.value,
      family_name: family_name.value,
      given_name: given_name.value,
      email: email.value,
      roles: roles.value,
      homeAccountId: homeAccountId.value,
    });
  }

  function getUserId() {
    return oid.value;
  }

  function getLandingPage() {
    const user = getUser();
    const role = user.currentRole();
    if (role === UserRoles.level0 || role === UserRoles.level1 || role === UserRoles.level2
      || role === UserRoles.contributorFinance || role === UserRoles.contributor3 || role === UserRoles.readonly) {
      return 'DashboardCaseFile';
    }
    if (role === UserRoles.contributorIM) {
      return 'HomeContributorIM';
    }
    if (role === UserRoles.level3) {
      return 'HomeLevel3';
    } if (role === UserRoles.level4) {
      return 'HomeLevel4';
    } if (role === UserRoles.level5) {
      return 'HomeLevel5';
    } if (role === UserRoles.level6) {
      return 'HomeLevel6';
    }
    return 'HomeNoRole';
  }

  function setUser(payload: IMSALUserData) {
    // roles: single-value attribute is a string from IdentityServer, but is an array from Azure AD
    if (typeof (payload?.roles) === 'string') {
      payload.roles = [payload.roles];
    }

    if (oid.value !== payload.oid || (email.value !== (payload.email || payload.preferred_username))) {
      oid.value = payload.oid;
      email.value = payload.email || payload.preferred_username;
      applicationInsights.setUserId(`${email.value}_${payload.oid}`);
      applicationInsights.setBasicContext({ name: email.value });
      applicationInsights.setBasicContext({ uid: oid.value });

      // login_hint: passed in OIDC auth call in subsequent login flows
      localStorage.setItem(localStorageKeys.loginHint.name, email.value);
    }

    family_name.value = payload.family_name;
    given_name.value = payload.given_name;
    homeAccountId.value = payload.homeAccountId;

    if (payload?.roles && roles.value[0] !== payload.roles[0]) {
      roles.value = [...payload.roles];
      applicationInsights.setBasicContext({ roles: roles.value });
    }
  }

  function setRole(payload: UserRoles) {
    if (roles.value[0] !== payload) {
      roles.value = [payload];
      applicationInsights.setBasicContext({ roles: roles.value });
    }
  }

  async function signOut() {
    await AuthenticationProvider.signOut();
  }

  function isRoleChanged(currentRoles: UserRoles[]):boolean {
    const previousRoles = roles.value;
    if (!currentRoles || !currentRoles.length || !previousRoles || !previousRoles.length) {
      return false;
    }
    return !(_intersection(currentRoles, previousRoles).length);
  }

  async function getCurrentRoles(): Promise<UserRoles[] | null> {
    const currentToken = await AuthenticationProvider.acquireToken('fetchUserData', false);
    if (currentToken) {
      const tokenRoles = helpers.decodeJwt(currentToken).roles;
      return typeof (tokenRoles) === 'string' ? [tokenRoles] : tokenRoles;
    }
    return null;
  }

  async function fetchUserData() {
    const currentRoles = await getCurrentRoles();

    if (!currentRoles) {
      throw new Error('currentRoles are undefined');
    }
    const roleChanged = isRoleChanged(currentRoles);

    // A user's role is only valid if it is the same as their previous stored roles.
    if (currentRoles && !roleChanged) {
      const userData = userHelpers.getUserData(currentRoles);
      if (userData) {
        setUser(userData);
      }
      return !!userData;
    }

    if (roleChanged) {
      // If the current roles are different from the previous roles, they are not valid, so the user needs to be logged out.
      // An error message will be displayed to the user for 2 seconds before the automatic log out.
      Vue.toasted.global.error(i18n.t('errors.access-change.log-out'));
      await helpers.timeout(2000);
      AuthenticationProvider.signOut();
      // Add a timer to give time to the sign-out page to load, otherwise our own login error page will flicker on the screen right before when this function returns null (bad UX)
      await helpers.timeout(2000);
    } else {
      applicationInsights.trackTrace('User data not valid', null, 'user', 'fetchUserData');
    }
    return null;
  }

  return {
    oid,
    family_name,
    given_name,
    email,
    roles,
    homeAccountId,
    getUser,
    getUserId,
    getLandingPage,
    setUser,
    setRole,
    signOut,
    fetchUserData,
    isRoleChanged,
    getCurrentRoles,
  };
});
