import { useMockDashboardStore } from '@/pinia/dashboard/dashboard.mock';
import { useMockNotificationStore } from '@/pinia/notification/notification.mock';
import { createLocalVue, mount } from '@/test/testSetup';
import Component from '@/ui/shared-components/NotificationCenter.vue';
import { NotificationCategoryType, mockNotificationEntity } from '@libs/entities-lib/notification';

const localVue = createLocalVue();

const mockUnreadGeneral = mockNotificationEntity({ id: '1' });
const mockReadGeneral = mockNotificationEntity({ id: '2', isRead: true });
const mockUnreadTasks = mockNotificationEntity({ id: '3', categoryType: NotificationCategoryType.Tasks });
const mockReadTasks = mockNotificationEntity({ id: '4', categoryType: NotificationCategoryType.Tasks, isRead: true });
const mockNotifications = [mockUnreadGeneral, mockReadGeneral, mockUnreadTasks, mockReadTasks];

const { pinia, notificationStore } = useMockNotificationStore();
const { dashboardStore } = useMockDashboardStore(pinia);

describe('NotificationCenter.vue', () => {
  let wrapper;

  const doMount = async (notifications) => {
    const items = notifications ?? mockNotifications;
    notificationStore.getCurrentUserNotifications = jest.fn(() => items);
    wrapper = mount(Component, {
      localVue,
      pinia,
    });
  };

  describe('Template', () => {
    it('should update show when close button clicked', async () => {
      await doMount();
      wrapper.vm.updateShow = jest.fn();
      const btn = wrapper.find('[data-test="close-button"]');
      await btn.trigger('click');
      expect(wrapper.vm.updateShow).toBeCalledWith(false);
    });
    it('should switch tabs when clicked', async () => {
      await doMount();
      wrapper.vm.switchTab = jest.fn();
      const tab = wrapper.find(`[data-test="notificationCenter-category--${NotificationCategoryType.Tasks}"]`);
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
    it('should have expected tabs from mock notification data', () => {
      expect(wrapper.vm.tabs).toEqual([NotificationCategoryType.General, NotificationCategoryType.Tasks]);
    });
    it('should contain expected read notifications', () => {
      expect(wrapper.vm.readNotifications).toContain(mockReadGeneral);
    });
    it('should contain expected unread notifications', () => {
      expect(wrapper.vm.unreadNotifications).toContain(mockUnreadGeneral);
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      await doMount();
    });
    it('should update store when updateShow is called', () => {
      dashboardStore.notificationCenterVisible = true;
      wrapper.vm.updateShow(false);
      expect(dashboardStore.notificationCenterVisible).toBeFalsy();
    });
    it('should update isRead in store when toggled', async () => {
      mockNotificationEntity.updateIsRead = jest.fn();
      await wrapper.vm.toggleIsRead(mockUnreadGeneral);
      expect(notificationStore.updateIsRead).toBeCalledWith(mockUnreadGeneral.id, mockUnreadGeneral.isRead);
    });
    it('should return expected tab label', () => {
      expect(wrapper.vm.getTabLabel(NotificationCategoryType.General)).toEqual('Category');
    });
    it('should switch tabs', () => {
      expect(wrapper.vm.selectedTab).toEqual(NotificationCategoryType.General);
      wrapper.vm.switchTab(NotificationCategoryType.Tasks);
      expect(wrapper.vm.selectedTab).toEqual(NotificationCategoryType.Tasks);
    });
  });
});
