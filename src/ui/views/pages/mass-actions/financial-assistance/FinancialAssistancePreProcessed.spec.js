import { createLocalVue, mount, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import Component from './FinancialAssistancePreProcessed.vue';
import MassActionPreProcessedProcessedBase from '@/ui/views/pages/mass-actions/components/MassActionPreProcessedProcessedBase.vue';
import { mockCombinedMassAction, mockMassActionRunMetadata } from '@/entities/mass-action';
import routes from '@/constants/routes';

const localVue = createLocalVue();

const storage = mockStorage();

describe('FinancialAssistancePreProcessed.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
          lastRunMetadata: mockMassActionRunMetadata(),
        },
      });
    });

    describe('MassActionPreProcessedProcessedBase', () => {
      it('should be rendered', () => {
        expect(wrapper.findComponent(MassActionPreProcessedProcessedBase)
          .exists())
          .toBe(true);
      });

      it('should call goToHome on delete:success', async () => {
        const component = wrapper.findComponent(MassActionPreProcessedProcessedBase);
        wrapper.vm.goToHome = jest.fn();

        await component.vm.$emit('delete:success');

        expect(wrapper.vm.goToHome).toBeCalled();
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
          lastRunMetadata: mockMassActionRunMetadata(),
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('goToHome', () => {
      it('should redirect to home page', () => {
        wrapper.vm.goToHome();
        expect(wrapper.vm.$router.replace).toHaveBeenLastCalledWith({ name: routes.massActions.financialAssistance.home.name });
      });
    });
  });
});
