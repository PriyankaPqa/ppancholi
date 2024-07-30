import { createLocalVue, mount } from '@/test/testSetup';
import Component from '@/ui/shared-components/NotificationCard.vue';
import { NotificationCategoryType, mockNotificationEntity } from '@libs/entities-lib/notification';
import { mockNotificationHelperView } from '@libs/entities-lib/task';
import helpers from '@/ui/helpers/helpers';
import routes from '@/constants/routes';
import { useMockTaskStore } from '@/pinia/task/task.mock';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';

const localVue = createLocalVue();

const { pinia, taskStore } = useMockTaskStore();
const { caseFileStore } = useMockCaseFileStore(pinia);

const mockNotification = mockNotificationEntity();
const mockReadNotification = mockNotificationEntity({ isRead: true });
const mockTaskNotification = mockNotificationEntity({
  categoryType: NotificationCategoryType.Tasks,
  targetEntityParentId: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
});

describe('NotificationCard.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mountWithNotification = (notification) => {
    wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        notification,
      },
    });
  };

  describe('Template', () => {
    describe('subject text and links', () => {
      it('should render subject text when not linked', () => {
        mountWithNotification(mockNotification);
        const text = wrapper.findDataTest('notification-subject-text');
        expect(text.text()).toEqual(mockNotification.subject.translation.en);
      });
      it('should hide link div when not linked', () => {
        mountWithNotification(mockNotification);
        const linkDiv = wrapper.findDataTest('notification-subject-link');
        expect(linkDiv.exists()).toBeFalsy();
      });
      it('should render expected link for task notification', async () => {
        mountWithNotification(mockTaskNotification);
        const linkDiv = wrapper.findDataTest('notification-subject-link');
        expect(linkDiv.text()).toEqual(mockTaskNotification.subject.translation.en);
      });
      it('should hide subject text for task notification', async () => {
        mountWithNotification(mockTaskNotification);
        const textDiv = wrapper.findDataTest('notification-subject-text');
        expect(textDiv.exists()).toBeFalsy();
      });
    });

    describe('checkboxes', () => {
      it('should render checkbox with expected label when unread', () => {
        mountWithNotification(mockNotification);
        const checkbox = wrapper.findDataTest('notification-chk-read');
        expect(checkbox.element.labels[0].innerHTML).toEqual('notifications.mark_read');
      });
      it('should render checkbox with expected label when read', () => {
        mountWithNotification(mockReadNotification);
        const checkbox = wrapper.findDataTest('notification-chk-read');
        expect(checkbox.element.labels[0].innerHTML).toEqual('notifications.mark_unread');
      });
    });

    describe('other text', () => {
      it('should render expected date', () => {
        mountWithNotification(mockNotification);
        const text = wrapper.findDataTest('notification-created-date');
        const dateText = helpers.getLocalStringDate((mockNotification.created), 'local', 'PP');
        expect(text.text()).toEqual(`eventDetail.created ${dateText}`);
      });
      it('should render Urgent when view marked as urgent', () => {
        taskStore.getNotificationHelperView = jest.fn(() => mockNotificationHelperView({ isUrgent: true }));
        mountWithNotification(mockTaskNotification);
        const urgentLabel = wrapper.findDataTest('notification-urgent');
        expect(urgentLabel.exists()).toBeTruthy();
      });
      it('should not render Urgent when view not marked as urgent', () => {
        taskStore.getNotificationHelperView = jest.fn(() => mockNotificationHelperView({ isUrgent: false }));
        mountWithNotification(mockTaskNotification);
        const urgentLabel = wrapper.findDataTest('notification-urgent');
        expect(urgentLabel.exists()).toBeFalsy();
      });
      it('should render Due Today when view marked as due today', () => {
        taskStore.getNotificationHelperView = jest.fn(() => mockNotificationHelperView({ isDueToday: true }));
        mountWithNotification(mockTaskNotification);
        const urgentLabel = wrapper.findDataTest('notification-due-today');
        expect(urgentLabel.exists()).toBeTruthy();
      });
      it('should not render Due Today when view not marked as due today', () => {
        taskStore.getNotificationHelperView = jest.fn(() => mockNotificationHelperView({ isDueToday: false }));
        mountWithNotification(mockTaskNotification);
        const urgentLabel = wrapper.findDataTest('notification-due-today');
        expect(urgentLabel.exists()).toBeFalsy();
      });
      it('should render Overdue when view marked as overdue', () => {
        taskStore.getNotificationHelperView = jest.fn(() => mockNotificationHelperView({ isOverdue: true }));
        mountWithNotification(mockTaskNotification);
        const urgentLabel = wrapper.findDataTest('notification-overdue');
        expect(urgentLabel.exists()).toBeTruthy();
      });
      it('should not render Overdue when view not marked as overdue', () => {
        taskStore.getNotificationHelperView = jest.fn(() => mockNotificationHelperView({ isOverdue: false }));
        mountWithNotification(mockTaskNotification);
        const urgentLabel = wrapper.findDataTest('notification-overdue');
        expect(urgentLabel.exists()).toBeFalsy();
      });
      it('should render case file number for task notifications', () => {
        mountWithNotification(mockTaskNotification);
        const extraTextLabel = wrapper.findDataTest('notification-case-file-number');
        expect(extraTextLabel.exists()).toBeTruthy();
      });
      it('should not render case file number for other notification types', () => {
        mountWithNotification(mockNotification);
        const extraTextLabel = wrapper.findDataTest('notification-case-file-number');
        expect(extraTextLabel.exists()).toBeFalsy();
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
    });

    describe('icons', () => {
      it('should render icon when part of view', () => {
        taskStore.getNotificationHelperView = jest.fn(() => mockNotificationHelperView({ icon: 'mdi-info' }));
        mountWithNotification(mockTaskNotification);
        const icon = wrapper.findDataTest('notification-link-icon');
        expect(icon.exists()).toBeTruthy();
      });
      it('should not render icon when not part of view', () => {
        taskStore.getNotificationHelperView = jest.fn(() => mockNotificationHelperView({ icon: null }));
        mountWithNotification(mockTaskNotification);
        const icon = wrapper.findDataTest('notification-link-icon');
        expect(icon.exists()).toBeFalsy();
      });
    });
  });

  describe('computed', () => {
    describe('helperView', () => {
      it('is not set for General notifications', async () => {
        mountWithNotification(mockNotification);
        expect(wrapper.vm.helperView).toBeFalsy();
      });
      it('is set for Task notifications when returned by the store', async () => {
        taskStore.getNotificationHelperView = jest.fn(() => mockNotificationHelperView());
        mountWithNotification(mockTaskNotification);
        expect(wrapper.vm.helperView).toBeTruthy();
      });
      it('is not set for Task notifications when not returned by the store', async () => {
        taskStore.getNotificationHelperView = jest.fn();
        mountWithNotification(mockTaskNotification);
        expect(wrapper.vm.helperView).toBeFalsy();
      });
    });
    describe('caseFile', () => {
      it('is not set for General notifications', async () => {
        mountWithNotification(mockNotification);
        expect(wrapper.vm.caseFile).toBeFalsy();
      });
      it('is set for Task notifications when returned by the store', async () => {
        mountWithNotification(mockTaskNotification);
        expect(wrapper.vm.caseFile).toBeTruthy();
      });
      it('is not set for Task notifications when not returned by the store', async () => {
        caseFileStore.getById = jest.fn();
        mountWithNotification(mockTaskNotification);
        expect(wrapper.vm.caseFile).toBeFalsy();
      });
    });
  });

  describe('methods', () => {
    describe('toggleIsRead', () => {
      it('should emit toggle isRead event when checked', () => {
        wrapper.vm.toggleIsRead(true);
        wrapper.vm.$nextTick();
        expect(wrapper.emitted('toggleIsRead')).toBeTruthy();
      });
    });
    describe('subjectClick', () => {
      it('marks the notification as read', async () => {
        expect(mockNotification.isRead).toBeFalsy();
        mountWithNotification(mockNotification);
        wrapper.vm.toggleIsRead = jest.fn();
        await wrapper.vm.subjectClick();
        expect(mockNotification.isRead).toBeTruthy();
        expect(wrapper.vm.toggleIsRead).toBeCalled();
      });
      it('navigates to the target link', async () => {
        const location = {
          name: routes.caseFile.task.details.name,
          params: {
            id: mockTaskNotification.targetEntityParentId,
            taskId: mockTaskNotification.targetEntityId,
          },
        };
        taskStore.getNotificationHelperView = jest.fn(() => mockNotificationHelperView({ targetLink: location }));
        mountWithNotification(mockTaskNotification);
        await wrapper.vm.subjectClick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith(location);
      });
    });
  });
});
