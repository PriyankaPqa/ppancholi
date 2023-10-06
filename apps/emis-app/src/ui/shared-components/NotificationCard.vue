<template>
  <v-sheet
    rounded
    class="d-flex justify-space-between pa-3"
    :color="backgroundColor">
    <div class="rc-body14">
      <div class="fw-bold" data-test="notification-subject-text">
        {{ $m(notification.subject) }}
      </div>
      <div data-test="notification-created-date">
        {{ $t('eventDetail.created') }} {{ helpers.getLocalStringDate((notification.created), 'local', 'PP') }}
      </div>
    </div>
    <div class="d-flex align-center">
      <v-checkbox v-model="notification.isRead" :label="$t(checkboxLabel)" data-test="notification-chk-read" @change="toggleIsRead" />
    </div>
  </v-sheet>
</template>

<script lang="ts">
import Vue from 'vue';
import { INotificationEntity } from '@libs/entities-lib/notification';
import helpers from '@/ui/helpers/helpers';

export default Vue.extend({
  name: 'NotificationCard',

  props: {
    notification: {
      type: Object as () => INotificationEntity,
      required: true,
      default: null as INotificationEntity,
    },
  },
  data() {
    return {
      helpers,
    };
  },
  computed: {
    backgroundColor(): string {
      return this.notification?.isRead ? 'grey lighten-5' : 'primary lighten-2';
    },
    checkboxLabel(): string {
      return this.notification?.isRead ? 'notifications.mark_unread' : 'notifications.mark_read';
    },
  },
  methods: {
    toggleIsRead() {
      this.$emit('toggleIsRead', this.notification);
    },
  },
});
</script>

<style scoped lang="scss">
  .v-input--checkbox::v-deep .v-label {
    font-size: 12px !important;
  }

</style>
