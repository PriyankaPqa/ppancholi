<template>
  <right-menu-template title-key="notifications.title" :show.sync="show">
    <template #main>
      <rc-tabs>
        <rc-tab
          v-for="tab in tabs"
          :key="tab"
          :label="getTabLabel(tab)"
          :data-test="`notificationCenter-category--${tab}`"
          :active="activeTab === tab"
          :show-dot="hasUnreadNotifications(tab)"
          @click="switchTab(tab)" />
      </rc-tabs>
      <rc-page-loading v-if="initLoading" />
      <div v-if="!initLoading" class="pa-2">
        <div v-if="unreadNotifications.length > 0" class="d-flex justify-space-between pa-1">
          <div class="rc-body12 fw-medium section-heading" data-test="notifications-unread-text">
            {{ $t('notifications.unread') }}
          </div>
          <div class="">
            <button type="button" class="rc-link14 fw-normal" data-test="btn-mark-all-read" @click="markAllAsRead">
              {{ $t('notifications.mark_all_read') }}
            </button>
          </div>
        </div>
        <v-col v-for="item in unreadNotifications" :key="item.id" class="pa-1 pb-3">
          <notification-card
            :notification="item"
            @toggleIsRead="toggleIsRead" />
        </v-col>
        <div v-if="readNotifications.length > 0" class="rc-body12 fw-medium section-heading pa-1" data-test="notifications-read-text">
          {{ $t('notifications.read') }}
        </div>
        <v-col v-for="item in readNotifications" :key="item.id" class="pa-1 pb-3">
          <notification-card
            :notification="item"
            @toggleIsRead="toggleIsRead" />
        </v-col>
        <div class="d-flex justify-center">
          <div v-if="notifications.length === 0" data-test="no_notifications" class="rc-body14 mt-2">
            {{ $t('common.search.no_result') }}
          </div>
        </div>
        <div class="d-flex justify-center">
          <span v-if="noMoreNotifications" data-test="no_more_notifications" class="rc-body14 mt-2">
            {{ $t('notifications.no_more') }}
          </span>
          <v-btn
            v-else
            color="primary"
            class="mx-md-4 my-4"
            data-test="notifications-load-more"
            @click="throttleLoadMore()">
            {{ $t('notifications.load_more') }}
          </v-btn>
        </div>
      </div>
    </template>
    <template #footer>
      <div v-if="!moreNotificationsLoaded" data-test="all-notifications-message" class="d-flex justify-center rc-body14 fw-normal footer-text pa-2">
        {{ $t('notifications.all_in_message') }}
      </div>
    </template>
  </right-menu-template>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageLoading, RcTab, RcTabs } from '@libs/component-lib/components';
import { useDashboardStore } from '@/pinia/dashboard/dashboard';
import { useNotificationStore } from '@/pinia/notification/notification';
import { useUserStore } from '@/pinia/user/user';
import { useTaskStore } from '@/pinia/task/task';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import { INotificationEntity, NotificationCategoryType } from '@libs/entities-lib/notification';
import NotificationCard from '@/ui/shared-components/NotificationCard.vue';
import { IFetchParams } from '@libs/services-lib/notifications/entity';
import _throttle from 'lodash/throttle';
import RightMenuTemplate from '../views/components/layout/RightMenuTemplate.vue';

const INITIAL_DAY_LIMIT = 30;
const LOAD_LIMIT = 25;
export default Vue.extend({

  name: 'NotificationCenter',

  components: {
    NotificationCard,
    RcPageLoading,
    RcTabs,
    RcTab,
    RightMenuTemplate,
  },

  data() {
    return {
      initLoading: true,
      selectedTab: NotificationCategoryType.General,
      noMoreNotifications: false,
      moreNotificationsLoaded: false,
      initialDayLimit: INITIAL_DAY_LIMIT,
    };
  },

  computed: {
    show: {
      get(): boolean {
        return useDashboardStore().notificationCenterVisible;
      },
      set(value: boolean) {
        useDashboardStore().notificationCenterVisible = value;
      },
    },
    tabs(): NotificationCategoryType[] {
      return [...new Set(this.notifications?.map((n) => n.categoryType))];
    },
    activeTab() : NotificationCategoryType {
      return this.tabs.length === 0 || this.tabs.includes(this.selectedTab)
        ? this.selectedTab
        : this.tabs[0];
    },
    currentUserId(): string {
      return useUserStore().getUserId();
    },
    notifications(): INotificationEntity[] {
      return useNotificationStore().getNotificationsByRecipient(this.currentUserId);
    },
    readNotifications(): INotificationEntity[] {
      return this.notifications?.filter((n) => n.categoryType === this.activeTab && n.isRead === true) || [];
    },
    unreadNotifications(): INotificationEntity[] {
      return this.notifications?.filter((n) => n.categoryType === this.activeTab && n.isRead === false) || [];
    },
  },

  watch: {
    async notifications(newValues: INotificationEntity[], oldValues: INotificationEntity[]) {
      if (this.initLoading) {
        return;
      }

      const difference = newValues?.filter((n) => !oldValues?.find((o) => o.id === n.id));
      await this.fetchTargetEntities(difference);
    },
  },

  async created() {
    await this.fetchNotifications({ numberOfDays: INITIAL_DAY_LIMIT });
  },

  methods: {
    async toggleIsRead(notification: INotificationEntity) {
      await useNotificationStore().updateIsRead([notification.id], notification.isRead);
    },

    async markAllAsRead() {
      await useNotificationStore().updateIsRead(this.unreadNotifications.map((n) => n.id), true);
    },

    getTabLabel(tab: NotificationCategoryType): string {
      const notification = this.notifications.find((n) => n.categoryType === tab);
      return this.$m(notification.category);
    },

    switchTab(tab: NotificationCategoryType) {
      this.selectedTab = tab;
    },

    hasUnreadNotifications(tab: NotificationCategoryType): boolean {
      return (this.notifications?.filter((n) => n.categoryType === tab && n.isRead === false) || []).length > 0;
    },

    async loadMore(limit = LOAD_LIMIT) {
      const fetchParams = this.notifications.length > 0
        ? { limit, beforeDateTimeUtc: this.notifications[this.notifications.length - 1].created }
        : { limit };
      const loadMoreResults = await this.fetchNotifications(fetchParams);
      this.noMoreNotifications = !loadMoreResults?.length || loadMoreResults.length < limit;
      this.moreNotificationsLoaded = true;
    },

    throttleLoadMore: _throttle(function func(this:any, limit = LOAD_LIMIT) {
      this.loadMore(limit);
    }, 5000),

    async fetchNotifications(params?: IFetchParams) {
      try {
        this.initLoading = true;
        const res = await useNotificationStore().fetchCurrentUserNotifications(params);
        await this.fetchTargetEntities(res);
        return res;
      } finally {
        this.initLoading = false;
      }
    },

    async fetchTargetEntities(fetchedNotifications: INotificationEntity[]) {
      const taskNotifications = fetchedNotifications?.filter((n) => n.categoryType === NotificationCategoryType.Tasks && n.targetEntityId);
      if (!taskNotifications || taskNotifications.length === 0) {
        return;
      }

      // for task notifications: trigger loading of related entities (tasks, case files) used in notification helper view
      await useTaskStore().fetchByIds([...new Set(taskNotifications.map((t) => t.targetEntityId))], true);
      await useCaseFileStore().fetchByIds([...new Set(taskNotifications.map((t) => t.targetEntityParentId))], true);
    },
  },
});
</script>

<style scoped lang="scss">
  .section-heading {
    color: var(--v-grey-darken2);
    text-transform: uppercase;
  }

  .footer-text {
    color: var(--v-grey-darken4);
  }
</style>
