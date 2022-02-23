import Vue from 'vue';

export type VuePlugin = Vue & {
  $hasLevel: (p: string) => boolean;
  $hasRole: (p: string) => boolean;
};

export default {
  install: (V: typeof Vue) => {
    function hasLevel(this: Vue, levelToCheck: string) {
      const user = this.$storage.user.getters.user();

      return user ? user.hasLevel(levelToCheck) : false;
    }

    function hasRole(this: Vue, roleToCheck: string) {
      const user = this.$storage.user.getters.user();

      return user ? user.hasRole(roleToCheck) : false;
    }

    V.prototype.$hasLevel = hasLevel;
    V.prototype.$hasRole = hasRole;
  },
};
