import Vuetify from 'vuetify';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import _merge from 'lodash/merge';
import { EIndigenousTypes, mockGenderOther, mockPerson } from '../../../../entities/value-objects/person';
import { ECanadaProvinces } from '../../../../types';
import {
  mockContactInformation,
  mockPreferredLanguageOther,
  mockPrimarySpokenLanguageOther,
} from '../../../../entities/value-objects/contact-information';
import Component from './PersonalInformationTemplate.vue';

const localVue = createLocalVue();

const validPersonalInformation = _merge(mockContactInformation(), mockPerson());

describe('PersonalInformationTemplate.vue', () => {
  let wrapper;
  beforeEach(async () => {
    const vuetify = new Vuetify();

    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      propsData: {
        personalInformation: validPersonalInformation,
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

  describe('Computed', () => {
    describe('displayData', () => {
      it('should include firstName', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.firstName',
          value: wrapper.vm.personalInformation.firstName,
          test: 'firstName',
        });
      });

      it('should include middleName', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.middleName',
          value: wrapper.vm.personalInformation.middleName || '-',
          test: 'middleName',
        });
      });

      it('should include lastName', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.lastName',
          value: wrapper.vm.personalInformation.lastName,
          test: 'lastName',
        });
      });

      it('should include preferredName', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.preferredName',
          value: wrapper.vm.personalInformation.preferredName || '-',
          test: 'preferredName',
        });
      });

      it('should include birthDate', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.birthdate',
          value: wrapper.vm.getBirthDate,
          test: 'birthDate',
        });
      });

      it('should include gender', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.gender',
          value: wrapper.vm.getGender,
          test: 'gender',
        });
      });

      it('should include preferredLanguage', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.preferredLanguage',
          value: wrapper.vm.getPreferredLanguage,
          test: 'preferredLanguage',
        });
      });

      it('should include primarySpokenLanguage', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.primarySpokenLanguage',
          value: wrapper.vm.getPrimarySpokenLanguage,
          test: 'primarySpokenLanguage',
        });
      });

      it('should include mobilePhone', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.mobilePhoneNumber',
          value: wrapper.vm.getMobilePhoneNumber,
          test: 'mobilePhone',
        });
      });

      it('should include homePhone', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.homePhoneNumber',
          value: wrapper.vm.getHomePhoneNumber,
          test: 'homePhone',
        });
      });

      it('should include otherPhone', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.alternatePhoneNumber',
          value: wrapper.vm.getOtherPhoneNumber,
          test: 'otherPhone',
        });
      });

      it('should include otherPhoneExtension', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.otherPhoneExtension',
          value: wrapper.vm.personalInformation.otherPhoneExtension,
          test: 'otherPhoneExtension',
        });
      });

      it('should include email', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.emailAddress',
          value: wrapper.vm.personalInformation.email,
          test: 'email',
        });
      });

      it('should include selfIdentification', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.selfIdentification',
          value: wrapper.vm.getIndigenousIdentity,
          test: 'indigenousIdentity',
        });
      });
    });

    describe('getBirthDate', () => {
      it('returns the birthdate if exists', () => {
        expect(wrapper.vm.getBirthDate).toEqual('Feb 12, 1999');
      });

      it('returns the birthdate with age', async () => {
        await wrapper.setProps({
          showAgeInReview: true,
        });
        expect(wrapper.vm.getBirthDate).toEqual('Feb 12, 1999 (22 common.years)');
      });

      it('returns "" otherwise', async () => {
        await wrapper.setProps({
          personalInformation: {
            ...validPersonalInformation,
            birthDate: {
              year: '',
              month: '',
              day: '',
            },
          },
        });
        expect(wrapper.vm.getBirthDate).toEqual('');
      });
    });

    describe('getPrimarySpokenLanguage', () => {
      it('returns primarySpokenLanguageOther', async () => {
        await wrapper.setProps({
          personalInformation: _merge(mockPrimarySpokenLanguageOther(), mockPerson()),
        });
        expect(wrapper.vm.getPrimarySpokenLanguage).toEqual(mockPrimarySpokenLanguageOther().primarySpokenLanguageOther);
      });

      it('primarySpokenLanguage otherwise', () => {
        expect(wrapper.vm.getPrimarySpokenLanguage)
          .toEqual(mockContactInformation().primarySpokenLanguage.name.translation.en);
      });
    });

    describe('getPreferredLanguage', () => {
      it('returns preferredLanguageOther', async () => {
        await wrapper.setProps({
          personalInformation: _merge(mockPreferredLanguageOther(), mockPerson()),
        });
        expect(wrapper.vm.getPreferredLanguage).toEqual(mockPreferredLanguageOther().preferredLanguageOther);
      });

      it('preferredLanguage otherwise', () => {
        expect(wrapper.vm.getPreferredLanguage)
          .toEqual(mockContactInformation().preferredLanguage.name.translation.en);
      });
    });

    describe('getGender', () => {
      it('returns genderOther', async () => {
        await wrapper.setProps({
          personalInformation: _merge(
            mockContactInformation(),
            mockPerson({ gender: mockGenderOther(), genderOther: 'unknown' }),
          ),
        });

        expect(wrapper.vm.getGender).toEqual('unknown');
      });

      it('returns gender otherwise', () => {
        expect(wrapper.vm.getGender).toEqual(mockPerson().gender.name.translation.en);
      });
    });

    describe('getMobilePhoneNumber', () => {
      it('returns mobilePhone number', () => {
        expect(wrapper.vm.getMobilePhoneNumber).toEqual(mockContactInformation().mobilePhone.number);
      });

      it('returns - otherwise', async () => {
        await wrapper.setProps({
          personalInformation: _merge(
            mockContactInformation({ mobilePhone: null }),
            mockPerson(),
          ),
        });
        expect(wrapper.vm.getMobilePhoneNumber).toEqual('-');
      });
    });

    describe('getHomePhoneNumber', () => {
      it('returns homePhone number', () => {
        expect(wrapper.vm.getHomePhoneNumber).toEqual(mockContactInformation().homePhone.number);
      });

      it('returns - otherwise', async () => {
        await wrapper.setProps({
          personalInformation: _merge(
            mockContactInformation({ homePhone: null }),
            mockPerson(),
          ),
        });
        expect(wrapper.vm.getHomePhoneNumber).toEqual('-');
      });
    });

    describe('getOtherPhoneNumber', () => {
      it('returns otherPhone number', () => {
        expect(wrapper.vm.getOtherPhoneNumber).toEqual(mockContactInformation().otherPhone.number);
      });

      it('returns - otherwise', async () => {
        await wrapper.setProps({
          personalInformation: _merge(
            mockContactInformation({ otherPhone: null }),
            mockPerson(),
          ),
        });
        expect(wrapper.vm.getOtherPhoneNumber).toEqual('-');
      });
    });

    describe('getIndigenousIdentity', () => {
      it('returns the correct string is other community has been picked', async () => {
        await wrapper.setProps({
          personalInformation: _merge(
            mockContactInformation(),
            mockPerson({ indigenousCommunityOther: 'other', indigenousType: EIndigenousTypes.Other }),
          ),
        });
        expect(wrapper.vm.getIndigenousIdentity).toEqual('common.provinces.AB, common.indigenous.types.Other, other');
      });

      it('return the correct string', () => {
        expect(wrapper.vm.getIndigenousIdentity).toEqual('common.provinces.AB, common.indigenous.types.FirstNations, communityName');
      });
    });
  });
});
