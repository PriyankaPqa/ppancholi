<template>
  <div />
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ActivityWatcher',

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
     * Stop watching for activity or inactivity
     */
    stopOnInactivity: {
      type: Boolean,
      default: true,
    },
  },

  data: () => ({
    secondsSinceLastActivity: 0,
    userInactive: false,
  }),

  watch: {
    userInactive(inactivity: boolean) {
      if (inactivity) {
        this.onInactivity();
      }
    },
  },

  mounted() {
    this.activityWatcher();

    this.activityEvents.forEach((eventName: string) => {
      document.addEventListener(eventName, this.resetCounter, true);
    });
  },

  methods: {
    activityWatcher() {
      this.secondsSinceLastActivity = 0;

      const watcher = setInterval(() => {
        this.secondsSinceLastActivity += this.checkFrequency;

        this.userInactive = this.secondsSinceLastActivity > this.maxInactivity;

        if (this.userInactive && this.stopOnInactivity) {
          clearInterval(watcher);
        }
      }, this.checkFrequency * 1000);
    },

    resetCounter() {
      this.secondsSinceLastActivity = 0;
    },

    async onInactivity() {
      // Will sign out in x seconds
      const logOutTimer = setTimeout(() => {
        this.signOut();
      }, this.timeBeforeLogOut * 1000);

      const continueSession = await this.$confirm({
        title: this.$t('session_will_expire.title'),
        messages: this.$t('session_will_expire.message', { x: this.timeBeforeLogOut }),
        htmlContent: '',
        submitActionLabel: this.$t('session_will_expire.submit.label'),
        showCancelButton: false,
      });

      if (continueSession) {
        clearTimeout(logOutTimer);
        this.activityWatcher();
      }
    },

    signOut() {
      this.$signalR.unsubscribeAll();
      this.$storage.user.actions.signOut();
    },
  },
});
</script>
