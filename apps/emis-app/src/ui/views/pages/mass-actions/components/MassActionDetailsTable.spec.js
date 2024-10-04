import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { MassActionDataCorrectionType, MassActionType, mockMassActionEntity } from '@libs/entities-lib/mass-action';
import { mockUserAccountMetadata } from '@libs/entities-lib/user-account';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';

import Component from './MassActionDetailsTable.vue';

const localVue = createLocalVue();

const { pinia, userAccountMetadataStore } = useMockUserAccountStore();

describe('MassActionDetailsTable.vue', () => {
  let wrapper;
  const doMount = (massActionType = MassActionType.Unknown) => {
    const options = {
      localVue,
      pinia,
      propsData: {
        massAction: mockMassActionEntity({ type: massActionType }),
      },
      data() {
        return {
          userAccount: mockUserAccountMetadata(),
        };
      },

    };
    wrapper = shallowMount(Component, options);
  };

  describe('Template', () => {
    beforeEach(() => {
      doMount();
    });

    it('should display the type of the mass action', () => {
      expect(wrapper.findDataTest('massActionTypeText').text()).toBe(wrapper.vm.massActionTypeText);
    });

    it('should display the date the mass action was created', () => {
      expect(wrapper.findDataTest('dateCreated').exists()).toBe(true);
    });

    it('should display user who created the mass action', () => {
      expect(wrapper.findDataTest('createdBy').text()).toBe(mockUserAccountMetadata().displayName);
    });
  });

  describe('Computed', () => {
    it('should return proper text for ImportValidationOfImpactStatus', () => {
      doMount(MassActionType.ImportValidationOfImpactStatus);
      expect(wrapper.vm.massActionTypeText).toBe('massActions.type.importValidationImpactStatus');
    });

    it('should return proper text for FinancialAssistance', () => {
      doMount(MassActionType.FinancialAssistance);
      expect(wrapper.vm.massActionTypeText).toBe('massActions.type.financialAssistance');
    });

    it('should return proper text for ImportPaymentStatuses', () => {
      doMount(MassActionType.ImportPaymentStatuses);
      expect(wrapper.vm.massActionTypeText).toBe('massActions.type.importPaymentStatus');
    });

    it('should return proper text for ImportUsers', () => {
      doMount(MassActionType.ImportUsers);
      expect(wrapper.vm.massActionTypeText).toBe('massActions.type.importUsers');
    });

    it('should return proper text for GenerateFundingRequest', () => {
      doMount(MassActionType.GenerateFundingRequest);
      expect(wrapper.vm.massActionTypeText).toBe('massActions.type.fundingRequest');
    });

    it('should return proper text for AuthenticationRetry', () => {
      doMount(MassActionType.AuthenticationRetry);
      expect(wrapper.vm.massActionTypeText).toBe('massActions.type.authenticationRetry');
    });

    it('should return proper text for data correction mass action', () => {
      doMount(MassActionDataCorrectionType.DataCorrectionLabels);
      expect(wrapper.vm.massActionTypeText).toBe(`enums.MassActionDataCorrectionType.${MassActionDataCorrectionType[MassActionDataCorrectionType.DataCorrectionLabels]}`);
    });

    describe('userAccountMetadata', () => {
      it('should get data from store with correct id', async () => {
        await wrapper.setProps({
          massAction: mockMassActionEntity({ createdBy: 'mock-user-id' }),
        });
        expect(userAccountMetadataStore.getById).toHaveBeenCalledWith('mock-user-id');
      });

      it('should return correct data', () => {
        userAccountMetadataStore.getById = jest.fn(() => mockUserAccountMetadata({ id: 'mock-user-id' }));
        expect(wrapper.vm.userAccountMetadata).toEqual(mockUserAccountMetadata({ id: 'mock-user-id' }));
      });
    });
  });

  describe('lifecycle', () => {
    describe('mounted', () => {
      it('should fetch userAccount metadata', async () => {
        await wrapper.setProps({
          massAction: mockMassActionEntity({ createdBy: 'mock-user-id' }),
        });
        await wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(userAccountMetadataStore.fetch).toHaveBeenCalledWith('mock-user-id', false);
      });
    });
  });
});
