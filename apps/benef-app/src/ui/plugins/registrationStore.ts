import Vue from 'vue';
import { useRegistrationStore } from '../../pinia/registration/registration';

export default {
  install: (V: typeof Vue) => {
    V.prototype.$registrationStore = useRegistrationStore();
  },
};
