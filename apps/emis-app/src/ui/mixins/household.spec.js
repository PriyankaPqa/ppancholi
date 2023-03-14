import { mockCombinedHousehold, mockHouseholdEntity } from '@libs/entities-lib/household/household.mocks';
import { mockMemberData, mockMember } from '@libs/entities-lib/value-objects/member';
import { mockIndigenousCommunitiesGetData, mockGenders } from '@libs/entities-lib/value-objects/identity-set';
import { mockPreferredLanguages, mockPrimarySpokenLanguages } from '@libs/entities-lib/value-objects/contact-information';
import household from '@/ui/mixins/household';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { CaseFileStatus, mockCaseFileEntities } from '@libs/entities-lib/case-file';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';
import { mockProvider } from '@/services/provider';

const Component = {
  render() {},
  mixins: [household],
};

const localVue = createLocalVue();
const member = mockMember();
const services = mockProvider();

const { pinia, householdStore } = useMockHouseholdStore();
const { registrationStore } = useMockRegistrationStore(pinia);
let wrapper;

describe('household', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      pinia,
      localVue,
      propsData: {
        id: 'id-1',
      },
      mocks: {
        $services: services,
      },
    });
  });

  describe('Computed', () => {
    describe('activeCaseFiles', () => {
      it('returns the open case files', async () => {
        const cfOpen = { caseFileId: '1', caseFileStatus: CaseFileStatus.Open };
        const cfClosed = { caseFileId: '2', caseFileStatus: CaseFileStatus.Closed };
        const caseFiles = [cfOpen, cfClosed];
        await wrapper.setData({ caseFiles });

        expect(wrapper.vm.activeCaseFiles).toEqual([cfOpen]);
      });
    });
  });

  describe('Methods', () => {
    describe('fetchHouseholdCreate', () => {
      it('should fetch the household', async () => {
        const id = 1;
        await wrapper.vm.fetchHouseholdCreate(id);
        expect(householdStore.fetch).toHaveBeenCalledWith(id);
      });
      it('should call buildHouseholdCreateData', async () => {
        const id = 1;
        wrapper.vm.buildHouseholdCreateData = jest.fn();
        householdStore.fetch = jest.fn(() => mockHouseholdEntity());
        await wrapper.vm.fetchHouseholdCreate(id);
        expect(wrapper.vm.buildHouseholdCreateData).toHaveBeenCalledWith(mockHouseholdEntity());
      });
    });

    describe('fetchCaseFiles', () => {
      it('calls fetchCaseFiles with the props id if no argument is passed', async () => {
        await wrapper.vm.fetchCaseFiles();
        expect(wrapper.vm.$services.caseFiles.getAllCaseFilesRelatedToHouseholdId).toHaveBeenCalledWith(wrapper.vm.id);
      });

      it('calls fetchCaseFiles with the id in the argument', async () => {
        await wrapper.vm.fetchCaseFiles('mock-id');
        expect(wrapper.vm.$services.caseFiles.getAllCaseFilesRelatedToHouseholdId).toHaveBeenCalledWith('mock-id');
      });

      it('updates caseFiles with the call result if no argument is passed and returns the result', async () => {
        const caseFiles = mockCaseFileEntities();
        wrapper.vm.$services.caseFiles.getAllCaseFilesRelatedToHouseholdId = jest.fn(() => caseFiles);
        const result = await wrapper.vm.fetchCaseFiles();
        expect(wrapper.vm.caseFiles).toEqual(caseFiles);
        expect(result).toEqual(caseFiles);
      });
    });

    describe('fetchMyEvents', () => {
      it('calls searchMyEventsById with the expected parameters if no argument is passed', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'hh-id',
          },
          mocks: {
            $services: services,
          },
        });

        await wrapper.setData({
          caseFiles: [{ eventId: 'id-1' }, { eventId: 'id-2' }],
        });
        wrapper.vm.$services.events.searchMyEventsById = jest.fn();
        await wrapper.vm.fetchMyEvents();
        expect(wrapper.vm.$services.events.searchMyEventsById).toHaveBeenCalledWith(['id-1', 'id-2']);
      });

      it('calls searchMyEventsById with the expected parameters from the argument', async () => {
        const caseFiles = [{ eventId: 'id-1' }, { eventId: 'id-2' }];
        jest.spyOn(wrapper.vm.$services.events, 'searchMyEventsById').mockImplementation(() => {});
        await wrapper.vm.fetchMyEvents(caseFiles);
        expect(wrapper.vm.$services.events.searchMyEventsById).toHaveBeenCalledWith(['id-1', 'id-2']);
      });

      it('stores the result in myEvents if there is no argument and returns the result', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'hh-id',
          },
          mocks: {
            $services: services,
          },
        });

        await wrapper.setData({
          caseFiles: [{ eventId: 'eventId' }],
        });

        wrapper.vm.$services.events.searchMyEventsById = jest.fn(() => ({ value: [{ id: 'eventId' }] }));
        const result = await wrapper.vm.fetchMyEvents();
        expect(wrapper.vm.myEvents).toEqual([{ id: 'eventId' }]);
        expect(result).toEqual([{ id: 'eventId' }]);
      });
    });

    describe('fetchMembersInformation', () => {
      it('should fetch information of each member', async () => {
        const household = {
          primaryBeneficiary: '1',
          members: ['1', '2'],
        };
        await wrapper.vm.fetchMembersInformation(household);
        expect(wrapper.vm.$services.households.getPerson).toHaveBeenCalledWith('1');
        expect(wrapper.vm.$services.households.getPerson).toHaveBeenCalledWith('2');
      });

      it('calls addShelterLocationData  with the member result of the storage call', async () => {
        const household = {
          primaryBeneficiary: '1',
          members: ['1'],
        };
        jest.spyOn(wrapper.vm, 'addShelterLocationData').mockImplementation(() => [member]);
        wrapper.vm.$services.households.getPerson = jest.fn(() => member);

        await wrapper.vm.fetchMembersInformation(household);
        expect(wrapper.vm.addShelterLocationData).toHaveBeenCalledWith([member]);
      });
    });

    describe('fetchShelterLocations', () => {
      it('gets the shelterLocations from my events', async () => {
        const events = [{ entity: { shelterLocations: [{ id: 'sl-1' }] } }, { entity: { shelterLocations: [{ id: 'sl-2' }] } }];
        await wrapper.setData({ myEvents: events });
        const result = await wrapper.vm.fetchShelterLocations();
        expect(result).toEqual([{ id: 'sl-1' }, { id: 'sl-2' }]);
      });

      it('calls fetchCaseFiles and fetchMyEvents the shelterLocations from my events if an argument is passed and there are no myEvents in the state', async () => {
        const caseFiles = [{ eventId: 'id-1', caseFileStatus: CaseFileStatus.Open }, { eventId: 'id-2', caseFileStatus: CaseFileStatus.Closed }];
        const events = [{ entity: { shelterLocations: [{ id: 'sl-1' }] } }, { entity: { shelterLocations: [{ id: 'sl-2' }] } }];
        await wrapper.setData({ myEvents: null });
        wrapper.vm.fetchCaseFiles = jest.fn(() => caseFiles);
        wrapper.vm.fetchMyEvents = jest.fn(() => events);
        const result = await wrapper.vm.fetchShelterLocations('hh-id');

        expect(wrapper.vm.fetchCaseFiles).toHaveBeenCalledWith('hh-id');
        expect(wrapper.vm.fetchMyEvents).toHaveBeenCalledWith([{ eventId: 'id-1', caseFileStatus: CaseFileStatus.Open }]);
        expect(result).toEqual([{ id: 'sl-1' }, { id: 'sl-2' }]);
      });
    });

    describe('buildHouseholdCreateData', () => {
      it('should get genders', async () => {
        const household = mockCombinedHousehold();
        await wrapper.vm.buildHouseholdCreateData(household);
        expect(registrationStore.getGenders).toHaveBeenCalledTimes(1);
      });

      it('should get preferredLanguages', async () => {
        const household = mockCombinedHousehold();
        await wrapper.vm.buildHouseholdCreateData(household);
        expect(registrationStore.getPreferredLanguages).toHaveBeenCalledTimes(1);
      });

      it('should get primarySpokenLanguages', async () => {
        const household = mockCombinedHousehold();
        await wrapper.vm.buildHouseholdCreateData(household);
        expect(registrationStore.getPrimarySpokenLanguages).toHaveBeenCalledTimes(1);
      });

      it('should call fetchMembersInformation', async () => {
        wrapper.vm.fetchMembersInformation = jest.fn(() => []);
        wrapper.vm.parseIdentitySet = jest.fn();
        wrapper.vm.parseContactInformation = jest.fn();
        const household = mockCombinedHousehold();
        await wrapper.vm.buildHouseholdCreateData(household);

        expect(wrapper.vm.fetchMembersInformation).toHaveBeenCalledWith(household);
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
                unitSuite: '123',
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

        const household = mockHouseholdEntity();
        household.registrationNumber = '12345';

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
      it('calls getShelterLocationDatafromId and stores the data in the right place in the member object, if the member has a shelterLocationId', async () => {
        wrapper.vm.getShelterLocationDatafromId = jest.fn(() => ({ id: 'sl-1', name: 'SL 1' }));
        const members = [{ currentAddress: { shelterLocationId: 'sl-1' } }];
        const result = await wrapper.vm.addShelterLocationData(members);
        expect(wrapper.vm.getShelterLocationDatafromId).toHaveBeenCalledWith('sl-1');
        expect(result).toEqual([{ currentAddress: { shelterLocationId: 'sl-1', shelterLocation: { id: 'sl-1', name: 'SL 1' } } }]);
      });
    });

    describe('getShelterLocationDatafromId', () => {
      it('returns the shelterLocation data from the state if it finds one', async () => {
        await wrapper.setData({ shelterLocations: [{ id: 'sl-1', name: 'SL-1' }] });
        expect(await wrapper.vm.getShelterLocationDatafromId('sl-1')).toEqual({ id: 'sl-1', name: 'SL-1' });
      });

      it('calls the events search with the right filter if it does not find the shelter in the state and stores the result in otherShelterLocations', async () => {
        await wrapper.setData({ shelterLocations: [] });
        wrapper.vm.$services.publicApi.searchEvents = jest.fn(() => ({ value: [{ entity: { shelterLocations: [{ id: 'sl-1', name: 'SL-1' }] } }] }));
        await wrapper.vm.getShelterLocationDatafromId('sl-1');
        expect(wrapper.vm.$services.publicApi.searchEvents).toHaveBeenCalledWith({
          filter: {
            Entity: {
              ShelterLocations: {
                any: { Id: 'sl-1' },
              },
            },
          },
        });
        expect(wrapper.vm.otherShelterLocations).toEqual([{ id: 'sl-1', name: 'SL-1' }]);
      });
    });
  });
});
