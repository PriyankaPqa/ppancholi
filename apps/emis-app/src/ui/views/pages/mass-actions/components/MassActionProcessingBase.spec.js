import {
  createLocalVue,
  mount,
} from '@/test/testSetup';

import { MassActionRunStatus, mockCombinedMassAction } from '@/entities/mass-action';
import MassActionTitleDescription from '@/ui/views/pages/mass-actions/components/MassActionTitleDescription.vue';
import Component from './MassActionProcessingBase.vue';

const localVue = createLocalVue();

describe('MassActionProcessingBase.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
          massActionStatus: MassActionRunStatus.Processing,
        },
      });
    });

    describe('Template', () => {
      it('should render MassActionTitleDescription', () => {
        expect(wrapper.findComponent(MassActionTitleDescription).exists()).toBe(true);
      });

      it('should render processTitle if there is one', () => {
        const component = wrapper.findDataTest('processTitle');
        expect(component.text()).toBe(wrapper.vm.processTitle);
      });

      it('should render processLabelOne if there is one', () => {
        const component = wrapper.findDataTest('processLabelOne');
        expect(component.text()).toBe(wrapper.vm.processLabelOne);
      });

      it('should render processLabelTwo if there is one', () => {
        const component = wrapper.findDataTest('processLabelTwo');
        expect(component.text()).toBe(wrapper.vm.processLabelTwo);
      });
    });
  });
});
