<template>
  <v-sheet
    rounded
    class="d-flex justify-space-between pa-3"
    :color="backgroundColor">
    <div class="rc-body14 no-overflow">
      <div v-if="helperView && helperView.targetLink" class="fw-bold overflow-ellipsis" data-test="notification-subject-link">
        <button type="button" class="rc-link14" data-test="notification-subject-btn" @click="subjectClick">
          <v-icon v-if="helperView && helperView.icon" data-test="notification-link-icon" :color="'grey'" small>
            {{ helperView.icon }}
          </v-icon>
          {{ $m(notification.subject) }}
        </button>
      </div>
      <div v-else class="fw-bold overflow-ellipsis" data-test="notification-subject-text">
        <v-icon v-if="helperView && helperView.icon" data-test="notification-text-icon" :color="'grey'" small>
          {{ helperView.icon }}
        </v-icon>
        {{ $m(notification.subject) }}
      </div>
      <div data-test="notification-created-date">
        {{ $t('eventDetail.created') }} {{ helpers.getLocalStringDate((notification.created), 'Notification.created', 'PP') }}
        <span v-if="helperView && helperView.isUrgent" data-test="notification-urgent" class="red--text">
          {{ $t('task.create_edit.urgent') }}
        </span>
        <span v-if="helperView && helperView.isDueToday" data-test="notification-due-today" class="red--text">
          {{ $t('task.due_today') }}
        </span>
        <span v-if="helperView && helperView.isOverdue" data-test="notification-overdue" class="red--text">
          {{ $t('task.overdue') }}
        </span>
      </div>
    </div>
    <div class="d-flex align-end flex-column">
      <div v-if="caseFile" class="rc-caption12" data-test="notification-case-file-number">
        {{ caseFile.caseFileNumber }}
      </div>
      <v-checkbox v-model="notification.isRead" class="mt-0" :label="$t(checkboxLabel)" data-test="notification-chk-read" @change="toggleIsRead" />
    </div>
  </v-sheet>
</template>

<script lang="ts">
import Vue from 'vue';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { INotificationEntity, INotificationHelperView, NotificationCategoryType } from '@libs/entities-lib/notification';
import helpers from '@/ui/helpers/helpers';
import { useTaskStore } from '@/pinia/task/task';
import { useCaseFileStore } from '@/pinia/case-file/case-file';

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
    helperView(): INotificationHelperView {
      if (this.notification.categoryType !== NotificationCategoryType.Tasks) {
        return null;
      }

      return useTaskStore().getNotificationHelperView(this.notification.targetEntityId);
    },
    caseFile(): ICaseFileEntity {
      if (this.notification.categoryType !== NotificationCategoryType.Tasks) {
        return null;
      }

      return useCaseFileStore().getById(this.notification.targetEntityParentId);
    },
  },
  methods: {
    toggleIsRead() {
      this.$emit('toggleIsRead', this.notification);
    },
    async subjectClick() {
      this.notification.isRead = true;
      this.toggleIsRead();

      const linkObject = this.helperView?.targetLink;
      if (linkObject) {
        await this.$router.push(linkObject);
      }
    },
  },
});
</script>

<style scoped lang="scss">
  .v-input--checkbox::v-deep .v-label {
    font-size: 12px !important;
  }

  .red-text {
    color:  var(--v-status_error-base);
  }

  .no-overflow {
    overflow: hidden;
  }

  .overflow-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

</style>
