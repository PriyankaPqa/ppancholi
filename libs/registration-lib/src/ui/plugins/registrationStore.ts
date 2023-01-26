import Vue from 'vue';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';

const { registrationStore } = useMockRegistrationStore();

export default {
  install: (V: typeof Vue) => {
    Vue.mixin({
      beforeCreate() {
        // This is an exception because it needs to be available in registration-lib as well
        V.prototype.$registrationStore = registrationStore;
      },
    });
  },
};
