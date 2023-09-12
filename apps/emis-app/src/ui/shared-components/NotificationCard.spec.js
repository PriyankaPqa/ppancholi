import { createLocalVue, shallowMount } from '@/test/testSetup';
import Component from '@/ui/shared-components/NotificationCard.vue';
import { mockNotificationEntity } from '@libs/entities-lib/notification';

const localVue = createLocalVue();

const mockNotification = mockNotificationEntity();
const mockReadNotification = mockNotificationEntity({ isRead: true });

describe('NotificationCard.vue', () => {
  let wrapper;
  const mountWithNotification = (notification) => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        notification,
      },
    });
  };

  describe('Template', () => {
    describe('text', () => {
      it('should render expected subject', () => {
        mountWithNotification(mockNotification);
        const text = wrapper.findDataTest('notification-subject-text');
        expect(text.text()).toEqual(mockNotification.subject.translation.en);
      });
    });

    describe('isRead status and text', () => {
      it('should have expected color when unread', () => {
        mountWithNotification(mockNotification);
        expect(wrapper.vm.backgroundColor).toEqual('primary lighten-2');
      });
      it('should have expected color when read', () => {
        mountWithNotification(mockReadNotification);
        expect(wrapper.vm.backgroundColor).toEqual('grey lighten5');
      });
      it('should emit toggle isRead event when checked', () => {
        wrapper.vm.toggleIsRead(true);
        wrapper.vm.$nextTick();
        expect(wrapper.emitted('toggleIsRead')).toBeTruthy();
      });
    });
  });
});
