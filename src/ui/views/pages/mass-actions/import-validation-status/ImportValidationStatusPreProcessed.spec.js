import { createLocalVue, mount, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import Component from './ImportValidationStatusPreProcessed.vue';
import MassActionPreProcessedProcessedBase from '@/ui/views/pages/mass-actions/components/MassActionPreProcessedProcessedBase.vue';
import { mockCombinedMassAction } from '@/entities/mass-action';
import routes from '@/constants/routes';

const localVue = createLocalVue();

const storage = mockStorage();

describe('ImportValidationStatusPreProcessed.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
          total: 10,
          successes: 5,
          failures: 5,
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
          total: 10,
          successes: 5,
          failures: 5,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('goToHome', () => {
      it('should redirect to home page', () => {
        wrapper.vm.goToHome();
        expect(wrapper.vm.$router.replace).toHaveBeenLastCalledWith({ name: routes.massActions.importValidationStatus.home.name });
      });
    });
  });
});
