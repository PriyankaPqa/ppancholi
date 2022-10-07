import Vuetify from 'vuetify';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockMember } from '@libs/entities-lib/value-objects/member';
import { EIndigenousTypes, mockGenderOther } from '@libs/entities-lib/value-objects/identity-set';
import CurrentAddressTemplate from '../addresses/CurrentAddressTemplate.vue';
import Component from './AdditionalMemberTemplate.vue';

const localVue = createLocalVue();

describe('AdditionalMemberTemplate.vue', () => {
  let wrapper;
  beforeEach(async () => {
    const vuetify = new Vuetify();

    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      propsData: {
        member: mockMember(),
        inlineEdit: false,
      },
      store: {
        modules: {
          registration: {
            state: {
              indigenousCommunities: [{
                id: 'guid-community',
                communityName: 'communityName',
              }],
            },
          },
        },
      },
    });
  });

  describe('Template', () => {
    describe('Date of birth line', () => {
      it('should be displayed correctly', () => {
        expect(wrapper.findDataTest('additionalMember__birthdate').text()).toEqual(wrapper.vm.getBirthDateLine);
      });
    });

    describe('Gender line', () => {
      it('should be displayed correctly', () => {
        expect(wrapper.findDataTest('additionalMember__gender').text()).toEqual(wrapper.vm.getGender);
      });
    });

    describe('Indigenous line', () => {
      it('should be displayed correctly', () => {
        expect(wrapper.findDataTest('additionalMember__indigenousIdentity').text()).toEqual(wrapper.vm.getIndigenousIdentity);
      });
    });

    describe('Temporary address', () => {
      it('should be displayed correctly', () => {
        expect(wrapper.findComponent(CurrentAddressTemplate).exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    describe('getGender', () => {
      it('returns genderOther', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            member: mockMember({ identitySet: { gender: mockGenderOther(), genderOther: 'unknown' } }),
          },
        });

        expect(wrapper.vm.getGender).toEqual('unknown');
      });

      it('returns gender otherwise', () => {
        expect(wrapper.vm.getGender).toEqual(mockMember().identitySet.gender.name.translation.en);
      });
    });

    describe('getIndigenousIdentity', () => {
      it('returns the correct string is other community has been picked', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            member: mockMember({ identitySet: { indigenousCommunityOther: 'other', indigenousType: EIndigenousTypes.Other } }),
          },
        });

        expect(wrapper.vm.getIndigenousIdentity).toEqual('common.indigenous.types.Other');
      });

      it('return the correct string', () => {
        expect(wrapper.vm.getIndigenousIdentity).toEqual('common.indigenous.types.FirstNation');
      });
    });

    describe('getBirthDateLine', () => {
      it('should return the proper data', () => {
        const expected = 'registration.personal_info.birthdate: Feb 12, 1999 (23 common.years)';
        expect(wrapper.vm.getBirthDateLine).toEqual(expected);
      });
    });
  });
});
