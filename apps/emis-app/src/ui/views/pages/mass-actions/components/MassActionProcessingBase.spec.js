import {
  createLocalVue,
  mount,
} from '@/test/testSetup';

import { MassActionRunStatus, mockMassActionEntity, mockMassActionMetadata } from '@libs/entities-lib/mass-action';
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
          massAction: mockMassActionEntity(),
          massActionMetadata: mockMassActionMetadata(),
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
        expect(JSON.parse(component.text())).toEqual({ key: wrapper.vm.processTitle, params: [{ x: 50 }] });
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
