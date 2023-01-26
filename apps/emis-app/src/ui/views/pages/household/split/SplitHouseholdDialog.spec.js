import { mockMember } from '@libs/entities-lib/value-objects/member';
import { mockIndigenousCommunitiesGetData, EIndigenousTypes } from '@libs/entities-lib/household-create';
import libHelpers from '@libs/entities-lib/helpers';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';

import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import Component from './SplitHouseholdDialog.vue';

const localVue = createLocalVue();
const member = mockMember(mockMember({ id: '1' }));
const { pinia, registrationStore } = useMockRegistrationStore();

registrationStore.getHouseholdCreate = jest.fn(() => ({
  additionalMembers: [mockMember({ id: '1' }), mockMember({ id: '2' }), mockMember({ id: '3' })],
}));
describe('SplitHouseholdDialog', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          show: true,
          newPrimaryMember: member,
        },
        computed: {
          displayName() {
            return () => 'John Smith';
          },
          memberInfo() {
            return () => [
              {
                label: 'mock-label-1',
                data: 'mock-data-1',
                test: 'mock-test-name-1',
              },
            ];
          },
        },

      });
    });
    describe('new primary member', () => {
      it('renders the display name', () => {
        const element = wrapper.findDataTest('household_profile_split_new_primary_member_name');
        expect(element.text())
          .toContain('John Smith');
      });

      describe('member info', () => {
        it('renders the right label', () => {
          const element = wrapper.findDataTest('household_profile_primary_member_split_label_mock-test-name-1');
          expect(element.text())
            .toContain('mock-label-1');
        });

        it('renders the right data', () => {
          const element = wrapper.findDataTest('household_profile_primary_member_split_data_mock-test-name-1');
          expect(element.text())
            .toContain('mock-data-1');
        });
      });
    });

    describe('additional members', () => {
      it('renders the display name', () => {
        const element = wrapper.findDataTest('household_profile_split_additional_member_name');
        expect(element.text())
          .toContain('John Smith');
      });

      describe('member info', () => {
        it('renders the right label', () => {
          const element = wrapper.findDataTest('household_profile_additional_member_split_label_mock-test-name-1');
          expect(element.text())
            .toContain('mock-label-1');
        });

        it('renders the right data', () => {
          const element = wrapper.findDataTest('household_profile_additional_member_split_data_mock-test-name-1');
          expect(element.text())
            .toContain('mock-data-1');
        });
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          show: true,
          newPrimaryMember: member,
        },

      });
      registrationStore.getHouseholdCreate = jest.fn(() => ({
        additionalMembers: [mockMember({ id: '1' }), mockMember({ id: '2' }), mockMember({ id: '3' })],
      }));
    });

    describe('additionalMembers', () => {
      it('returns the right list of members, without the new primary member', () => {
        expect(wrapper.vm.additionalMembers).toEqual([mockMember({ id: '2' }), mockMember({ id: '3' })]);
      });
    });

    describe('displayName', () => {
      it('returns the right data', () => {
        expect(wrapper.vm.displayName(member)).toEqual(`${member.identitySet.firstName} ${member.identitySet.lastName}`);
      });
    });

    describe('householdId', () => {
      it('returns the right data', () => {
        registrationStore.getHouseholdCreate = jest.fn(() => ({ id: 'householdId' }));
        expect(wrapper.vm.householdId).toEqual('householdId');
      });
    });
  });

  describe('Lifecycle', () => {
    describe('create', () => {
      it('sets the value from the props initialAdditionalMembers into selectedMembers', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            show: true,
            newPrimaryMember: member,
            initialAdditionalMembers: ['foo'],
          },

        });

        expect(wrapper.vm.selectedMembers).toEqual(['foo']);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          show: true,
          newPrimaryMember: member,
        },
      });
    });

    describe('getBirthDate', () => {
      beforeEach(() => {
        jest.spyOn(libHelpers, 'displayBirthDate').mockImplementation(() => 'Jan 1, 1945');
        jest.spyOn(libHelpers, 'getAge').mockImplementation(() => '75');
      });

      it('calls the lib helper functions', () => {
        wrapper.vm.getBirthDate(member);
        expect(libHelpers.displayBirthDate).toHaveBeenCalled();
        expect(libHelpers.getAge).toHaveBeenCalled();
      });

      it('returns the right data', () => {
        expect(wrapper.vm.getBirthDate(member)).toEqual('Jan 1, 1945 (75 common.years)');
      });
    });

    describe('getGender', () => {
      it('returns the right data when gender is other', () => {
        const altMember = { ...member, identitySet: { ...member.identitySet, genderOther: 'mock-gender' } };
        expect(wrapper.vm.getGender(altMember)).toEqual('mock-gender');
      });
      it('returns the right data when gender is not other', () => {
        const altMember = { ...member, identitySet: { ...member.identitySet, genderOther: null } };
        expect(wrapper.vm.getGender(altMember)).toEqual(altMember.identitySet.gender.name.translation.en);
      });
    });

    describe('getIndigenousIdentity', () => {
      it('returns the right data ', () => {
        const altMember = {
          ...member,
          identitySet: {
            ...member.identitySet,
            indigenousType: EIndigenousTypes.InuitCommunity,
            indigenousCommunityId: mockIndigenousCommunitiesGetData()[0].id,
          },
        };
        registrationStore.indigenousCommunities = mockIndigenousCommunitiesGetData();
        expect(wrapper.vm.getIndigenousIdentity(altMember))
          .toEqual(`common.indigenous.types.InuitCommunity, ${mockIndigenousCommunitiesGetData()[0].communityName}`);
      });

      it('returns the right data if member has indigenousType other', () => {
        const altMember = {
          ...member,
          identitySet: {
            ...member.identitySet,
            indigenousType: EIndigenousTypes.Other,
            indigenousCommunityOther: 'mock-community',
          },
        };
        expect(wrapper.vm.getIndigenousIdentity(altMember)).toEqual('common.indigenous.types.Other, mock-community');
      });
    });

    describe('onClose', () => {
      it('emits close', async () => {
        await wrapper.vm.onClose();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });

      it('calls the storage mutation resetSplitHousehold', async () => {
        jest.clearAllMocks();
        await wrapper.vm.onClose();
        expect(registrationStore.resetSplitHousehold).toHaveBeenCalledTimes(1);
      });
    });

    describe('onNext', () => {
      it('calls the registration mutations setSplitHousehold with the right payload', async () => {
        wrapper.vm.onNext();
        expect(registrationStore.setSplitHousehold).toHaveBeenCalledWith({
          originHouseholdId: wrapper.vm.householdId,
          primaryMember: wrapper.vm.newPrimaryMember,
          additionalMembers: wrapper.vm.selectedMembers,
        });
      });

      it('calls router push with the right parameters', () => {
        wrapper.vm.onNext();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.household.householdSplit.name,
          params: {
            id: wrapper.vm.householdId,
          },
        });
      });
    });
  });
});
