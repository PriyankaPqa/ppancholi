import { mockMember } from '@crctech/registration-lib/src/entities/value-objects/member';
import { mockIndigenousCommunitiesGetData, EIndigenousTypes } from '@crctech/registration-lib/src/entities/household-create';
import libHelpers from '@crctech/registration-lib/src/ui/helpers';
import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';

import Component from '../SplitHouseholdDialog.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const member = mockMember(mockMember({ id: '1' }));

describe('SplitHouseholdDialog', () => {
  let wrapper;
  storage.registration.getters.householdCreate = jest.fn(() => ({
    additionalMembers: [mockMember({ id: '1' }), mockMember({ id: '2' }), mockMember({ id: '3' })],
  }));

  storage.registration.getters.householdCreate = jest.fn(() => ({
    additionalMembers: [mockMember({ id: '1' }), mockMember({ id: '2' }), mockMember({ id: '3' })],
  }));

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
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
        mocks: { $storage: storage },
      });
    });

    describe('new primary member', () => {
      it('renders the display name', () => {
        const element = wrapper.findDataTest('household_profile_split_new_primary_member_name');
        expect(element.text()).toContain('John Smith');
      });

      describe('member info', () => {
        it('renders the right label', () => {
          const element = wrapper.findDataTest('household_profile_primary_member_split_label_mock-test-name-1');
          expect(element.text()).toContain('mock-label-1');
        });

        it('renders the right data', () => {
          const element = wrapper.findDataTest('household_profile_primary_member_split_data_mock-test-name-1');
          expect(element.text()).toContain('mock-data-1');
        });
      });
    });

    describe('additional members', () => {
      it('renders the display name', () => {
        const element = wrapper.findDataTest('household_profile_split_additional_member_name');
        expect(element.text()).toContain('John Smith');
      });

      describe('member info', () => {
        it('renders the right label', () => {
          const element = wrapper.findDataTest('household_profile_additional_member_split_label_mock-test-name-1');
          expect(element.text()).toContain('mock-label-1');
        });

        it('renders the right data', () => {
          const element = wrapper.findDataTest('household_profile_additional_member_split_data_mock-test-name-1');
          expect(element.text()).toContain('mock-data-1');
        });
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          show: true,
          newPrimaryMember: member,
        },
        mocks: { $storage: storage },
      });
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
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          show: true,
          newPrimaryMember: member,
        },
        mocks: { $storage: storage },
        store: {
          modules: {
            registration: {
              state: {
                indigenousCommunities: mockIndigenousCommunitiesGetData(),
              },
            },
          },
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
        expect(wrapper.vm.getIndigenousIdentity(altMember))
          .toEqual(`${mockIndigenousCommunitiesGetData()[0].communityName}, common.indigenous.types.InuitCommunity`);
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
        expect(wrapper.vm.getIndigenousIdentity(altMember)).toEqual('mock-community, common.indigenous.types.Other');
      });
    });

    describe('onCancel', () => {
      it('emits close', async () => {
        await wrapper.vm.onCancel();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });
  });
});
