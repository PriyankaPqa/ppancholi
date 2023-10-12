<template>
  <v-sheet
    rounded
    class="d-flex justify-space-between pa-3"
    :color="backgroundColor">
    <div class="rc-body14">
      <div v-if="displayLink" class="fw-bold" data-test="notification-subject-link">
        <button type="button" class="rc-link14" data-test="notification-subject-btn" @click="subjectClick">
          {{ $m(notification.subject) }}
        </button>
      </div>
      <div v-else class="fw-bold" data-test="notification-subject-text">
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
import { INotificationEntity, NotificationCategoryType } from '@libs/entities-lib/notification';
import helpers from '@/ui/helpers/helpers';
import { useTaskStore } from '@/pinia/task/task';
import { IEntity } from '@libs/entities-lib/base';
import routes from '@/constants/routes';

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
      targetEntity: null as IEntity,
      targetEntityLoaded: false,
    };
  },
  computed: {
    backgroundColor(): string {
      return this.notification?.isRead ? 'grey lighten-5' : 'primary lighten-2';
    },
    checkboxLabel(): string {
      return this.notification?.isRead ? 'notifications.mark_unread' : 'notifications.mark_read';
    },
    displayLink(): boolean {
      return this.notification.categoryType === NotificationCategoryType.Tasks && this.targetEntityLoaded;
    },
  },
  async created() {
    try {
      await this.fetchLinkedEntity();
    } catch {
      // intentionally not handled
      // -> in case of authorization violation or other error, this will result
      //    in no link or extended information being displayed
    }
  },
  methods: {
    toggleIsRead() {
      this.$emit('toggleIsRead', this.notification);
    },
    async fetchLinkedEntity() {
      // only to be done for Tasks for now
      if (this.notification.categoryType !== NotificationCategoryType.Tasks || !this.notification.targetEntityId || !this.notification.targetEntityParentId) {
        return;
      }

      this.targetEntity = useTaskStore().getById(this.notification.targetEntityId);
      if (!this.targetEntity || JSON.stringify(this.targetEntity) === '{}') {
        this.targetEntity = await useTaskStore().fetch({ caseFileId: this.notification.targetEntityParentId, id: this.notification.targetEntityId }, false);
      }
      if (this.targetEntity) {
        this.targetEntityLoaded = true;
      }
    },
    async subjectClick() {
      this.notification.isRead = true;
      this.toggleIsRead();

      const linkObject = this.targetEntityLink();
      if (linkObject) {
        await this.$router.push(linkObject);
      }
    },
    targetEntityLink(): any {
      // note: displayLink only for Tasks currently
      return this.displayLink
      ? {
          name: routes.caseFile.task.details.name,
          params: {
            id: this.notification.targetEntityParentId,
            taskId: this.notification.targetEntityId,
          },
        }
      : null;
    },
  },
});
</script>

<style scoped lang="scss">
  .v-input--checkbox::v-deep .v-label {
    font-size: 12px !important;
  }

</style>
