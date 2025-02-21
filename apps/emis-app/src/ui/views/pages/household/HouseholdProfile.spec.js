import { mockHouseholdCreate, Member } from '@libs/entities-lib/household-create';
import {
  HouseholdStatus,
  mockHouseholdCaseFile, mockHouseholdEntity,
} from '@libs/entities-lib/household';
import { mockMember } from '@libs/entities-lib/value-objects/member';
import { MAX_ADDITIONAL_MEMBERS } from '@libs/registration-lib/constants/validations';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockEventSummary, EEventLocationStatus } from '@libs/entities-lib/event';
import { CaseFileStatus, mockCaseFileEntities, mockCaseFileEntity } from '@libs/entities-lib/case-file';

import householdHelpers from '@/ui/helpers/household';
import routes from '@/constants/routes';
import flushPromises from 'flush-promises';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';
import { UserRoles } from '@libs/entities-lib/user';
import { mockProvider } from '@/services/provider';
import { HouseholdActivityType, mockHouseholdActivities } from '@libs/entities-lib/value-objects/household-activity';
import PinnedActionAndRationale from '@/ui/views/pages/household/components/PinnedStatus.vue';
import { useMockProgramStore } from '@/pinia/program/program.mock';
import { useMockPersonStore } from '@/pinia/person/person.mock';
import Component from './HouseholdProfile.vue';

const localVue = createLocalVue();
const householdCreate = { ...mockHouseholdCreate(), additionalMembers: [mockMember({ id: '1' }), mockMember({ id: '2' }), mockMember({ id: '3' })] };
const householdEntity = mockHouseholdEntity();
const services = mockProvider();

const { pinia, registrationStore } = useMockRegistrationStore();
const { householdStore } = useMockHouseholdStore(pinia);
useMockProgramStore(pinia);
useMockRegistrationStore(pinia);
useMockPersonStore(pinia);

function createWrapperForRole(userRole, householdStatus = HouseholdStatus.Active) {
  const pinia = getPiniaForUser(userRole);
  useMockRegistrationStore(pinia);
  useMockHouseholdStore(pinia);
  useMockPersonStore(pinia);

  return shallowMount(Component, {
    localVue,
    pinia,
    propsData: {
      id: householdEntity.id,
    },
    computed: {
      household() {
        return householdCreate;
      },
      householdEntity() {
        return { ...householdEntity, householdStatus };
      },
    },
    mocks: {
      $services: services,
    },
  });
}

const events = [
  mockEventSummary({
    id: '1',
    shelterLocations: [{ id: 'loc-1', status: EEventLocationStatus.Active }],
    registrationLocations: [{ id: ' loc-id-1-active', status: EEventLocationStatus.Active }, { id: ' loc-id-2-inactive', status: EEventLocationStatus.Inactive }],
    name: { translation: { en: 'event-name-1' } },
  }),
  mockEventSummary({
    id: '2',
    shelterLocations: [{ id: 'loc-2', status: EEventLocationStatus.Inactive }, { id: 'loc-3', status: EEventLocationStatus.Active }],
    registrationLocations: [{ id: ' loc-id-3-active', status: EEventLocationStatus.Active }, { id: ' loc-id-4-inactive', status: EEventLocationStatus.Inactive }],
    name: { translation: { en: 'event-name-2' } },
  }),
];
const otherEvent = mockEventSummary({
  id: '3',
  registrationLocations: [{ id: ' loc-id-5-active', status: EEventLocationStatus.Active }, { id: ' loc-id-6-inactive', status: EEventLocationStatus.Inactive }],
});

const movedMemberList = [
  {
    currentAddress: {
      address: {
        city: 'Ottawa',
        country: 'CA',
        latitude: 0,
        longitude: 0,
        postalCode: 'K1W 1G7',
        province: 9,
        specifiedOtherProvince: undefined,
        streetAddress: '247 Some Street',
        unitSuite: '123',
      },
      addressType: 2,
      placeName: 'test',
      placeNumber: '',
      shelterLocation: undefined,
    },
    genderName: {
      translation: {
        en: 'Male',
        fr: 'Masculin',
      },
    },
    identitySet: {
      birthDate: {
        day: '12',
        month: 2,
        year: '1999',
      },
      dateOfBirth: '1999-02-12T00:00:00.000Z',
      firstName: 'Bob',
      gender: {
        id: '676eb98b-d432-4924-90ee-2489e3acdc26',
        isDefault: false,
        isOther: false,
        name: {
          translation: {
            en: 'Male',
            fr: 'Masculin',
          },
        },
        orderRank: 0,
        status: 1,
      },
      genderOther: null,
      indigenousCommunityOther: '',
      indigenousIdentity: null,
      indigenousProvince: 1,
      indigenousType: '',
      lastName: 'Smith',
      middleName: 'middle',
      preferredName: 'preferredName',
      indigenousCommunityId: undefined,
      name: undefined,
    },
    indigenousIdentityInfo: {
      communityType: '',
      name: '',
    },
    personId: 'newId',
    status: 6,
  },
];

describe('HouseholdProfile.vue', () => {
  let wrapper;
  registrationStore.getHouseholdCreate = jest.fn(() => householdCreate);

  const doMount = async (otherComputed = {}, otherData = {}, shallow = true, otherMocks = {}) => {
    const options = {
      localVue,
      pinia,
      propsData: {
        id: householdEntity.id,
      },
      data() {
        return {
          events,
          loading: false,
          caseFiles: mockCaseFileEntities(),
          newStatus: HouseholdStatus.Open,
          ...otherData,
        };
      },
      computed: {
        household() {
          return householdCreate;
        },
        householdEntity() {
          return householdEntity;
        },
        ...otherComputed,
      },
      mocks: {
        $services: services,
        ...otherMocks,
      },
    };

    wrapper = shallow ? shallowMount(Component, options) : mount(Component, options);
    await wrapper.vm.$nextTick();
  };

  describe('Template', () => {
    beforeEach(async () => {
      jest.clearAllMocks();
      await doMount({
        country() {
          return 'mock-country';
        },
        statuses() {
          return [HouseholdStatus.Archived, HouseholdStatus.Closed];
        },
        canManageDuplicates() {
          return true;
        },
      });
      householdStore.fetch = jest.fn(() => householdEntity);
      await flushPromises();
      await wrapper.setData({ duplicateCount: 3 });
    });

    describe('registration number', () => {
      it('renders', async () => {
        await wrapper.setData({ loading: false });
        const element = wrapper.findDataTest('household_profile_registration_number');
        expect(element.exists()).toBeTruthy();
      });
      it('displays the right data', async () => {
        await wrapper.setData({ loading: false });
        const element = wrapper.findDataTest('household_profile_registration_number');
        expect(element.text()).toContain(wrapper.vm.household.registrationNumber);
      });
    });

    describe('homeAddress', () => {
      it('renders', async () => {
        await wrapper.setData({ loading: false });
        const element = wrapper.findDataTest('household_profile_home_address');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right data', async () => {
        await wrapper.setData({ loading: false });
        const element = wrapper.findDataTest('household_profile_home_address');
        expect(element.text()).toContain(wrapper.vm.addressLine1);
        expect(element.text()).toContain(wrapper.vm.addressLine2);
        expect(element.text()).toContain(wrapper.vm.country);
      });

      it('renders the edit button if the user can edit', async () => {
        await doMount({
          canEdit() {
            return true;
          },
        });
        expect(wrapper.findDataTest('member_address_edit_btn').exists()).toBeTruthy();
      });
      it('does not render the edit button if the user cannot edit', async () => {
        await doMount({
          canEdit() {
            return false;
          },
        });
        expect(wrapper.findDataTest('member_address_edit_btn').exists()).toBeFalsy();
      });
    });

    describe('household-profile-status', () => {
      it('should render', () => {
        const element = wrapper.findDataTest('household-profile-status');
        expect(element.exists()).toBe(true);
      });

      it('calls the method onStatusChangeInit on change', () => {
        jest.spyOn(wrapper.vm, 'onStatusChangeInit').mockImplementation(() => {});
        const element = wrapper.findDataTest('household-profile-status');
        element.vm.$emit('input');
        expect(wrapper.vm.onStatusChangeInit).toHaveBeenCalledTimes(1);
      });
    });

    describe('pinned-action-and-rationale', () => {
      it('should exist', async () => {
        const component = wrapper.findComponent(PinnedActionAndRationale);
        expect(component.exists()).toBeTruthy();
      });
    });

    describe('created', () => {
      it('renders', async () => {
        await wrapper.setData({ loading: false });

        const element = wrapper.findDataTest('household_profile_created_date');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right data', async () => {
        await wrapper.setData({ loading: false });

        const element = wrapper.findDataTest('household_profile_created_date');
        expect(element.text()).toContain('May 26, 2021');
      });
    });

    describe('last updated', () => {
      it('renders', async () => {
        await wrapper.setData({ loading: false });

        const element = wrapper.findDataTest('household_profile_last_updated_date');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right data', async () => {
        await wrapper.setData({ loading: false });

        const element = wrapper.findDataTest('household_profile_last_updated_date');
        expect(element.text()).toContain('May 26, 2021');
      });
    });

    describe('household-status-dialog', () => {
      it('should exist when showHouseholdStatusDialog is true', async () => {
        await wrapper.setData({
          showHouseholdStatusDialog: true,
        });
        const element = wrapper.findDataTest('household-status-dialog');
        expect(element.exists()).toBeTruthy();
      });

      it('should call onStatusChange when triggered submit event', async () => {
        wrapper.vm.onStatusChange = jest.fn();
        await wrapper.setData({
          showHouseholdStatusDialog: true,
        });
        const element = wrapper.findDataTest('household-status-dialog');
        await element.vm.$emit('submit');
        expect(wrapper.vm.onStatusChange).toHaveBeenCalled();
      });
    });

    describe('household_profile_primary_member_card And household_profile_member_card', () => {
      it('should receive props disabledEditingHousehold', () => {
        doMount({
          editingDisabled() {
            return true;
          },
        });
        const primaryMemberCard = wrapper.findDataTest('household_profile_primary_member_card');
        const memberCard = wrapper.findDataTest('household_profile_member_card');
        const props = 'editingDisabled';
        expect(primaryMemberCard.props(props)).toEqual(true);
        expect(memberCard.props(props)).toEqual(true);
      });
    });

    describe('duplicates count', () => {
      it('renders', async () => {
        const element = wrapper.findDataTest('household-profile-duplicateCount');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right data', async () => {
        const element = wrapper.findDataTest('household-profile-duplicateCount');
        expect(element.text()).toContain('3 householdDetails.potentialDuplicates');
      });
    });

    describe('manage duplicates button', () => {
      it('renders if canManageDuplicates is true', async () => {
        const element = wrapper.findDataTest('household-profile-manageDuplicatesBtn');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('moved_member_card', () => {
      it('should rendered when there is movedMembers', async () => {
        await doMount({
          canManageDuplicates() {
            return false;
          },
          movedMembers() {
            return movedMemberList;
          },
        });
        const element = wrapper.findDataTest('moved_member_card');
        expect(element.exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    describe('registrationLocations', () => {
      it('returns the right data', () => {
        const caseFiles = [
          mockHouseholdCaseFile(
            {
              caseFileId: 'id-1',
              eventId: '1',
            },
          ),
          mockHouseholdCaseFile(
            {
              caseFileId: 'id-2',
              eventId: '2',
            },
          ),
          mockHouseholdCaseFile(
            {
              caseFileId: 'id-3',
              eventId: '3',
            },
          )];

        doMount({
          activeCaseFiles() {
            return caseFiles;
          },
        }, {
          myEvents: [mockEventSummary()],
          allEvents: events,
        });
        expect(wrapper.vm.registrationLocations).toEqual([
          { id: ' loc-id-1-active', status: EEventLocationStatus.Active, eventName: events[0].name },
          { id: ' loc-id-3-active', status: EEventLocationStatus.Active, eventName: events[1].name },
        ]);
      });
    });

    describe('household', () => {
      it('returns the right data', () => {
        doMount();
        expect(wrapper.vm.household).toEqual(householdCreate);
      });
    });

    describe('householdEntity', () => {
      it('returns the right data', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: householdEntity.id,
          },
          computed: {
            household() {
              return householdCreate;
            },
            statuses() {
              return [HouseholdStatus.Archived, HouseholdStatus.Closed];
            },
          },
          mocks: {
            $services: services,
          },

        });
        expect(wrapper.vm.householdEntity).toEqual(householdEntity);
      });
    });

    describe('inactiveCaseFiles', () => {
      it('returns the closed or archived', () => {
        const cfOpen = { caseFileId: '1', caseFileStatus: CaseFileStatus.Open };
        const cfClosed = { caseFileId: '2', caseFileStatus: CaseFileStatus.Closed };
        const caseFiles = [cfOpen, cfClosed];

        doMount(null, {
          caseFiles: [...caseFiles],
        });
        expect(wrapper.vm.inactiveCaseFiles).toEqual([cfClosed]);
      });
    });

    describe('country', () => {
      it(' calls helpers  countryName and returns the result', () => {
        jest.spyOn(householdHelpers, 'countryName').mockImplementation(() => 'mock-country');
        doMount();
        expect(wrapper.vm.country).toEqual('mock-country');
      });
    });

    describe('lastUpdated', () => {
      it(' returns the right date when there are timestamps for both entity and metadata', async () => {
        doMount();
        expect(wrapper.vm.lastUpdated).toEqual('May 26, 2021');
      });

      it(' returns the right date when there are timestamps only for entity', async () => {
        doMount();
        expect(wrapper.vm.lastUpdated).toEqual('May 26, 2021');
      });
    });

    describe('canEdit', () => {
      it('returns true if user has level 1 and feature flag is off', async () => {
        wrapper = createWrapperForRole(UserRoles.level1);
        await wrapper.setFeature(wrapper.vm.$featureKeys.L0Access, false);
        expect(wrapper.vm.canEdit).toBeTruthy();
      });

      it('returns true if user has level 0', () => {
        wrapper = createWrapperForRole(UserRoles.level0);
        expect(wrapper.vm.canEdit).toBeTruthy();
      });

      it('returns false if user does not have level 1', () => {
        wrapper = createWrapperForRole(UserRoles.contributorIM);
        expect(wrapper.vm.canEdit).toBeFalsy();
      });
    });

    describe('canMove', () => {
      it('returns true if user has level 2', () => {
        wrapper = createWrapperForRole(UserRoles.level2);
        expect(wrapper.vm.canMove).toBeTruthy();
      });

      it('returns false if user does not have level 2', () => {
        wrapper = createWrapperForRole(UserRoles.level1);
        expect(wrapper.vm.canMove).toBeFalsy();
      });
    });

    describe('canManageDuplicates', () => {
      it('returns true if user has level 6 even if household is archived', () => {
        wrapper = createWrapperForRole(UserRoles.level6, HouseholdStatus.Archived);
        expect(wrapper.vm.canManageDuplicates).toBeTruthy();
      });

      it('returns true if user has level 1 and household is not archived', () => {
        wrapper = createWrapperForRole(UserRoles.level1);
        expect(wrapper.vm.canManageDuplicates).toBeTruthy();
      });

      it('returns false if user does not have level 1', () => {
        wrapper = createWrapperForRole(UserRoles.contributor3);
        expect(wrapper.vm.canManageDuplicates).toBeFalsy();
      });

      it('returns false if status is archived', () => {
        wrapper = createWrapperForRole(UserRoles.level1, HouseholdStatus.Archived);
        expect(wrapper.vm.canManageDuplicates).toBeFalsy();
      });

      it('returns true if status is not archived', () => {
        wrapper = createWrapperForRole(UserRoles.level1);
        expect(wrapper.vm.canManageDuplicates).toBeTruthy();
      });
    });

    describe('enableAutocomplete', () => {
      it('return correct value', async () => {
        await doMount();
        await wrapper.setFeature(wrapper.vm.$featureKeys.AddressAutoFill, true);
        expect(wrapper.vm.enableAutocomplete).toBe(true);

        await doMount();
        await wrapper.setFeature(wrapper.vm.$featureKeys.AddressAutoFill, false);
        expect(wrapper.vm.enableAutocomplete).toBe(false);
      });
    });

    describe('eventNames', () => {
      beforeEach(() => {
        doMount();
      });
      it('returns expected number of names', async () => {
        await wrapper.setData({ allEvents: [...events, otherEvent] });
        expect(Object.keys(wrapper.vm.eventNames).length).toBe(3);
      });
      it('includes expected values', async () => {
        await wrapper.setData({ allEvents: [...events, otherEvent] });
        expect(wrapper.vm.eventNames[events[0].id]).toBeTruthy();
        expect(wrapper.vm.eventNames[events[1].id]).toBeTruthy();
        expect(wrapper.vm.eventNames[otherEvent.id]).toBeTruthy();
      });
    });

    describe('hasLinkedCasefiles', () => {
      it('should return true it myEvents id includes eventId in casefils', () => {
        doMount({
          householdEntity() {
            return mockHouseholdEntity({ householdStatus: HouseholdStatus.Open });
          },
        }, {
          caseFiles: [mockCaseFileEntity({ eventId: 'test-event-id-123' })],
          myEvents: [mockEventSummary({ id: 'test-event-id-123' })],
        });
        expect(wrapper.vm.hasLinkedCasefiles).toEqual(true);
      });
    });

    describe('canChangeStatus', () => {
      it('should return true, when status is Open and it has Level and hasLinkedCasefiles is true', async () => {
        await doMount(
          {
            hasLinkedCasefiles() {
              return true;
            },
            householdEntity() {
              return mockHouseholdEntity({ householdStatus: HouseholdStatus.Open });
            },
          },
          {
            newStatus: HouseholdStatus.Open,
            myEvents: [mockEventSummary()],
            caseFiles: mockCaseFileEntities(),
          },
          true,
          {
            $hasLevel: () => true,
          },
        );
        expect(wrapper.vm.canChangeStatus).toEqual(true);
      });

      it('should return true, when status is Archived and it has Level and members', async () => {
        await doMount(
          {
            hasLinkedCasefiles() {
              return true;
            },
            householdEntity() {
              return mockHouseholdEntity({ householdStatus: HouseholdStatus.Archived });
            },
          },
          {
            newStatus: HouseholdStatus.Open,
            myEvents: [mockEventSummary()],
            caseFiles: mockCaseFileEntities(),
          },
          true,
          {
            $hasLevel: () => true,
          },
        );
        expect(wrapper.vm.canChangeStatus).toEqual(true);
      });

      it('should return true, when status is Closed and it has Level', async () => {
        await doMount(
          {
            hasLinkedCasefiles() {
              return true;
            },
            householdEntity() {
              return mockHouseholdEntity({ householdStatus: HouseholdStatus.Closed });
            },
          },
          {
            newStatus: HouseholdStatus.Open,
            myEvents: [mockEventSummary()],
            caseFiles: mockCaseFileEntities(),
          },
          true,
          {
            $hasLevel: () => true,
          },
        );
        expect(wrapper.vm.canChangeStatus).toEqual(true);
      });
    });

    describe('statuses', () => {
      it('should return Archive and Closed, when status is Open', () => {
        doMount({
          householdEntity() {
            return mockHouseholdEntity({ householdStatus: HouseholdStatus.Open });
          },
        });
        expect(wrapper.vm.statuses).toEqual([HouseholdStatus.Archived, HouseholdStatus.Closed]);
      });

      it('should return Open, when status is Archived', () => {
        doMount({
          householdEntity() {
            return mockHouseholdEntity({ householdStatus: HouseholdStatus.Archived });
          },
        });
        expect(wrapper.vm.statuses).toEqual([HouseholdStatus.Open]);
      });

      it('should return Open, when status is Closed', () => {
        doMount({
          householdEntity() {
            return mockHouseholdEntity({ householdStatus: HouseholdStatus.Closed });
          },
        });
        expect(wrapper.vm.statuses).toEqual([HouseholdStatus.Open]);
      });
    });

    describe('movedMembers', () => {
      it('should return correct data', async () => {
        await doMount();
        await wrapper.setData({
          activityItemsData: mockHouseholdActivities(HouseholdActivityType.HouseholdMoved),
        });
        const expectResult = [
          {
            currentAddress: {
              address: {
                city: 'Ottawa',
                country: 'CA',
                latitude: 0,
                longitude: 0,
                postalCode: 'K1W 1G7',
                province: 9,
                specifiedOtherProvince: undefined,
                streetAddress: '247 Some Street',
                unitSuite: '123',
              },
              addressType: 2,
              checkIn: new Date('2023-05-01T00:00:00.000Z'),
              checkOut: new Date('2023-05-31T00:00:00.000Z'),
              crcProvided: false,
              placeName: 'test',
              placeNumber: '',
              shelterLocation: null,
            },
            genderName: {
              translation: {
                en: 'Male',
                fr: 'Masculin',
              },
            },
            identitySet: {
              birthDate: {
                day: '12',
                month: 2,
                year: '1999',
              },
              dateOfBirth: '1999-02-12T00:00:00.000Z',
              firstName: 'Bob',
              gender: {
                id: '676eb98b-d432-4924-90ee-2489e3acdc26',
                isDefault: false,
                isOther: false,
                restrictFinancial: false,
                name: {
                  translation: {
                    en: 'Male',
                    fr: 'Masculin',
                  },
                },
                orderRank: 0,
                status: 1,
              },
              genderOther: null,
              indigenousCommunityOther: '',
              indigenousIdentity: null,
              indigenousProvince: 1,
              indigenousType: '',
              lastName: 'Smith',
              middleName: 'middle',
              preferredName: 'preferredName',
              indigenousCommunityId: undefined,
              name: undefined,
              duplicateStatusInCurrentHousehold: undefined,
              duplicateStatusInDb: undefined,
            },
            indigenousIdentityInfo: {
              communityType: '',
              name: '',
            },
            personId: 'newId',
            status: 6,
          },
        ];

        expect(wrapper.vm.movedMembers).toEqual(expectResult);
      });
    });

    describe('editingDisabled', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: householdEntity.id,
          },
          data() {
            return {
              myEvents: events,
              casefiles: mockCaseFileEntities(),
              activityItemsData: mockHouseholdActivities(HouseholdActivityType.HouseholdMoved),
            };
          },
          computed: {
            household() {
              return householdCreate;
            },
            householdEntity() {
              return mockHouseholdEntity({ householdStatus: HouseholdStatus.Closed });
            },
          },
          mocks: {
            $services: services,
          },
        });
      });

      it('should return true when household status is not Open, and user has no level6', () => {
        wrapper.vm.$hasLevel = jest.fn(() => false);
        expect(wrapper.vm.editingDisabled).toEqual(true);
      });
    });
  });

  describe('lifecycle', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          id: householdEntity.id,
        },
        data() {
          return {
            myEvents: events,
            casefiles: mockCaseFileEntities(),
          };
        },
        computed: {
          household() {
            return householdCreate;
          },
          householdEntity() {
            return householdEntity;
          },
        },
        mocks: {
          $services: services,
        },
      });
    });
    describe('created', () => {
      it('calls registration storage action fetchGenders', () => {
        expect(registrationStore.fetchGenders).toHaveBeenCalledTimes(1);
      });

      it('calls registration storage action fetchPreferredLanguages', () => {
        expect(registrationStore.fetchPreferredLanguages).toHaveBeenCalledTimes(1);
      });

      it('calls registration storage action fetchPrimarySpokenLanguages', () => {
        expect(registrationStore.fetchPrimarySpokenLanguages).toHaveBeenCalledTimes(1);
      });

      it('calls fetchData', async () => {
        wrapper.vm.fetchData = jest.fn();
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.fetchData).toHaveBeenCalled();
      });

      it('should call attachToChanges', async () => {
        wrapper.vm.attachToChanges = jest.fn();

        expect(wrapper.vm.attachToChanges).toHaveBeenCalledTimes(0);

        await wrapper.vm.$options.created[0].call(wrapper.vm);

        expect(wrapper.vm.attachToChanges).toHaveBeenCalledWith(true);
      });
    });

    describe('destroyed', () => {
      it('should call attachToChanges', async () => {
        wrapper.vm.attachToChanges = jest.fn();

        expect(wrapper.vm.attachToChanges).toHaveBeenCalledTimes(0);

        wrapper.destroy();

        expect(wrapper.vm.attachToChanges).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      await doMount();
    });

    describe('fetchData', () => {
      it('calls fetchHouseholdData, fetchMyEvents, fetchAllEvents, fetchCaseFiles, fetchShelterLocations ,getHouseholdActivity', async () => {
        wrapper.vm.fetchHouseholdData = jest.fn();
        wrapper.vm.fetchMyEvents = jest.fn();
        wrapper.vm.fetchAllEvents = jest.fn();
        wrapper.vm.fetchCaseFiles = jest.fn();
        wrapper.vm.fetchShelterLocations = jest.fn();
        await wrapper.vm.fetchData();
        expect(wrapper.vm.fetchHouseholdData).toHaveBeenCalled();
        expect(wrapper.vm.fetchMyEvents).toHaveBeenCalled();
        expect(wrapper.vm.fetchAllEvents).toHaveBeenCalled();
        expect(wrapper.vm.fetchCaseFiles).toHaveBeenCalled();
        expect(wrapper.vm.fetchShelterLocations).toHaveBeenCalled();
        expect(wrapper.vm.$services.households.getHouseholdActivity).toHaveBeenCalled();
      });
    });

    describe('fetchAllEvents', () => {
      it('calls public searchEventsById with the expected parameters', async () => {
        await doMount(null, {
          caseFiles: [{ eventId: '1' }, { eventId: '2' }, { eventId: '3' }, { eventId: '4' }],
          newStatus: HouseholdStatus.Open,
        });
        jest.spyOn(wrapper.vm.$services.publicApi, 'searchEventsById').mockImplementation(() => {});
        await wrapper.vm.fetchAllEvents();
        expect(wrapper.vm.$services.publicApi.searchEventsById).toHaveBeenCalledWith(['1', '2', '3', '4']);
      });

      it('calls setHouseholdCreate', async () => {
        jest.spyOn(wrapper.vm, 'setHouseholdCreate').mockImplementation(() => {});
        await wrapper.vm.fetchHouseholdData();
        expect(wrapper.vm.setHouseholdCreate).toHaveBeenCalledTimes(1);
      });
    });

    describe('fetchHouseholdData', () => {
      it('calls household storage action fetch with the id', async () => {
        await doMount(null, {
          caseFiles: [{ eventId: '1' }, { eventId: '2' }, { eventId: '3' }, { eventId: '4' }],
          newStatus: HouseholdStatus.Open,
        });
        wrapper.vm.fetchMembers = jest.fn();
        wrapper.vm.fetchDuplicatesCount = jest.fn();
        wrapper.vm.setHouseholdCreate = jest.fn();
        jest.clearAllMocks();
        await wrapper.vm.fetchHouseholdData();
        expect(householdStore.fetch).toHaveBeenCalledWith(householdEntity.id);
        expect(wrapper.vm.fetchMembers).toHaveBeenCalled();
        expect(wrapper.vm.fetchDuplicatesCount).toHaveBeenCalled();
        expect(wrapper.vm.setHouseholdCreate).toHaveBeenCalled();
      });
    });

    describe('closeDuplicatesDialog', () => {
      it('fetches duplicate data and closes the manage duplicate dialog', async () => {
        await doMount();
        await wrapper.setData({ showDuplicatesDialog: true });
        wrapper.vm.fetchDuplicatesCount = jest.fn();
        jest.clearAllMocks();
        await wrapper.vm.closeDuplicatesDialog();
        expect(wrapper.vm.showDuplicatesDialog).toBeFalsy();
        expect(wrapper.vm.fetchDuplicatesCount).toHaveBeenCalled();
      });
    });

    describe('setHouseholdCreate', () => {
      it('calls buildHouseholdCreateData and the registration mutation with the data received from buildHouseholdCreateData', async () => {
        await doMount();
        jest.spyOn(wrapper.vm, 'buildHouseholdCreateData').mockImplementation(() => householdCreate);
        await wrapper.vm.setHouseholdCreate();
        expect(wrapper.vm.buildHouseholdCreateData).toHaveBeenCalledWith(householdEntity);
        expect(registrationStore.setHouseholdCreate).toHaveBeenCalledWith(householdCreate);
      });
    });

    describe('addAdditionalMember', () => {
      it('should set newAdditionalMember to new instance of member', () => {
        wrapper.vm.addAdditionalMember();
        expect(wrapper.vm.newAdditionalMember).toEqual(new Member());
      });

      it('should set showAddAdditionalMember to true', () => {
        wrapper.vm.addAdditionalMember();
        expect(wrapper.vm.showAddAdditionalMember).toEqual(true);
      });

      it('should display a warning message if limit is reached', () => {
        const altHousehold = householdCreate;
        [...Array(MAX_ADDITIONAL_MEMBERS).keys()].forEach((i) => {
          altHousehold.additionalMembers.push(mockMember({ id: Math.random() + i }));
        });

        doMount({
          household() {
            return altHousehold;
          },
        });

        wrapper.vm.addAdditionalMember();
        expect(wrapper.vm.$toasted.global.warning).toHaveBeenCalledWith({ key: 'warning.MAX_ADDITIONAL_MEMBERS_reached', params: [{ x: 15 }] });
      });

      it('should disabled the button add if limit is reached', () => {
        const altHousehold = householdCreate;
        [...Array(MAX_ADDITIONAL_MEMBERS).keys()].forEach((i) => {
          altHousehold.additionalMembers.push(mockMember({ id: Math.random() + i }));
        });

        doMount({
          household() {
            return altHousehold;
          },
        });

        expect(wrapper.vm.disabledAddMembers).toBeFalsy();
        wrapper.vm.addAdditionalMember();
        expect(wrapper.vm.disabledAddMembers).toBeTruthy();
      });
    });

    describe('navigateBack', () => {
      it('should call router back method to new instance of member', () => {
        wrapper.vm.$router.back = jest.fn();
        wrapper.vm.navigateBack();
        expect(wrapper.vm.$router.back).toHaveBeenCalledTimes(1);
      });
    });

    describe('editAddress', () => {
      it('it show edit household address dialog', async () => {
        await doMount();
        expect(wrapper.vm.showEditAddress).toBe(false);

        wrapper.vm.editAddress();

        expect(wrapper.vm.showEditAddress).toBe(true);
      });
    });

    describe('moveMembers', () => {
      it('should redirect to proper page', () => {
        wrapper.vm.moveMembers();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.household.householdMembersMove.name });
      });
    });

    describe('makeShelterLocationsListForMember', () => {
      it('adds the current member shelter location to the shelter locations list if the member has a shelter location as address', async () => {
        const member = { currentAddress: { shelterLocation: { id: 'sl-m-1' } } };
        await wrapper.setData({ shelterLocations: [{ id: 'sl-1' }] });
        const result = await wrapper.vm.makeShelterLocationsListForMember(member);
        expect(result).toEqual([{ id: 'sl-m-1' }, { id: 'sl-1' }]);
      });

      it('returns shelter location  if the member has no shelter location as address', async () => {
        const member = { currentAddress: { shelterLocation: null } };
        await wrapper.setData({ shelterLocations: [{ id: 'sl-1' }] });
        const result = await wrapper.vm.makeShelterLocationsListForMember(member);
        expect(result).toEqual([{ id: 'sl-1' }]);
      });
    });

    describe('onStatusChangeInit', () => {
      it('should set newStatus, set showHouseholdStatusDialog to true', async () => {
        await wrapper.setData({
          newStatus: null,
          showHouseholdStatusDialog: false,
        });
        wrapper.vm.onStatusChangeInit(HouseholdStatus.Open);
        expect(wrapper.vm.newStatus).toEqual(HouseholdStatus.Open);
        expect(wrapper.vm.showHouseholdStatusDialog).toEqual(true);
      });
    });

    describe('onStatusChange', () => {
      it('should call the correct service, set showHouseholdStatusDialog to false', async () => {
        await doMount(null, {
          showHouseholdStatusDialog: true,
        });
        wrapper.vm.$services.households.setHouseholdStatus = jest.fn();
        const payload = { status: HouseholdStatus.Open, rationale: 'test-rationale' };
        await wrapper.vm.onStatusChange(payload);
        expect(wrapper.vm.$services.households.setHouseholdStatus).toHaveBeenCalledWith(wrapper.vm.id, HouseholdStatus.Open, 'test-rationale');
        expect(wrapper.vm.showHouseholdStatusDialog).toEqual(false);
      });
    });

    describe('attachToChanges', () => {
      it('should connect on to signalr updates when true', () => {
        wrapper.vm.attachToChanges(true);
        expect(wrapper.vm.$signalR.connection.on).toHaveBeenCalledWith('household.HouseholdActivityCreated', wrapper.vm.householdActivityChanged);
        expect(wrapper.vm.$signalR.connection.on).toHaveBeenCalledWith('household.HouseholdActivityUpdated', wrapper.vm.householdActivityChanged);
      });
      it('should connect of to signalr updates when false', () => {
        wrapper.vm.attachToChanges(false);
        expect(wrapper.vm.$signalR.connection.off).toHaveBeenCalledWith('household.HouseholdActivityCreated', wrapper.vm.householdActivityChanged);
        expect(wrapper.vm.$signalR.connection.off).toHaveBeenCalledWith('household.HouseholdActivityUpdated', wrapper.vm.householdActivityChanged);
      });
    });

    describe('householdActivityChanged', () => {
      it('calls getHouseholdActivity when the activity has the same household id after debounce', async () => {
        jest.clearAllMocks();
        await wrapper.vm.householdActivityChanged({ householdId: wrapper.vm.id });
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 1500));
        expect(wrapper.vm.$services.households.getHouseholdActivity).toHaveBeenCalled();
      });
    });
  });
});
