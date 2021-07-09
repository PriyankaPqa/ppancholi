import { createLocalVue, shallowMount } from '@/test/testSetup';
import household from '@/ui/mixins/household';
import { mockStorage } from '@crctech/registration-lib/src/store/storage';
import { mockCombinedHousehold } from '@crctech/registration-lib/src/entities/household/household.mocks';
import { mockMemberData } from '@crctech/registration-lib/src/entities/value-objects/member';
import { mockIndigenousIdentitiesSearchData, mockGenders } from '@crctech/registration-lib/src/entities/value-objects/identity-set';
import { mockPreferredLanguages, mockPrimarySpokenLanguages } from '@crctech/registration-lib/src/entities/value-objects/contact-information';

const Component = {
  render() {},
  mixins: [household],
};

const localVue = createLocalVue();
const storage = mockStorage();
let wrapper;

describe('household', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Methods', () => {
    describe('fetchHousehold', () => {
      it('should fetch the household', async () => {
        const id = 1;
        await wrapper.vm.fetchHousehold(id);
        expect(wrapper.vm.$storage.household.actions.fetch).toHaveBeenCalledWith(id);
      });
      it('should re-create a household object compatible with the UI and return it', async () => {
        const id = 1;
        wrapper.vm.buildHouseholdCreateData = jest.fn(() => ({}));
        const res = await wrapper.vm.fetchHousehold(id);
        expect(wrapper.vm.buildHouseholdCreateData).toBeCalled();
        expect(res).toEqual({});
      });
    });

    describe('fetchMembersInformation', () => {
      it('should fetch information of each member', async () => {
        const household = {
          entity: {
            primaryBeneficiary: '1',
            members: ['1', '2'],
          },
        };
        await wrapper.vm.fetchMembersInformation(household);
        expect(wrapper.vm.$services.households.getPerson).toHaveBeenCalledWith('1');
        expect(wrapper.vm.$services.households.getPerson).toHaveBeenCalledWith('2');
      });
    });

    describe('fetchIndigenousInformation', () => {
      it('should fetch indigenous information if needed for each member', async () => {
        const members = [
          {
            identitySet: {
              indigenousIdentity: {
                indigenousCommunityId: '1',
              },
            },
          },
          {
            identitySet: null,
          },
        ];
        await wrapper.vm.fetchIndigenousInformation(members);
        expect(wrapper.vm.$services.households.searchIndigenousIdentities).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$services.households.searchIndigenousIdentities).toHaveBeenCalledWith({
          filter: { id: '1' },
        });
      });
      it('should fetch indigenous identities corresponding to province of indigenous identities of members', async () => {
        const members = [
          {
            identitySet: {
              indigenousIdentity: {
                indigenousCommunityId: '1',
              },
            },
          },
          {
            identitySet: null,
          },
        ];
        await wrapper.vm.fetchIndigenousInformation(members);
        expect(wrapper.vm.$storage.registration.actions.fetchIndigenousIdentitiesByProvince).toHaveBeenCalledWith(4);
      });
    });

    describe('buildHouseholdCreateData', () => {
      it('should get genders', async () => {
        const household = mockCombinedHousehold();
        await wrapper.vm.buildHouseholdCreateData(household);
        expect(wrapper.vm.$storage.registration.getters.genders).toHaveBeenCalledTimes(1);
      });

      it('should get preferredLanguages', async () => {
        const household = mockCombinedHousehold();
        await wrapper.vm.buildHouseholdCreateData(household);
        expect(wrapper.vm.$storage.registration.getters.preferredLanguages).toHaveBeenCalledTimes(1);
      });

      it('should get primarySpokenLanguages', async () => {
        const household = mockCombinedHousehold();
        await wrapper.vm.buildHouseholdCreateData(household);
        expect(wrapper.vm.$storage.registration.getters.primarySpokenLanguages).toHaveBeenCalledTimes(1);
      });

      it('should call fetchMembersInformation', async () => {
        wrapper.vm.fetchMembersInformation = jest.fn(() => []);
        wrapper.vm.fetchIndigenousInformation = jest.fn();
        wrapper.vm.parseIdentitySet = jest.fn();
        wrapper.vm.parseContactInformation = jest.fn();
        const household = mockCombinedHousehold();
        await wrapper.vm.buildHouseholdCreateData(household);

        expect(wrapper.vm.fetchMembersInformation).toHaveBeenCalledWith(household);
      });

      it('should call fetchIndigenousInformation', async () => {
        const members = [{}, {}];
        wrapper.vm.fetchMembersInformation = jest.fn(() => members);
        wrapper.vm.fetchIndigenousInformation = jest.fn();
        wrapper.vm.parseIdentitySet = jest.fn();
        wrapper.vm.parseContactInformation = jest.fn();
        const household = mockCombinedHousehold();

        await wrapper.vm.buildHouseholdCreateData(household);

        expect(wrapper.vm.fetchIndigenousInformation).toHaveBeenCalledWith(members);
      });

      it('should return the final object of household to be used in the UI', async () => {
        wrapper.vm.fetchIndigenousInformation = jest.fn();
        wrapper.vm.parseIdentitySet = jest.fn(() => ({}));
        wrapper.vm.parseContactInformation = jest.fn(() => ({}));

        const expected = {
          registrationNumber: '12345',
          additionalMembers: [],
          consentInformation: {
            crcUserName: '',
            registrationLocationId: '',
            registrationMethod: null,
            privacyDateTimeConsent: '',
          },
          homeAddress: {
            city: 'string',
            country: 'st',
            latitude: 90,
            longitude: 180,
            postalCode: 'string',
            province: 1,
            specifiedOtherProvince: 'string',
            streetAddress: 'string',
            unitSuite: 'string',
          },
          noFixedHome: false,
          primaryBeneficiary: {
            contactInformation: {
              alternatePhoneNumber: {
                countryCode: 'CA',
                e164Number: '15145454548',
                extension: '1234',
                number: '(438) 888-8888',
              },
              email: 'test@test.ca',
              homePhoneNumber: {
                countryCode: 'CA',
                e164Number: '15145454548',
                number: '(514) 545-4548',
              },
              mobilePhoneNumber: {
                countryCode: 'CA',
                e164Number: '15145454548',
                number: '(866) 866-6666',
              },
              preferredLanguage: {
                id: '3dd21738-e599-443a-aae1-496d7decc458',
                isDefault: false,
                isOther: false,
                name: {
                  translation: {
                    en: 'French',
                    fr: 'Français',
                  },
                },
                orderRank: 0,
                status: 1,
              },
              preferredLanguageOther: '',
              primarySpokenLanguage: {
                id: '5d0c1c8d-c3cd-4818-a670-c92b3cb84081',
                isDefault: true,
                isOther: false,
                name: {
                  translation: {
                    en: 'English',
                    fr: 'Anglais',
                  },
                },
                orderRank: 0,
                status: 1,
              },
              primarySpokenLanguageOther: '',
            },
            currentAddress: {
              address: {
                city: 'Ottawa',
                country: 'CA',
                latitude: 0,
                longitude: 0,
                postalCode: 'K1W 1G7',
                province: 9,
                streetAddress: '247 Some Street',
                unitSuite: '',
              },
              addressType: 2,
              placeName: 'test',
              placeNumber: '',
            },
            identitySet: {
              birthDate: {
                day: 12,
                month: 2,
                year: 1999,
              },
              dateOfBirth: '1999-02-12',
              firstName: 'Bob',
              gender: {
                id: '676eb98b-d432-4924-90ee-2489e3acdc26',
                isDefault: false,
                isOther: false,
                name: {
                  translation: {
                    en: 'Female',
                    fr: 'Femme',
                  },
                },
                orderRank: 0,
                status: 1,
              },
              genderOther: null,
              indigenousCommunityId: 'guid-community',
              indigenousCommunityOther: '',
              indigenousIdentity: null,
              indigenousProvince: 1,
              indigenousType: 1,
              lastName: 'Smith',
              middleName: 'middle',
              preferredName: 'preferredName',
            },
          },
        };

        const household = mockCombinedHousehold();
        household.entity.registrationNumber = '12345';

        const res = await wrapper.vm.buildHouseholdCreateData(household);

        expect(res).toMatchObject(expected);
      });
    });

    describe('parseIdentitySet', () => {
      it('should rebuild identity of member', () => {
        const member = mockMemberData();
        const communities = mockIndigenousIdentitiesSearchData().value;
        const genderItems = mockGenders();

        member.identitySet.indigenousIdentity = {
          indigenousCommunityId: communities[0].id,
        };

        member.identitySet.gender.optionItemId = genderItems[0].id;

        const res = wrapper.vm.parseIdentitySet(member, communities, genderItems);
        expect(res).toEqual({
          birthDate: {
            day: '12',
            month: 2,
            year: '1999',
          },
          gender: {
            id: '676eb98b-d432-4924-90ee-2489e3acdc26',
            isDefault: false,
            isOther: false,
            name: {
              translation: {
                en: 'Female',
                fr: 'Femme',
              },
            },
            orderRank: 0,
            status: 1,
          },
          indigenousCommunityId: '434be79f-6713-0847-a0d9-c6bd7f9f12f5',
          indigenousProvince: 4,
          indigenousType: 1,
        });
      });
    });

    describe('parseContactInformation', () => {
      it('should rebuild contact information of member', () => {
        const member = mockMemberData();
        const preferredLanguagesItems = mockPreferredLanguages();
        const primarySpokenLanguagesItems = mockPrimarySpokenLanguages();

        member.contactInformation.preferredLanguage.optionItemId = preferredLanguagesItems[0].id;
        member.contactInformation.primarySpokenLanguage.optionItemId = primarySpokenLanguagesItems[0].id;

        const res = wrapper.vm.parseContactInformation(member, preferredLanguagesItems, primarySpokenLanguagesItems);
        expect(res).toEqual({
          alternatePhoneNumber: {
            countryCode: 'CA',
            e164Number: '15145454548',
            extension: '1234',
            number: '(438) 888-8888',
          },
          homePhoneNumber: {
            countryCode: 'CA',
            e164Number: '15145454548',
            number: '(514) 545-4548',
          },
          mobilePhoneNumber: {
            countryCode: 'CA',
            e164Number: '15145454548',
            number: '(866) 866-6666',
          },
          preferredLanguage: {
            id: '3dd21738-e599-443a-aae1-496d7decc458',
            isDefault: false,
            isOther: false,
            name: {
              translation: {
                en: 'French',
                fr: 'Français',
              },
            },
            orderRank: 0,
            status: 1,
          },
          primarySpokenLanguage: {
            id: '5d0c1c8d-c3cd-4818-a670-c92b3cb84081',
            isDefault: true,
            isOther: false,
            name: {
              translation: {
                en: 'English',
                fr: 'Anglais',
              },
            },
            orderRank: 0,
            status: 1,
          },
          preferredLanguageOther: '',
          primarySpokenLanguageOther: '',
        });
      });
    });
  });
});
