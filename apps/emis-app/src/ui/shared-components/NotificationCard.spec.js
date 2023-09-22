import { createLocalVue, mount } from '@/test/testSetup';
import Component from '@/ui/shared-components/NotificationCard.vue';
import { mockNotificationEntity } from '@libs/entities-lib/notification';
import { format, utcToZonedTime } from 'date-fns-tz';

const localVue = createLocalVue();

const mockNotification = mockNotificationEntity();
const mockReadNotification = mockNotificationEntity({ isRead: true });

describe('NotificationCard.vue', () => {
  let wrapper;
  const mountWithNotification = (notification) => {
    wrapper = mount(Component, {
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
      it('should render expected date', () => {
        mountWithNotification(mockNotification);
        const text = wrapper.findDataTest('notification-created-date');
        const dateText = format(utcToZonedTime(new Date(mockNotification.created), 'UTC'), 'MMM d, yyyy');
        expect(text.text()).toEqual(`eventDetail.created ${dateText}`);
      });
      it('should checkbox with expected label when unread', () => {
        mountWithNotification(mockNotification);
        const checkbox = wrapper.findDataTest('notification-chk-read');
        expect(checkbox.element.labels[0].innerHTML).toEqual('notifications.mark_read');
      });
      it('should checkbox with expected label when read', () => {
        mountWithNotification(mockReadNotification);
        const checkbox = wrapper.findDataTest('notification-chk-read');
        expect(checkbox.element.labels[0].innerHTML).toEqual('notifications.mark_unread');
      });
    });

    describe('isRead status and text', () => {
      it('should have expected color when unread', () => {
        mountWithNotification(mockNotification);
        expect(wrapper.vm.backgroundColor).toEqual('primary lighten-2');
      });
      it('should have expected color when read', () => {
        mountWithNotification(mockReadNotification);
        expect(wrapper.vm.backgroundColor).toEqual('grey lighten-5');
      });
      it('should emit toggle isRead event when checked', () => {
        wrapper.vm.toggleIsRead(true);
        wrapper.vm.$nextTick();
        expect(wrapper.emitted('toggleIsRead')).toBeTruthy();
      });
    });
  });
});
