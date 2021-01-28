import Vue from 'vue';

export type VuePlugin = Vue & {
  $hasLevel: (p: string) => boolean;
  $hasRole: (p: string) => boolean;
};

export default {
  install: (V: typeof Vue) => {
    function hasLevel(this: Vue, levelToCheck: string) {
      const user = this.$storage.user.getters.user();
      return user.hasLevel(levelToCheck);
    }

    function hasRole(this: Vue, roleToCheck: string) {
      const user = this.$storage.user.getters.user();
      return user.hasRole(roleToCheck);
    }

    V.prototype.$hasLevel = hasLevel;
    V.prototype.$hasRole = hasRole;
  },
};
