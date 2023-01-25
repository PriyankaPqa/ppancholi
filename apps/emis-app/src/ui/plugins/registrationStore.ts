import Vue from 'vue';
import { useRegistrationStore } from '../../pinia/registration/registration';

export default {
  install: (V: typeof Vue) => {
    Vue.mixin({
      beforeCreate() {
        // This is an exception because it needs to be available in registration-lib as well
        V.prototype.$registrationStore = useRegistrationStore();
      },
    });
  },
};
