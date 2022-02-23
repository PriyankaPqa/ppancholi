/**
 * @group ui/components/mass-action
 */

import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import { MassActionType, mockCombinedMassAction } from '@/entities/mass-action';
import Component from './MassActionDetailsTable.vue';
import { mockCombinedUserAccount } from '@/entities/user-account';

const localVue = createLocalVue();

describe('MassActionDetailsTable.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
          massActionType: MassActionType.ImportValidationOfImpactStatus,
        },
        data() {
          return {
            userAccount: mockCombinedUserAccount(),
          };
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
          massAction: mockCombinedMassAction(),
          massActionType: MassActionType.ImportValidationOfImpactStatus,
        },
      });
      expect(wrapper.vm.massActionTypeText).toBe('massActions.type.importValidationImpactStatus');
    });

    it('should return proper text for FinancialAssistance', () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
          massActionType: MassActionType.FinancialAssistance,
        },
      });
      expect(wrapper.vm.massActionTypeText).toBe('massActions.type.financialAssistance');
    });

    it('should return proper text for ImportPaymentStatuses', () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
          massActionType: MassActionType.ImportPaymentStatuses,
        },
      });
      expect(wrapper.vm.massActionTypeText).toBe('massActions.type.importPaymentStatus');
    });

    it('should return proper text for GenerateFundingRequest', () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
          massActionType: MassActionType.GenerateFundingRequest,
        },
      });
      expect(wrapper.vm.massActionTypeText).toBe('massActions.type.fundingRequest');
    });
  });
});
