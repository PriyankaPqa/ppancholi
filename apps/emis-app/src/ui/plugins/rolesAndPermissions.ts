import Vue from 'vue';
import { useUserStore } from '@/pinia/user/user';

export type VuePlugin = Vue & {
  $hasLevel: (p: string) => boolean;
  $hasRole: (p: string) => boolean;
};

export default {
  install: (V: typeof Vue) => {
    function hasLevel(this: Vue, levelToCheck: string) {
      const user = useUserStore().getUser();

      return user ? user.hasLevel(levelToCheck) : false;
    }

    function hasRole(this: Vue, roleToCheck: string) {
      const user = useUserStore().getUser();

      return user ? user.hasRole(roleToCheck) : false;
    }

    V.prototype.$hasLevel = hasLevel;
    V.prototype.$hasRole = hasRole;
  },
};
