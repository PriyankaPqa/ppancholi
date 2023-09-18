import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockTeamTaskEntity } from '@libs/entities-lib/task';
import { mockOptionItems } from '@libs/entities-lib/optionItem';
import { format } from 'date-fns';
import Component from './PersonalTaskForm.vue';

const localVue = createLocalVue();

describe('PersonalTaskForm.vue', () => {
  let wrapper;
  const doMount = async (shallow = true, otherOptions = {}) => {
    const option = {
      localVue,
      propsData: {
        task: mockTeamTaskEntity(),
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
});
