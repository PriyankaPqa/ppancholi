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
  const doMount = async (shallow = true, otherOptions = {}) => {
    const option = {
      localVue,
      pinia,
      propsData: {
        task: mockPersonalTaskEntity(),
      },
      computed: {
        taskNames: () => mockOptionItems(),
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
    });
  });
});
