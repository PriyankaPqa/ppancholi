<template>
  <v-navigation-drawer
    :value="show"
    app
    right
    temporary
    :width="$vuetify.breakpoint.xs ? '100%' : '450px'"
    :style="$vuetify.breakpoint.xs ? '' : `top: ${$vuetify.application.top}px`"
    :height="$vuetify.breakpoint.xs ? '100%' : `calc(100vh - ${$vuetify.application.top}px)`"
    @input="updateShow">
    <v-toolbar color="grey darken-2" height="56" flat dark>
      <v-toolbar-title class="rc-title-3 white--text">
        {{ $t('notifications.title') }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn icon data-test="close-button" @click="updateShow(false)">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <rc-tabs>
      <rc-tab
        v-for="tab in tabs"
        :key="tab"
        :label="getTabLabel(tab)"
        :data-test="`notificationCenter-category--${tab}`"
        :active="selectedTab === tab"
        @click="switchTab(tab)" />
    </rc-tabs>
    <rc-page-loading v-if="initLoading" />
    <div v-if="!initLoading" class="pa-2">
      <div v-if="unreadNotifications.length > 0" class="d-flex justify-space-between pa-1">
        <div class="rc-body12 fw-medium section-heading" data-test="notifications-unread-text">
          {{ $t('notifications.unread') }}
        </div>
        <div class="rc-body14 fw-normal mark-all">
          {{ $t('notifications.mark_all_read') }}
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
        <v-btn
          color="primary"
          class="mx-md-4 my-4"
          data-test="notifications-load-more">
          {{ $t('notifications.load_more') }}
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageLoading, RcTab, RcTabs } from '@libs/component-lib/components';
import { useDashboardStore } from '@/pinia/dashboard/dashboard';
import { useNotificationStore } from '@/pinia/notification/notification';
import { INotificationEntity, NotificationCategoryType } from '@libs/entities-lib/notification';
import NotificationCard from '@/ui/shared-components/NotificationCard.vue';

export default Vue.extend({
  name: 'NotificationCenter',

  components: {
    NotificationCard,
    RcPageLoading,
    RcTabs,
    RcTab,
  },

  data() {
    return {
      initLoading: true,
      notifications: [] as INotificationEntity[],
      selectedTab: NotificationCategoryType.General,
    };
  },

  computed: {
    show(): boolean {
      return useDashboardStore().notificationCenterVisible;
    },
    tabs(): NotificationCategoryType[] {
      return [...new Set(this.notifications.map((n) => n.categoryType))];
    },
    readNotifications(): INotificationEntity[] {
      return this.notifications?.filter((n) => n.categoryType === this.selectedTab && n.isRead === true) || [];
    },
    unreadNotifications(): INotificationEntity[] {
      return this.notifications?.filter((n) => n.categoryType === this.selectedTab && n.isRead === false) || [];
    },
  },

  async created() {
      // this.initLoading = true;
      try {
       this.notifications = await useNotificationStore().getCurrentUserNotifications();
      } finally {
        this.initLoading = false;
      }
  },

  methods: {
    updateShow(value: boolean) {
      useDashboardStore().notificationCenterVisible = value;
    },

    async toggleIsRead(notification: INotificationEntity) {
      await useNotificationStore().updateIsRead(notification.id, notification.isRead);
    },

    getTabLabel(tab: NotificationCategoryType): string {
      const notification = this.notifications.find((n) => n.categoryType === tab);
      return this.$m(notification.category);
    },

    switchTab(tab: NotificationCategoryType) {
      this.selectedTab = tab;
    },
  },
});
</script>

<style scoped lang="scss">
  .section-heading {
    color: (--v-grey-darken2);
    text-transform: uppercase;
  }

  .mark-all {
    color: (--v-primary-darken1);
  }
</style>
