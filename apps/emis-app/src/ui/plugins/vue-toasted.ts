import Vue from 'vue';
import Toasted from 'vue-toasted';

Vue.use(Toasted, {
  position: 'top-right',
  duration: 5000,
  keepOnHover: false,
  fullWidth: false,
  type: 'error',
  fitToScreen: true,
  className: 'emis-toast',
  iconPack: 'mdi',
  closeOnSwipe: true,
  singleton: true,
});

// Declaration of global toaster used in whole application. We can then customize them with their respective class name

Vue.toasted.register('error', (message) => message, {
  type: 'error',
  icon: 'close-circle',
  className: 'emis-toast emis-toast-error',
  duration: null,
  action: {
    text: '',
    icon: 'mdi-close',
    onClick: (e, toastObject) => {
      toastObject.goAway(0);
    },
  },
});

Vue.toasted.register('warning', (message) => message, {
  type: 'warning',
  icon: 'alert',
  className: 'emis-toast emis-toast-warning',
});

Vue.toasted.register('success', (message) => message, {
  type: 'success',
  icon: 'check-circle',
  className: 'emis-toast emis-toast-success',
});

Vue.toasted.register('info', (message) => message, {
  type: 'info',
  icon: 'information',
  className: 'emis-toast emis-toast-info',
});
