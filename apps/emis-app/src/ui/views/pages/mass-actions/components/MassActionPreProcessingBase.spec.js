import {
  createLocalVue,
  mount,
} from '@/test/testSetup';

import { mockMassActionEntity, mockMassActionMetadata } from '@libs/entities-lib/mass-action';
import MassActionProcessingBase from '@/ui/views/pages/mass-actions/components/MassActionProcessingBase.vue';
import MassActionDetailsTable from '@/ui/views/pages/mass-actions/components/MassActionDetailsTable.vue';
import Component from './MassActionPreProcessingBase.vue';

const localVue = createLocalVue();

describe('MassActionPreProcessingBase.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          massAction: mockMassActionEntity(),
          massActionMetadata: mockMassActionMetadata(),
        },
      });
    });

    describe('Template', () => {
      it('should render MassActionProcessingBase', () => {
        expect(wrapper.findComponent(MassActionProcessingBase).exists()).toBe(true);
      });

      it('should render MassActionDetailsTable', () => {
        expect(wrapper.findComponent(MassActionDetailsTable).exists()).toBe(true);
      });
    });
  });
});
