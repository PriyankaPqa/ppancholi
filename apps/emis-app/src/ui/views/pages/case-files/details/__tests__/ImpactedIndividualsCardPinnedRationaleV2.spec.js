import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockReceivingAssistanceDetails } from '@libs/entities-lib/case-file-individual';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { mockUserAccountMetadata } from '@libs/entities-lib/user-account';
import Component from '../case-file-impacted-individualsV2/components/ImpactedIndividualsCardPinnedRationaleV2.vue';

const localVue = createLocalVue();
const { userAccountMetadataStore, userAccountStore, pinia } = useMockUserAccountStore();

const user = mockUserAccountMetadata();
user.roleId = '1bdf0ed1-284d-47e3-9366-a515d6af910d';
userAccountMetadataStore.getById = jest.fn(() => user);

describe('ImpactedIndividualsCardPinnedRationaleV2.vue', () => {
  let wrapper;

  const doMount = async (receivingAssistanceDetail) => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        pinnedDetail: receivingAssistanceDetail,
      },
    });
    await wrapper.vm.$nextTick();
  };

  describe('lifecycle', () => {
    describe('created', () => {
      it('calls store', async () => {
        await doMount(mockReceivingAssistanceDetails());
        expect(userAccountMetadataStore.fetchByIds).toHaveBeenCalledWith(['1dea3c36-d6a5-4e6c-ac36-078677b7da5f'], true);
        expect(userAccountStore.fetchRoles).toHaveBeenCalled();
      });
    });
  });

  describe('Computed', () => {
    describe('rationaleActionAndUserInfo', () => {
      it('should return proper data', async () => {
        await doMount(mockReceivingAssistanceDetails());
        expect(wrapper.vm.rationaleAndUserInfo).toEqual('impactedIndividuals.pinned_rationale.by Jane Smith (Recovery Manager) - May 1, 2023');
      });
    });
  });

  describe('Template', () => {
    describe('impacted_individuals_pinned_activity_action', () => {
      it('should display proper content when activity type is ImpactedIndividualReceivingAssistance', async () => {
        await doMount(mockReceivingAssistanceDetails());
        const element = wrapper.findDataTest('impacted_individuals_pinned_activity_action');
        expect(element.text()).toEqual('impactedIndividuals.pinned_rationale.receiving_assistance');
      });

      it('should display proper content when activity type is ImpactedIndividualNoLongerReceivingAssistance', async () => {
        const assist = mockReceivingAssistanceDetails();
        assist.receivingAssistance = false;
        await doMount(assist);
        const element = wrapper.findDataTest('impacted_individuals_pinned_activity_action');
        expect(element.text()).toEqual('impactedIndividuals.pinned_rationale.no_longer_receiving_assistance');
      });
    });
  });
});
