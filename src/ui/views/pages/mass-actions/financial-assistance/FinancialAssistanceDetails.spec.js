import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import routes from '@/constants/routes';
import {
  mockMassActionRun, MassActionRunStatus, mockCombinedMassAction,
} from '@/entities/mass-action';
import { mockStorage } from '@/store/storage';

import FinancialAssistancePreProcessing from '@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistancePreProcessing.vue';
import FinancialAssistanceProcessing from '@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistanceProcessing.vue';

import Component from './FinancialAssistanceDetails.vue';

const localVue = createLocalVue();

const storage = mockStorage();

describe('ImportValidationStatusDetails.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('should render processing component if processing', () => {
      wrapper = mount(Component, {
        localVue,
        computed: {
          processing: () => true,
          massAction: () => mockCombinedMassAction(),
        },
      });
      expect(wrapper.findComponent(FinancialAssistanceProcessing).exists()).toBe(true);
    });

    it('should render pre-processing component if pre-processing', () => {
      wrapper = mount(Component, {
        localVue,
        computed: {
          preProcessing: () => true,
          massAction: () => mockCombinedMassAction(),
        },
      });
      expect(wrapper.findComponent(FinancialAssistancePreProcessing).exists()).toBe(true);
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('back', () => {
      it('should redirect to home page', () => {
        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toHaveBeenLastCalledWith({ name: routes.massActions.financialAssistance.home.name });
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('title', () => {
      it('should return proper title if processing', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.Processing }),
          },
        });
        expect(wrapper.vm.title).toBe('massActions.financialAssistance.status.processing.title');
      });

      it('should return proper title if pre-processing', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            lastRunEntity: () => mockMassActionRun({ runStatus: MassActionRunStatus.PreProcessing }),
          },
        });
        expect(wrapper.vm.title).toBe('massActions.financialAssistance.status.preprocessing.title');
      });
    });
  });
});
