import Vuetify from 'vuetify';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import _merge from 'lodash/merge';
import {
  EIndigenousTypes, mockGenderOther, mockIdentitySet,
} from '@libs/entities-lib/household-create';
import {
  mockContactInformation,
  mockPreferredLanguageOther,
  mockPrimarySpokenLanguageOther,
} from '@libs/entities-lib/value-objects/contact-information';
import Component from './PersonalInformationTemplate.vue';

const localVue = createLocalVue();

const validPersonalInformation = _merge(mockContactInformation(), mockIdentitySet());

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

      it('should include mobilePhoneNumber', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.mobilePhoneNumber',
          value: wrapper.vm.getMobilePhoneNumber,
          test: 'mobilePhoneNumber',
        });
      });

      it('should include homePhoneNumber', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.homePhoneNumber',
          value: wrapper.vm.getHomePhoneNumber,
          test: 'homePhoneNumber',
        });
      });

      it('should include alternatePhoneNumber', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.alternatePhoneNumber',
          value: wrapper.vm.getAlternatePhoneNumber,
          test: 'alternatePhoneNumber',
        });
      });

      it('should include alternatePhoneNumberExtension', () => {
        expect(wrapper.vm.displayData).toContainEqual({
          text: 'registration.personal_info.alternatePhoneNumberExtension',
          value: wrapper.vm.personalInformation.alternatePhoneNumber.extension,
          test: 'alternatePhoneNumberExtension',
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
        expect(wrapper.vm.getBirthDate).toEqual('Feb 12, 1999 (23 common.years)');
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
      it('returns null', async () => {
        const personalInformation = _merge(mockPrimarySpokenLanguageOther(), mockIdentitySet());
        personalInformation.primarySpokenLanguage = null;

        await wrapper.setProps({ personalInformation });

        expect(wrapper.vm.getPrimarySpokenLanguage).toBeNull();
      });

      it('returns primarySpokenLanguageOther', async () => {
        await wrapper.setProps({
          personalInformation: _merge(mockPrimarySpokenLanguageOther(), mockIdentitySet()),
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
          personalInformation: _merge(mockPreferredLanguageOther(), mockIdentitySet()),
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
            mockIdentitySet({ gender: mockGenderOther(), genderOther: 'unknown' }),
          ),
        });

        expect(wrapper.vm.getGender).toEqual('unknown');
      });

      it('returns gender otherwise', () => {
        expect(wrapper.vm.getGender).toEqual(mockIdentitySet().gender.name.translation.en);
      });
    });

    describe('getMobilePhoneNumber', () => {
      it('returns mobilePhoneNumber number', () => {
        expect(wrapper.vm.getMobilePhoneNumber).toEqual(mockContactInformation().mobilePhoneNumber.number);
      });

      it('returns - otherwise', async () => {
        await wrapper.setProps({
          personalInformation: _merge(
            mockContactInformation({ mobilePhoneNumber: null }),
            mockIdentitySet(),
          ),
        });
        expect(wrapper.vm.getMobilePhoneNumber).toEqual('-');
      });
    });

    describe('getHomePhoneNumber', () => {
      it('returns homePhoneNumber number', () => {
        expect(wrapper.vm.getHomePhoneNumber).toEqual(mockContactInformation().homePhoneNumber.number);
      });

      it('returns - otherwise', async () => {
        await wrapper.setProps({
          personalInformation: _merge(
            mockContactInformation({ homePhoneNumber: null }),
            mockIdentitySet(),
          ),
        });
        expect(wrapper.vm.getHomePhoneNumber).toEqual('-');
      });
    });

    describe('getAlternatePhoneNumber', () => {
      it('returns alternatePhoneNumber number', () => {
        expect(wrapper.vm.getAlternatePhoneNumber).toEqual(mockContactInformation().alternatePhoneNumber.number);
      });

      it('returns - otherwise', async () => {
        await wrapper.setProps({
          personalInformation: _merge(
            mockContactInformation({ alternatePhoneNumber: null }),
            mockIdentitySet(),
          ),
        });
        expect(wrapper.vm.getAlternatePhoneNumber).toEqual('-');
      });
    });

    describe('getIndigenousIdentity', () => {
      it('returns the correct string is other community has been picked', async () => {
        await wrapper.setProps({
          personalInformation: _merge(
            mockContactInformation(),
            mockIdentitySet({ indigenousCommunityOther: 'other', indigenousType: EIndigenousTypes.Other }),
          ),
        });
        expect(wrapper.vm.getIndigenousIdentity).toEqual('common.indigenous.types.Other');
      });

      it('return the correct string', () => {
        expect(wrapper.vm.getIndigenousIdentity).toEqual('common.indigenous.types.FirstNation');
      });
    });
  });
});
