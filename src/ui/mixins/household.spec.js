import { mockStorage } from '@crctech/registration-lib/src/store/storage';
import { mockCombinedHousehold } from '@crctech/registration-lib/src/entities/household/household.mocks';
import { mockMemberData, mockMember } from '@crctech/registration-lib/src/entities/value-objects/member';
import { mockIndigenousCommunitiesGetData, mockGenders } from '@crctech/registration-lib/src/entities/value-objects/identity-set';
import { mockPreferredLanguages, mockPrimarySpokenLanguages } from '@crctech/registration-lib/src/entities/value-objects/contact-information';
import { mockShelterLocations } from '@crctech/registration-lib/src/entities/event/event.mock';
import { mockCombinedHouseholds } from '@crctech/registration-lib/src/entities/household';
import household from '@/ui/mixins/household';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { EEventLocationStatus, mockEventMainInfo } from '@/entities/event';

const Component = {
  render() {},
  mixins: [household],
};

const localVue = createLocalVue();
const storage = mockStorage();
const member = mockMember();

const events = [
  mockEventMainInfo({
    id: '1',
    shelterLocations: [{ id: 'loc-1', status: EEventLocationStatus.Active }],
  }),
  mockEventMainInfo(
    {
      id: '2',
      shelterLocations: [{ id: 'loc-2', status: EEventLocationStatus.Inactive }, { id: 'loc-3', status: EEventLocationStatus.Active }],
    },
  )];

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
    describe('fetchHouseholdCreate', () => {
      it('should fetch the household', async () => {
        const id = 1;
        await wrapper.vm.fetchHouseholdCreate(id);
        expect(wrapper.vm.$storage.household.actions.fetch).toHaveBeenCalledWith(id);
      });
      it('should call buildHouseholdCreateData', async () => {
        const id = 1;
        wrapper.vm.buildHouseholdCreateData = jest.fn(() => ({}));
        const res = await wrapper.vm.fetchHouseholdCreate(id);
        expect(wrapper.vm.buildHouseholdCreateData).toHaveBeenCalledWith(mockCombinedHouseholds()[0], null, true);
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

      it('calls addShelterLocationData  with the member result of the storage call', async () => {
        const household = {
          entity: {
            primaryBeneficiary: '1',
            members: ['1'],
          },
        };
        jest.spyOn(wrapper.vm, 'addShelterLocationData').mockImplementation(() => [member]);
        wrapper.vm.$services.households.getPerson = jest.fn(() => member);
        const shelterLocations = [{ id: 'loc-1' }];

        await wrapper.vm.fetchMembersInformation(household, shelterLocations);
        expect(wrapper.vm.addShelterLocationData).toHaveBeenCalledWith([member], shelterLocations);
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
        wrapper.vm.parseIdentitySet = jest.fn();
        wrapper.vm.parseContactInformation = jest.fn();
        const shelterLocations = [{ id: 'loc-1', status: EEventLocationStatus.Active }, { id: 'loc-2', status: EEventLocationStatus.Active }];
        const household = mockCombinedHousehold();
        await wrapper.vm.buildHouseholdCreateData(household, shelterLocations);

        expect(wrapper.vm.fetchMembersInformation).toHaveBeenCalledWith(household, shelterLocations);
      });

      it('should call fetchShelterLocations if shelterLocations is null', async () => {
        const household = mockCombinedHousehold();
        wrapper.vm.fetchShelterLocations = jest.fn();

        await wrapper.vm.buildHouseholdCreateData(household);

        expect(wrapper.vm.fetchShelterLocations).toBeCalled();
      });

      it('should not call fetchShelterLocations if shelterLocations are passed', async () => {
        const household = mockCombinedHousehold();
        wrapper.vm.fetchShelterLocations = jest.fn();

        await wrapper.vm.buildHouseholdCreateData(household, mockShelterLocations());

        expect(wrapper.vm.fetchShelterLocations).not.toBeCalled();
      });

      it('should return the final object of household to be used in the UI', async () => {
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
            city: 'New York',
            country: 'USA',
            latitude: 90,
            longitude: 180,
            postalCode: '123456',
            province: 1,
            specifiedOtherProvince: 'string',
            streetAddress: 'West str.',
            unitSuite: '100',
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
              preferredLanguageOther: null,
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
              primarySpokenLanguageOther: null,
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
              dateOfBirth: '1999-02-12T00:00:00.000Z',
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
        const communities = mockIndigenousCommunitiesGetData();
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

    describe('addShelterLocationData', () => {
      it('returns the right member data', () => {
        const shelterLocations = [{ id: 'loc-1', status: EEventLocationStatus.Active }, { id: 'loc-2', status: EEventLocationStatus.Active }];
        const altMember = { ...member, currentAddress: { shelterLocationId: 'loc-1' } };

        expect(wrapper.vm.addShelterLocationData([altMember], shelterLocations)).toEqual([{
          ...member,
          currentAddress: { shelterLocation: { id: 'loc-1', status: EEventLocationStatus.Active }, shelterLocationId: 'loc-1' },
        }]);
      });
    });

    describe('fetchShelterLocations', () => {
      it('calls searchMyEvents service with the right filter', async () => {
        const expectedFilter = 'search.in(Entity/Id, \'60983874-18bb-467d-b55a-94dc55818151\', \'|\')';

        await wrapper.vm.fetchShelterLocations(mockCombinedHousehold());

        expect(wrapper.vm.$services.events.searchMyEvents).toHaveBeenCalledWith({ filter: expectedFilter, top: 999 });
      });

      it('returns the correct list of shelter locations with onlyActive true', async () => {
        wrapper.vm.$services.events.searchMyEvents = jest.fn(() => ({ value: events }));

        const res = await wrapper.vm.fetchShelterLocations(mockCombinedHousehold());

        expect(res).toEqual([
          { id: 'loc-1', status: EEventLocationStatus.Active },
          { id: 'loc-3', status: EEventLocationStatus.Active }]);
      });

      it('returns the correct list of shelter locations with onlyActive false', async () => {
        wrapper.vm.$services.events.searchMyEvents = jest.fn(() => ({ value: events }));

        const res = await wrapper.vm.fetchShelterLocations(mockCombinedHousehold(), false);

        expect(res).toEqual([
          { id: 'loc-1', status: EEventLocationStatus.Active },
          { id: 'loc-2', status: EEventLocationStatus.Inactive },
          { id: 'loc-3', status: EEventLocationStatus.Active }]);
      });
    });
  });
});
