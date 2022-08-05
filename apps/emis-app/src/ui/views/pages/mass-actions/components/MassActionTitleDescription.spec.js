import {
  createLocalVue,
  mount,
} from '@/test/testSetup';

import { MassActionRunStatus, mockCombinedMassAction } from '@libs/entities-lib/mass-action';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import Component from './MassActionTitleDescription.vue';

const localVue = createLocalVue();

describe('MassActionTitleDescription.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
          massActionStatus: MassActionRunStatus.PreProcessed,
        },
      });
    });

    describe('Template', () => {
      it('should display the status chip', () => {
        expect(wrapper.findComponent(StatusChip).exists()).toBe(true);
      });

      describe('Edit button', () => {
        it('should be shown if showEditIcon is true', async () => {
          await wrapper.setProps({ showEditIcon: true });
          const component = wrapper.findDataTest('edit');
          expect(component.exists()).toBe(true);
        });

        it('should emit edit event when clicking', async () => {
          await wrapper.setProps({ showEditIcon: true });
          const component = wrapper.findDataTest('edit');
          await component.vm.$emit('click');
          expect(wrapper.emitted('edit')).toBeTruthy();
        });
      });

      describe('Delete button', () => {
        it('should be shown if showDeleteIcon is true', async () => {
          await wrapper.setProps({ showDeleteIcon: true });
          const component = wrapper.findDataTest('delete');
          expect(component.exists()).toBe(true);
        });

        it('should emit delete event when clicking', async () => {
          await wrapper.setProps({ showDeleteIcon: true });
          const component = wrapper.findDataTest('delete');
          expect(component.exists()).toBe(true);
        });
      });

      it('should show description if there is one', () => {
        const component = wrapper.findDataTest('description');
        expect(component.text()).toBe(wrapper.vm.massAction.entity.description);
      });
    });
  });
});
