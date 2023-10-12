import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockOptionItems, mockOptionItem } from '@libs/entities-lib/optionItem';
import { format } from 'date-fns';
import { mockPersonalTaskEntity } from '@libs/entities-lib/task';
import flushPromises from 'flush-promises';
import { useMockTaskStore } from '@/pinia/task/task.mock';
import Component from './PersonalTaskForm.vue';

const localVue = createLocalVue();
const { pinia, taskStore } = useMockTaskStore();

describe('PersonalTaskForm.vue', () => {
  let wrapper;
  const doMount = async (shallow = true, otherOptions = {}, level = 5) => {
    const option = {
      localVue,
      pinia,
      propsData: {
        taskData: mockPersonalTaskEntity(),
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

  describe('Computed', () => {
    describe('dueDateRule', () => {
      it('returns the right object if the call centre has a dueDate', async () => {
        wrapper.vm.taskData.dueDate = '2024-03-20';
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.dueDateRule).toEqual({
          mustBeAfterOrSame: { X: wrapper.vm.taskData.dueDate, Y: format(Date.now(), 'yyyy-MM-dd') },
        });
      });

      it('returns an empty object if the call centre does not have a dueDate', async () => {
        wrapper.vm.taskData.dueDate = null;
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.dueDateRule).toEqual({ });
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
          taskData: mockPersonalTaskEntity({ description: '' }),
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
        expect(wrapper.emitted('update:taskData')[0][0]).toEqual({
          ...wrapper.vm.taskData,
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
            taskData: mockPersonalTaskEntity(),
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
            taskData: mockPersonalTaskEntity(),
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
    });
  });
});
