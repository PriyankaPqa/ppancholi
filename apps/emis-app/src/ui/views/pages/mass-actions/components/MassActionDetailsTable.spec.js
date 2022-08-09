import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import { MassActionDataCorrectionType, MassActionType, mockCombinedMassAction } from '@libs/entities-lib/mass-action';
import { mockCombinedUserAccount } from '@libs/entities-lib/user-account';
import { mockStorage } from '@/storage';
import Component from './MassActionDetailsTable.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('MassActionDetailsTable.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
        },
        data() {
          return {
            userAccount: mockCombinedUserAccount(),
          };
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    it('should display the type of the mass action', () => {
      expect(wrapper.findDataTest('massActionTypeText').text()).toBe(wrapper.vm.massActionTypeText);
    });

    it('should display the date the mass action was created', () => {
      expect(wrapper.findDataTest('dateCreated').exists()).toBe(true);
    });

    it('should display user who created the mass action', () => {
      expect(wrapper.findDataTest('createdBy').text()).toBe(mockCombinedUserAccount().metadata.displayName);
    });
  });

  describe('Computed', () => {
    it('should return proper text for ImportValidationOfImpactStatus', () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction({ type: MassActionType.ImportValidationOfImpactStatus }),
        },
      });
      expect(wrapper.vm.massActionTypeText).toBe('massActions.type.importValidationImpactStatus');
    });

    it('should return proper text for FinancialAssistance', () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction({ type: MassActionType.FinancialAssistance }),
        },
      });
      expect(wrapper.vm.massActionTypeText).toBe('massActions.type.financialAssistance');
    });

    it('should return proper text for ImportPaymentStatuses', () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction({ type: MassActionType.ImportPaymentStatuses }),
        },
      });
      expect(wrapper.vm.massActionTypeText).toBe('massActions.type.importPaymentStatus');
    });

    it('should return proper text for ImportUsers', () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction({ type: MassActionType.ImportUsers }),
        },
      });
      expect(wrapper.vm.massActionTypeText).toBe('massActions.type.importUsers');
    });

    it('should return proper text for GenerateFundingRequest', () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction({ type: MassActionType.GenerateFundingRequest }),
        },
      });
      expect(wrapper.vm.massActionTypeText).toBe('massActions.type.fundingRequest');
    });

    it('should return proper text for data correction mass action', () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction({ type: MassActionDataCorrectionType.Labels }),
        },
      });
      expect(wrapper.vm.massActionTypeText).toBe(`enums.MassActionDataCorrectionType.${MassActionDataCorrectionType[MassActionDataCorrectionType.Labels]}`);
    });
  });
});
