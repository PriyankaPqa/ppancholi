<template>
  <rc-confirmation-dialog
    ref="continueConfirm"
    :show.sync="showLogOutPopup"
    :title="$t('session_will_expire.title')"
    :messages="$t('session_will_expire.message.inactivity', { x: logOutCountdown })"
    submit-data-test="submit-continue-session"
    :show-cancel="false"
    :show-close="false"
    :show-submit="false" />
</template>

<script lang="ts">
import Vue from 'vue';
import { useUserStore } from '@/pinia/user/user';
import RcConfirmationDialog from '@libs/component-lib/components/atoms/RcConfirmationDialog.vue';
import { localStorageKeys } from '@/constants/localStorage';

export default Vue.extend({
  name: 'ActivityWatcher',
  components: {
    RcConfirmationDialog,
  },

  props: {
    /**
     * In seconds
     */
    maxInactivity: {
      type: Number,
      default: 60 * 30, // 30 minutes = 1800 seconds
    },

    /**
     * In seconds
     */
    checkFrequency: {
      type: Number,
      default: 1,
    },

    /**
     * In seconds
     */
    timeBeforeLogOut: {
      type: Number,
      default: 60,
    },

    activityEvents: {
      type: Array as () => string[],
      default: () => [
        'mousedown', 'mousemove', 'keydown',
        'scroll', 'touchstart',
      ],
    },

    /**
     * Is true if we want to log out on inactivity
     */
    stopOnInactivity: {
      type: Boolean,
      default: true,
    },
  },

  data: () => ({
    watcher: null as any,
    logOutTimer: null as any,
    logOutCountdownTimer: null as any,
    logOutCountdown: 0,
    showLogOutPopup: false,
    userInactive: false,
  }),

  mounted() {
    if (this.stopOnInactivity) {
      localStorage.setItem(localStorageKeys.lastActivityTimeStamp.name, new Date().toString());
      this.activityWatcher();

      this.activityEvents.forEach((eventName: string) => {
        document.addEventListener(eventName, this.resetCounter, true);
      });
    }
  },

  destroyed() {
    clearInterval(this.watcher);
    clearInterval(this.logOutCountdownTimer);
    clearTimeout(this.logOutTimer);
  },

  methods: {
    activityWatcher() {
      localStorage.setItem(localStorageKeys.lastActivityTimeStamp.name, new Date().toString());

      clearInterval(this.watcher);
      this.watcher = setInterval(() => {
        const localStorageTimeStamp = localStorage.getItem(localStorageKeys.lastActivityTimeStamp.name);
        const lastActivityTimeStamp = localStorageTimeStamp ? new Date(localStorageTimeStamp) : new Date();
        const inactivityDuration = Math.floor((new Date().getTime() - lastActivityTimeStamp.getTime()) / 1000);
        this.userInactive = inactivityDuration > this.maxInactivity;
        const userMustBeLoggedOff = inactivityDuration > this.maxInactivity + this.timeBeforeLogOut;

        if (userMustBeLoggedOff) {
          this.signOut();
          return;
        }

        if (this.userInactive && !this.showLogOutPopup) {
          this.onInactivity();
        }
      }, this.checkFrequency * 1000);
    },

    resetCounter() {
      localStorage.setItem(localStorageKeys.lastActivityTimeStamp.name, new Date().toString());
    },

    startCountdown() {
      this.logOutCountdown = this.timeBeforeLogOut;

      clearInterval(this.logOutCountdownTimer);
      this.logOutCountdownTimer = setInterval(() => {
        if (this.logOutCountdown > 0) {
          this.logOutCountdown -= 1;
        }
        if (!this.userInactive) {
          this.continueSession();
        }
      }, 1000);
    },

    async onInactivity() {
      // Will sign out in x seconds
      this.logOutTimer = setTimeout(() => {
          this.signOut();
      }, this.timeBeforeLogOut * 1000);

      this.startCountdown();
      this.showLogOutPopup = true;
    },

    continueSession() {
      clearTimeout(this.logOutTimer);
      clearInterval(this.logOutCountdownTimer);
      this.showLogOutPopup = false;
      this.activityWatcher();
    },

    signOut() {
      this.$signalR.unsubscribeAll();
      useUserStore().signOut();
    },
  },
});
</script>
