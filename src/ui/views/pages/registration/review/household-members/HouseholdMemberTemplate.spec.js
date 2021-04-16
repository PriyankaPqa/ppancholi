import Vuetify from 'vuetify';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { EIndigenousTypes, mockGenderOther, mockPerson } from '@/entities/value-objects/person';
import TemporaryAddressTemplate from '@/ui/views/pages/registration/review/addresses/TemporaryAddressTemplate.vue';
import { ECanadaProvinces } from '@/types';
import Component from './HouseholdMemberTemplate.vue';

const localVue = createLocalVue();

describe('HouseholdMemberTemplate.vue', () => {
  let wrapper;
  beforeEach(async () => {
    const vuetify = new Vuetify();

    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      propsData: {
        person: mockPerson(),
        inlineEdit: false,
      },
      store: {
        modules: {
          registration: {
            state: {
              indigenousIdentities: {
                [ECanadaProvinces.AB]: [{
                  id: 'guid-community',
                  communityName: 'communityName',
                }],
              },
            },
          },
        },
      },
    });
  });

  describe('Template', () => {
    describe('Date of birth line', () => {
      it('should be displayed correctly', () => {
        expect(wrapper.findDataTest('householdMember__birthdate').text()).toEqual(wrapper.vm.getBirthDateLine);
      });
    });

    describe('Gender line', () => {
      it('should be displayed correctly', () => {
        expect(wrapper.findDataTest('householdMember__gender').text()).toEqual(wrapper.vm.getGender);
      });
    });

    describe('Indigenous line', () => {
      it('should be displayed correctly', () => {
        expect(wrapper.findDataTest('householdMember__indigenousIdentity').text()).toEqual(wrapper.vm.getIndigenousIdentity);
      });
    });

    describe('Temporary address', () => {
      it('should be displayed correctly', () => {
        expect(wrapper.findComponent(TemporaryAddressTemplate).exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    describe('getGender', () => {
      it('returns genderOther', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            person: mockPerson({ gender: mockGenderOther(), genderOther: 'unknown' }),
          },
        });

        expect(wrapper.vm.getGender).toEqual('unknown');
      });

      it('returns gender otherwise', () => {
        expect(wrapper.vm.getGender).toEqual(mockPerson().gender.name.translation.en);
      });
    });

    describe('getIndigenousIdentity', () => {
      it('returns the correct string is other community has been picked', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            person: mockPerson({ indigenousCommunityOther: 'other', indigenousType: EIndigenousTypes.Other }),
          },
        });

        expect(wrapper.vm.getIndigenousIdentity).toEqual('common.provinces.AB, common.indigenous.types.Other, other');
      });

      it('return the correct string', () => {
        expect(wrapper.vm.getIndigenousIdentity).toEqual('common.provinces.AB, common.indigenous.types.FirstNations, communityName');
      });
    });

    describe('getBirthDateLine', () => {
      it('should return the proper data', () => {
        const expected = 'registration.personal_info.birthdate: Feb 12, 1999 (22 common.years)';
        expect(wrapper.vm.getBirthDateLine).toEqual(expected);
      });
    });
  });
});
