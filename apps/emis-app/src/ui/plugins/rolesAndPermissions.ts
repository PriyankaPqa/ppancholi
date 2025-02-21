import { User, UserRoles } from '@libs/entities-lib/user';
import Vue from 'vue';
import { useUserStore } from '@/pinia/user/user';

export type VuePlugin = Vue & {
  $hasLevel: (p: string) => boolean;
  $hasRole: (p: string) => boolean;
  $currentUser: () => User;
};

export default {
  install: (V: typeof Vue) => {
    function currentUser(this: Vue) {
      return useUserStore().getUser();
    }

    function hasLevel(this: Vue, levelToCheck: UserRoles, strictLevel = false) {
      const user = useUserStore().getUser();

      return user ? user.hasLevel(levelToCheck, strictLevel) : false;
    }

    function hasRole(this: Vue, roleToCheck: UserRoles) {
      const user = useUserStore().getUser();

      return user ? user.hasRole(roleToCheck) : false;
    }

    V.prototype.$hasLevel = hasLevel;
    V.prototype.$hasRole = hasRole;
    V.prototype.$currentUser = currentUser;
  },
};
