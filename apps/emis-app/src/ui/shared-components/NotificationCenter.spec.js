import { useMockDashboardStore } from '@/pinia/dashboard/dashboard.mock';
import { useMockNotificationStore } from '@/pinia/notification/notification.mock';
import { useMockUserStore } from '@/pinia/user/user.mock';
import { createLocalVue, mount } from '@/test/testSetup';
import Component from '@/ui/shared-components/NotificationCenter.vue';
import { NotificationCategoryType, mockNotificationEntity } from '@libs/entities-lib/notification';
import { useNotificationStore } from '@/pinia/notification/notification';
import { useMockTaskStore } from '@/pinia/task/task.mock';

const localVue = createLocalVue();

const mockUnreadGeneral = mockNotificationEntity({ id: '1' });
const mockReadGeneral = mockNotificationEntity({ id: '2', isRead: true });
const mockUnreadTasks = mockNotificationEntity({ id: '3', categoryType: NotificationCategoryType.Tasks });
const mockReadTasks = mockNotificationEntity({ id: '4', categoryType: NotificationCategoryType.Tasks, isRead: true });
const mockNotifications = [mockUnreadGeneral, mockReadGeneral, mockUnreadTasks, mockReadTasks];

const { pinia, notificationStore } = useMockNotificationStore();
const { dashboardStore } = useMockDashboardStore(pinia);
const { userStore } = useMockUserStore(pinia);
const { taskStore } = useMockTaskStore(pinia);

describe('NotificationCenter.vue', () => {
  let wrapper;

  const doMount = async (notifications) => {
    const items = notifications ?? mockNotifications;
    wrapper = mount(Component, {
      localVue,
      pinia,
      computed: {
        notifications() {
          return items;
        },
      },
    });

    wrapper.vm.show = true;
    await wrapper.vm.$nextTick();
  };

  describe('Template', () => {
    it('should switch tabs when clicked', async () => {
      await doMount();
      wrapper.vm.switchTab = jest.fn();
      const tab = wrapper.findDataTest(`notificationCenter-category--${NotificationCategoryType.Tasks}`);
      await tab.trigger('click');
      expect(wrapper.vm.switchTab).toBeCalledWith(NotificationCategoryType.Tasks);
    });
    it('should show expected sections when read and unread notifications', async () => {
      await doMount();
      expect(wrapper.findDataTest('notifications-unread-text').exists()).toBeTruthy();
      expect(wrapper.findDataTest('notifications-read-text').exists()).toBeTruthy();
    });
    it('should show expected sections when only read notifications', async () => {
      await doMount([mockReadGeneral]);
      expect(wrapper.findDataTest('notifications-unread-text').exists()).toBeFalsy();
      expect(wrapper.findDataTest('notifications-read-text').exists()).toBeTruthy();
    });
    it('should show expected sections when only unread notifications', async () => {
      await doMount([mockUnreadGeneral]);
      expect(wrapper.findDataTest('notifications-unread-text').exists()).toBeTruthy();
      expect(wrapper.findDataTest('notifications-read-text').exists()).toBeFalsy();
    });
    it('should show mark all as read button when unread notifications', async () => {
      await doMount([mockUnreadGeneral]);
      expect(wrapper.findDataTest('btn-mark-all-read').exists()).toBeTruthy();
    });
    it('should not show mark all as read button when only read notifications', async () => {
      await doMount([mockReadGeneral]);
      expect(wrapper.findDataTest('btn-mark-all-read').exists()).toBeFalsy();
    });

    describe('Load more button', () => {
      it('should call throttleLoadMore on click', async () => {
        await doMount([mockUnreadGeneral]);
        wrapper.vm.throttleLoadMore = jest.fn();
        const element = wrapper.findDataTest('notifications-load-more');
        await element.trigger('click');
        expect(wrapper.vm.throttleLoadMore).toHaveBeenCalledTimes(1);
      });
      it('should initially be displayed if no notifications', async () => {
        await doMount([]);
        const element = wrapper.findDataTest('notifications-load-more');
        expect(element.exists()).toBe(true);
      });
      it('should not be displayed if no more is true', async () => {
        await doMount([mockUnreadGeneral]);
        await wrapper.setData({ noMoreNotifications: true });
        const element = wrapper.findDataTest('notifications-load-more');
        expect(element.exists()).toBe(false);
      });
    });

    describe('No results', () => {
      it('should be displayed if no notifications', async () => {
        await doMount([]);
        const element = wrapper.findDataTest('no_notifications');
        expect(element.exists()).toBe(true);
      });
    });

    describe('No more results', () => {
      it('should not be displayed if no notifications', async () => {
        await doMount([]);
        const element = wrapper.findDataTest('no_more_notifications');
        expect(element.exists()).toBe(false);
      });
      it('should be displayed if no more is true', async () => {
        await doMount([mockUnreadGeneral]);
        await wrapper.setData({ noMoreNotifications: true });
        const element = wrapper.findDataTest('no_more_notifications');
        expect(element.exists()).toBe(true);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(async () => {
      await doMount();
    });
    it('should show when notification center visible is set', () => {
      dashboardStore.notificationCenterVisible = true;
      expect(wrapper.vm.show).toBeTruthy();
    });
    it('should not show when notification center visible is not set', () => {
      dashboardStore.notificationCenterVisible = false;
      expect(wrapper.vm.show).toBeFalsy();
    });
    it('should update store when show setter is called', () => {
      dashboardStore.notificationCenterVisible = true;
      wrapper.vm.show = false;
      expect(dashboardStore.notificationCenterVisible).toBeFalsy();
    });
    it('should have expected tabs from mock notification data', () => {
      expect(wrapper.vm.tabs).toEqual([NotificationCategoryType.General, NotificationCategoryType.Tasks]);
    });
    it('should contain expected read notifications', () => {
      expect(wrapper.vm.readNotifications).toContain(mockReadGeneral);
    });
    it('should contain expected unread notifications', () => {
      expect(wrapper.vm.unreadNotifications).toContain(mockUnreadGeneral);
    });
    it('should get the current user id from the user store', () => {
      userStore.getUserId = jest.fn(() => 'id');
      expect(wrapper.vm.currentUserId).toEqual('id');
    });
    it('should have correct active tab value when selected tab changes', () => {
      expect(wrapper.vm.activeTab).toEqual(NotificationCategoryType.General);
      wrapper.vm.selectedTab = NotificationCategoryType.Tasks;
      expect(wrapper.vm.activeTab).toEqual(NotificationCategoryType.Tasks);
    });
    it('should not have default selected tab as active (General) when not part of tab set', async () => {
      await doMount([mockUnreadTasks]);
      expect(wrapper.vm.tabs.length).toEqual(1);
      expect(wrapper.vm.tabs[0]).toEqual(NotificationCategoryType.Tasks);
      expect(wrapper.vm.activeTab).toEqual(NotificationCategoryType.Tasks);
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      await doMount();
    });
    it('should update isRead in store when toggled', async () => {
      notificationStore.updateIsRead = jest.fn();
      await wrapper.vm.toggleIsRead(mockUnreadGeneral);
      expect(notificationStore.updateIsRead).toBeCalledWith([mockUnreadGeneral.id], mockUnreadGeneral.isRead);
    });
    it('should update isRead in store when mark all clicked', async () => {
      notificationStore.updateIsRead = jest.fn();
      await wrapper.vm.markAllAsRead();
      expect(notificationStore.updateIsRead).toBeCalledWith([mockUnreadGeneral.id], true);
    });
    it('should return expected tab label', () => {
      expect(wrapper.vm.getTabLabel(NotificationCategoryType.General)).toEqual('Category');
    });
    it('should switch tabs', () => {
      expect(wrapper.vm.selectedTab).toEqual(NotificationCategoryType.General);
      wrapper.vm.switchTab(NotificationCategoryType.Tasks);
      expect(wrapper.vm.selectedTab).toEqual(NotificationCategoryType.Tasks);
    });

    describe('loadMore', () => {
      it('should call fetchNotifications with created date of the bottom notification and a limit of 25 per default', async () => {
        wrapper.vm.fetchNotifications = jest.fn();
        await wrapper.vm.loadMore();
        expect(wrapper.vm.fetchNotifications).toHaveBeenCalledWith({ beforeDateTimeUtc: '2021-04-06 06:39:04', limit: 25 });
      });
      it('should set noMoreNotifications to true if there are no results', async () => {
        wrapper.vm.fetchNotifications = jest.fn();
        expect(wrapper.vm.noMoreNotifications).toBe(false);
        await wrapper.vm.loadMore();
        expect(wrapper.vm.noMoreNotifications).toBe(true);
      });
      it('should set noMoreNotifications to true if there are fewer results than limit', async () => {
        wrapper.vm.fetchNotifications = jest.fn(() => mockNotifications);
        expect(wrapper.vm.noMoreNotifications).toBe(false);
        await wrapper.vm.loadMore(mockNotifications.length + 1);
        expect(wrapper.vm.noMoreNotifications).toBe(true);
      });
      it('should set noMoreNotifications to false if there are more results', async () => {
        wrapper.vm.fetchNotifications = jest.fn(() => mockNotifications);
        expect(wrapper.vm.noMoreNotifications).toBe(false);
        await wrapper.vm.loadMore(mockNotifications.length);
        expect(wrapper.vm.noMoreNotifications).toBe(false);
      });
    });

    describe('fetchNotifications', () => {
      it('should call fetchCurrentUserNotifications from the store', async () => {
        await wrapper.vm.fetchNotifications({
          limit: 2,
          beforeDateTimeUtc: '2023-09-12',
          numberOfDays: 15,
        });
        expect(useNotificationStore().fetchCurrentUserNotifications).toHaveBeenCalledWith({
          limit: 2,
          beforeDateTimeUtc: '2023-09-12',
          numberOfDays: 15,
        });
      });
      it('should call fetchTargetEntities', async () => {
        wrapper.vm.fetchTargetEntities = jest.fn();
        await wrapper.vm.fetchNotifications({
          limit: 2,
          beforeDateTimeUtc: '2023-09-12',
          numberOfDays: 15,
        });
        expect(wrapper.vm.fetchTargetEntities).toHaveBeenCalled();
      });
    });

    describe('fetchTargetEntities', () => {
      it('should do nothing if empty notification array passed in', async () => {
        await wrapper.vm.fetchTargetEntities([]);
        expect(taskStore.fetchByIds).toHaveBeenCalledTimes(0);
      });
      it('should do nothing when no task notification passed in', async () => {
        await wrapper.vm.fetchTargetEntities([mockReadGeneral]);
        expect(taskStore.fetchByIds).toHaveBeenCalledTimes(0);
      });
      it('should call task store when task notifications passed in', async () => {
        await wrapper.vm.fetchTargetEntities(mockNotifications);
        expect(taskStore.fetchByIds).toHaveBeenCalledWith([mockUnreadTasks.targetEntityId, mockReadTasks.targetEntityId], true);
      });
    });

    describe('throttleLoadMore', () => {
      it('should throttle loadMore by 5s', async () => {
        wrapper.vm.loadMore = jest.fn();

        wrapper.vm.throttleLoadMore();
        wrapper.vm.throttleLoadMore();
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 4000));
        wrapper.vm.throttleLoadMore();

        expect(wrapper.vm.loadMore).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('Created', () => {
      it('should call fetchNotifications with default day limit', async () => {
        await doMount();
        wrapper.vm.fetchNotifications = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.fetchNotifications).toHaveBeenCalledWith({
          numberOfDays: wrapper.vm.initialDayLimit,
        });
      });
    });
  });
});
