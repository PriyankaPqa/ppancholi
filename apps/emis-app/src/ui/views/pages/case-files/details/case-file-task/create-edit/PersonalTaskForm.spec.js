import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockOptionItems, mockOptionItem } from '@libs/entities-lib/optionItem';
import { format } from 'date-fns';
import { mockPersonalTaskEntity } from '@libs/entities-lib/task';
import flushPromises from 'flush-promises';
import { useMockTaskStore } from '@/pinia/task/task.mock';
import { useMockUserStore } from '@/pinia/user/user.mock';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import Component from './PersonalTaskForm.vue';

const localVue = createLocalVue();
const { pinia, taskStore } = useMockTaskStore();
const { userStore } = useMockUserStore(pinia);
const { userAccountMetadataStore } = useMockUserAccountStore(pinia);

describe('PersonalTaskForm.vue', () => {
  let wrapper;
  const doMount = async (shallow = true, otherOptions = {}, level = 5) => {
    const option = {
      localVue,
      pinia,
      propsData: {
        task: mockPersonalTaskEntity(),
      },
      computed: {
        taskNames: () => mockOptionItems(),
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}`,
      },
      ...otherOptions,
    };
    wrapper = shallow ? shallowMount(Component, option) : mount(Component, option);
    await wrapper.vm.$nextTick();
  };
  beforeEach(async () => {
    await doMount();
  });

  describe('Template', () => {
    describe('task-assigned-to', () => {
      it('should display Me when is not edit mode', async () => {
        await doMount(true, {
          propsData: {
            task: mockPersonalTaskEntity(),
            isEditMode: false,
          },
        });
        const element = wrapper.findDataTest('task-assigned-to');
        expect(element.text()).toEqual('task.create_edit.assigned_to.me');
      });

      it('should display the value of assignedToPerson', async () => {
        await doMount(true, {
          propsData: {
            task: mockPersonalTaskEntity(),
            isEditMode: true,
          },
          computed: {
            assignedToPerson: () => 'Good Man',
          },
        }, 6);
        const element = wrapper.findDataTest('task-assigned-to');
        expect(element.text()).toEqual('Good Man');
      });
    });
  });

  describe('Computed', () => {
    describe('dueDateRule', () => {
      it('returns the right object if the call centre has a dueDate', async () => {
        wrapper.vm.task.dueDate = '2024-03-20';
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.dueDateRule).toEqual({
          mustBeAfterOrSame: { X: wrapper.vm.task.dueDate, Y: format(Date.now(), 'yyyy-MM-dd') },
        });
      });

      it('returns an empty object if the call centre does not have a dueDate', async () => {
        wrapper.vm.task.dueDate = null;
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.dueDateRule).toEqual({ });
      });
    });

    describe('assignedToPerson', () => {
      it('should render assigned to me when user is creator', async () => {
        await doMount(true, {
          propsData: {
            task: mockPersonalTaskEntity({ createdBy: 'mock-user-1' }),
          },
        });

        await flushPromises();
        userStore.getUserId = jest.fn(() => 'mock-user-1');

        expect(wrapper.vm.assignedToPerson).toEqual('task.create_edit.assigned_to.me');
      });

      it('should return the name of creator when user is not creator and user has level6', async () => {
        userStore.getUserId = jest.fn(() => 'mock-user-2');
        // userAccountMetadataStore.getById = jest.fn(() => mockUser);
        await doMount(true, {
          propsData: {
            task: mockPersonalTaskEntity({ createdBy: 'mock-user-1' }),
          },
        }, 6);
        await flushPromises();
        expect(wrapper.vm.assignedToPerson).toEqual('Jane Smith');
      });
    });
  });

  describe('watcher', () => {
    describe('localPersonalTaskForm', () => {
      it('should emit update:task event and send proper data', async () => {
        jest.clearAllMocks();
        await doMount(true, {
          computed: {
            taskNames: () => [mockOptionItem({ id: 'mock-item-id', isOther: true, subitems: [] })],
          },
        });
        await wrapper.setProps({
          task: mockPersonalTaskEntity({ description: '' }),
        });

        const updatedForm = {
          name: {
            optionItemId: 'mock-item-id',
            specifiedOther: '',
          },
          description: 'mock-description',
          dueDate: '2023-08-01',
        };
        await wrapper.setData({
          localPersonalTaskForm: updatedForm,
        });
        expect(wrapper.emitted('update:task')[0][0]).toEqual({
          ...wrapper.vm.task,
          ...updatedForm,
        });
      });
    });
  });

  describe('lifecycle', () => {
    describe('created', () => {
      it('should assign data properly', async () => {
        await doMount(true, {
          propsData: {
            task: mockPersonalTaskEntity(),
          },
          computed: {
            taskNames: () => [mockOptionItem({ id: 'mock-item-id', isHidden: true, isOther: true, subitems: [] })],
          },
        });
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.localPersonalTaskForm).toEqual({
          name: {
            optionItemId: 'mock-item-id',
            specifiedOther: '',
          },
          dueDate: '2023-08-01',
          description: 'mock-description',
        });
      });

      it('should set filterOutHiddenTaskName to false and call fetchTaskCategories', async () => {
        await doMount(true, {
          propsData: {
            task: mockPersonalTaskEntity(),
          },
        });
        taskStore.fetchTaskCategories = jest.fn();
        taskStore.taskCategories = jest.fn(() => []);
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.filterOutHiddenTaskName).toEqual(false);
        expect(taskStore.fetchTaskCategories).toHaveBeenCalled();
      });

      it('should call useUserAccountMetadataStore fetch with proper data if user is not the creator', async () => {
        userStore.getUserId = jest.fn(() => 'mock-user-id-2');
        await doMount(true, {
          propsData: {
            task: mockPersonalTaskEntity({ createdBy: 'mock-user-id-1' }),
          },
        });
        userAccountMetadataStore.fetch = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(userAccountMetadataStore.fetch).toHaveBeenCalledWith('mock-user-id-1', false);
      });

      it('should not call useUserAccountMetadataStore fetch with proper data if user is the creator', async () => {
        userStore.getUserId = jest.fn(() => 'mock-user-id-1');
        await doMount(true, {
          propsData: {
            task: mockPersonalTaskEntity({ createdBy: 'mock-user-id-1' }),
          },
        });
        userAccountMetadataStore.fetch = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(userAccountMetadataStore.fetch).not.toHaveBeenCalled();
      });
    });
  });
});
