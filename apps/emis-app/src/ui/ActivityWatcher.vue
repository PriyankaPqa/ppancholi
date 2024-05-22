<template>
  <rc-confirmation-dialog
    ref="continueConfirm"
    :show.sync="showLogOutPopup"
    :title="$t('session_will_expire.title')"
    :messages="$t('session_will_expire.message', { x: logOutCountdown })"
    submit-button-key="session_will_expire.submit.label"
    submit-data-test="submit-continue-session"
    :show-cancel="false" />
</template>

<script lang="ts">
import Vue from 'vue';
import { useUserStore } from '@/pinia/user/user';
import RcConfirmationDialog from '@libs/component-lib/components/atoms/RcConfirmationDialog.vue';

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
    lastActivityTimeStamp: new Date() as Date,
    watcher: null as any,
    logOutTimer: null as any,
    logOutCountdownTimer: null as any,
    logOutCountdown: 0,
    showLogOutPopup: false,
  }),

  mounted() {
    if (this.stopOnInactivity) {
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
      this.lastActivityTimeStamp = new Date();

      clearInterval(this.watcher);
      this.watcher = setInterval(() => {
        const inactivityDuration = Math.floor((new Date().getTime() - this.lastActivityTimeStamp.getTime()) / 1000);
        const userInactive = inactivityDuration > this.maxInactivity;
        const userMustBeLoggedOff = inactivityDuration > this.maxInactivity + this.timeBeforeLogOut;

        if (userMustBeLoggedOff) {
          this.signOut();
          return;
        }

        if (userInactive) {
          this.onInactivity();
          clearInterval(this.watcher);
        }
      }, this.checkFrequency * 1000);
    },

    resetCounter() {
      this.lastActivityTimeStamp = new Date();
    },

    startCountdown() {
      this.logOutCountdown = this.timeBeforeLogOut;

      clearInterval(this.logOutCountdownTimer);
      this.logOutCountdownTimer = setInterval(() => {
        this.logOutCountdown -= 1;
      }, 1000);
    },

    async onInactivity() {
      // Will sign out in x seconds
      this.logOutTimer = setTimeout(() => {
        this.signOut();
      }, this.timeBeforeLogOut * 1000);

      this.startCountdown();
      this.showLogOutPopup = true;
      const continueSession = await (this.$refs.continueConfirm as InstanceType<typeof RcConfirmationDialog>).open();
      if (continueSession) {
        clearTimeout(this.logOutTimer);
        clearInterval(this.logOutCountdownTimer);
        this.showLogOutPopup = false;
        this.activityWatcher();
      }
    },

    signOut() {
      this.$signalR.unsubscribeAll();
      useUserStore().signOut();
    },
  },
});
</script>
