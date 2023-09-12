<template>
  <v-sheet
    rounded
    class="d-flex justify-space-between pa-3"
    :color="backgroundColor">
    <div class="rc-body14">
      <div class="fw-bold" data-test="notification-subject-text">
        {{ $m(notification.subject) }}
      </div>
      <div>{{ $t('eventDetail.created') }} {{ format(utcToZonedTime(new Date(notification.created), 'UTC'), 'MMM d, yyyy') }}</div>
    </div>
    <div class="d-flex align-center">
      <v-checkbox v-model="notification.isRead" label="Mark as Read" @change="toggleIsRead" />
    </div>
  </v-sheet>
</template>

<script lang="ts">
import Vue from 'vue';
import { INotificationEntity } from '@libs/entities-lib/notification';
import { format, utcToZonedTime } from 'date-fns-tz';

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
      format,
      utcToZonedTime,
    };
  },
  computed: {
    backgroundColor(): string {
      return this.notification?.isRead ? 'grey lighten5' : 'primary lighten-2';
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
