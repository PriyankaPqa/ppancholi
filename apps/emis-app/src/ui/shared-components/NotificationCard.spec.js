import { createLocalVue, mount } from '@/test/testSetup';
import Component from '@/ui/shared-components/NotificationCard.vue';
import { NotificationCategoryType, mockNotificationEntity } from '@libs/entities-lib/notification';
import { mockTeamTaskEntity } from '@libs/entities-lib/task';
import helpers from '@/ui/helpers/helpers';
import routes from '@/constants/routes';
import { useMockTaskStore } from '@/pinia/task/task.mock';

const localVue = createLocalVue();

const { pinia, taskStore } = useMockTaskStore();

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
    describe('text and link', () => {
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
      it('should render expected link when displayLink is set', async () => {
        mountWithNotification(mockTaskNotification);
        const linkDiv = wrapper.findDataTest('notification-subject-link');
        expect(linkDiv.text()).toEqual(mockTaskNotification.subject.translation.en);
      });
      it('should hide subject text when displayLink is set', async () => {
        mountWithNotification(mockTaskNotification);
        const textDiv = wrapper.findDataTest('notification-subject-text');
        expect(textDiv.exists()).toBeFalsy();
      });
      it('should render expected date', () => {
        mountWithNotification(mockNotification);
        const text = wrapper.findDataTest('notification-created-date');
        const dateText = helpers.getLocalStringDate((mockNotification.created), 'local', 'PP');
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
    });
  });

  describe('computed', () => {
    describe('displayLink', () => {
      it('should display a link for Task notifications when entity is loaded', async () => {
        mountWithNotification(mockTaskNotification);
        expect(wrapper.vm.displayLink).toBeTruthy();
      });
      it('should not display a link for Task notifications when entity is not loaded', async () => {
        taskStore.getById = jest.fn();
        mountWithNotification(mockTaskNotification);
        expect(wrapper.vm.displayLink).toBeFalsy();
      });
      it('should not display a link for General notifications', async () => {
        mountWithNotification(mockNotification);
        expect(wrapper.vm.displayLink).toBeFalsy();
      });
    });
    describe('targetEntity', () => {
      it('is not set for General notifications', async () => {
        mountWithNotification(mockNotification);
        expect(wrapper.vm.targetEntity).toBeFalsy();
      });
      it('is set for Task notifications when returned by the store', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity());
        mountWithNotification(mockTaskNotification);
        expect(wrapper.vm.targetEntity).toBeTruthy();
      });
      it('is not set for Task notifications when not returned by the store', async () => {
        taskStore.getById = jest.fn();
        mountWithNotification(mockTaskNotification);
        expect(wrapper.vm.targetEntity).toBeFalsy();
      });
    });
    describe('targetEntityLoaded', () => {
      it('is true when targetEntity is set', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity());
        mountWithNotification(mockTaskNotification);
        expect(wrapper.vm.targetEntityLoaded).toBeTruthy();
      });
      it('is false when targetEntity is not set', async () => {
        taskStore.getById = jest.fn();
        mountWithNotification(mockTaskNotification);
        expect(wrapper.vm.targetEntityLoaded).toBeFalsy();
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
      it('marks the notificaiton as read', async () => {
        expect(mockNotification.isRead).toBeFalsy();
        mountWithNotification(mockNotification);
        wrapper.vm.toggleIsRead = jest.fn();
        await wrapper.vm.subjectClick();
        expect(mockNotification.isRead).toBeTruthy();
        expect(wrapper.vm.toggleIsRead).toBeCalled();
      });
      it('navigates to the target link', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity());
        mountWithNotification(mockTaskNotification);
        await wrapper.vm.subjectClick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.caseFile.task.details.name,
          params: {
            id: mockTaskNotification.targetEntityParentId,
            taskId: mockTaskNotification.targetEntityId,
          },
        });
      });
    });
    describe('targetEntityLink', () => {
      it('does not return a link for General notifications', () => {
        mountWithNotification(mockNotification);
        const link = wrapper.vm.targetEntityLink();
        expect(link).toBeFalsy();
      });
      it('returns a link for Task notifications when the target entity is loaded', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity());
        mountWithNotification(mockTaskNotification);
        const link = wrapper.vm.targetEntityLink();
        expect(link.name).toBeTruthy();
        expect(link.params.id).toEqual(mockTaskNotification.targetEntityParentId);
      });
      it('does not return a link for Task notifications when the target entity is not loaded', async () => {
        taskStore.getById = jest.fn();
        mountWithNotification(mockTaskNotification);
        const link = wrapper.vm.targetEntityLink();
        expect(link).toBeFalsy();
      });
    });
  });
});
