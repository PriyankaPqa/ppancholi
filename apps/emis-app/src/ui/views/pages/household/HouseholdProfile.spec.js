import { mockHouseholdCreate, Member } from '@libs/entities-lib/household-create';
import {
  mockHouseholdCaseFile, mockHouseholdEntity,
} from '@libs/entities-lib/household';
import { mockMember } from '@libs/entities-lib/value-objects/member';
import { MAX_ADDITIONAL_MEMBERS } from '@libs/registration-lib/constants/validations';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockEventMainInfo, EEventLocationStatus } from '@libs/entities-lib/event';
import { CaseFileStatus, mockCaseFileEntities } from '@libs/entities-lib/case-file';
import householdHelpers from '@/ui/helpers/household';
import routes from '@/constants/routes';
import flushPromises from 'flush-promises';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';
import { UserRoles } from '@libs/entities-lib/user';

import { mockProvider } from '@/services/provider';
import Component from './HouseholdProfile.vue';

const localVue = createLocalVue();
const householdCreate = { ...mockHouseholdCreate(), additionalMembers: [mockMember({ id: '1' }), mockMember({ id: '2' }), mockMember({ id: '3' })] };
const householdEntity = mockHouseholdEntity();
const services = mockProvider();

const member = mockMember();

const { pinia, registrationStore } = useMockRegistrationStore();
const { householdStore, householdMetadataStore } = useMockHouseholdStore(pinia);

const events = [
  mockEventMainInfo({
    id: '1',
    shelterLocations: [{ id: 'loc-1', status: EEventLocationStatus.Active }],
    registrationLocations: [{ id: ' loc-id-1-active', status: EEventLocationStatus.Active }, { id: ' loc-id-2-inactive', status: EEventLocationStatus.Inactive }],
  }),
  mockEventMainInfo({
    id: '2',
    shelterLocations: [{ id: 'loc-2', status: EEventLocationStatus.Inactive }, { id: 'loc-3', status: EEventLocationStatus.Active }],
    registrationLocations: [{ id: ' loc-id-3-active', status: EEventLocationStatus.Active }, { id: ' loc-id-4-inactive', status: EEventLocationStatus.Inactive }],
  }),
];
const otherEvent = mockEventMainInfo({
  id: '3',
  registrationLocations: [{ id: ' loc-id-5-active', status: EEventLocationStatus.Active }, { id: ' loc-id-6-inactive', status: EEventLocationStatus.Inactive }],
});

describe('HouseholdProfile.vue', () => {
  let wrapper;
  registrationStore.getHouseholdCreate = jest.fn(() => householdCreate);

  describe('Template', () => {
    beforeEach(async () => {
      jest.clearAllMocks();
      wrapper = shallowMount(Component, {
        pinia,
        localVue,
        propsData: {
          id: householdEntity.id,
        },
        data() {
          return {
            events,
            loading: false,
            caseFiles: mockCaseFileEntities(),
          };
        },
        computed: {
          country() {
            return 'mock-country';
          },
          household() {
            return householdCreate;
          },
          householdEntity() {
            return householdEntity;
          },
        },
        mocks: {
          $services: services,
          $hasFeature: () => true,
        },

      });
      householdStore.fetch = jest.fn(() => householdEntity);
      await flushPromises();
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

      it('renders the edit button if the user can edit', () => {
        wrapper = shallowMount(Component, {
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
            };
          },
          computed: {
            country() {
              return 'mock-country';
            },
            household() {
              return householdCreate;
            },
            canEdit() {
              return true;
            },
          },
          mocks: {
            $services: services,
          },

        });

        expect(wrapper.findDataTest('member_address_edit_btn').exists()).toBeTruthy();
      });
      it('does not render the edit button if the user cannot edit', () => {
        wrapper = shallowMount(Component, {
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
            };
          },
          computed: {
            country() {
              return 'mock-country';
            },
            household() {
              return householdCreate;
            },
            canEdit() {
              return false;
            },
          },
          mocks: {
            $services: services,
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

        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: householdEntity.id,
          },
          data() {
            return {
              allEvents: events,
            };
          },
          computed: {
            activeCaseFiles() {
              return caseFiles;
            },
          },
          mocks: {
            $services: services,
          },
        });

        expect(wrapper.vm.registrationLocations).toEqual([
          { id: ' loc-id-1-active', status: EEventLocationStatus.Active },
          { id: ' loc-id-3-active', status: EEventLocationStatus.Active },
        ]);
      });
    });

    describe('household', () => {
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
          },
          mocks: {
            $services: services,
          },

        });
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
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: householdEntity.id,
          },
          data() {
            return {
              caseFiles: [...caseFiles],
            };
          },
          computed: {
            household() {
              return householdCreate;
            },
          },
          mocks: {
            $services: services,
          },

        });

        expect(wrapper.vm.inactiveCaseFiles).toEqual([cfClosed]);
      });
    });

    describe('country', () => {
      it(' calls helpers  countryName and returns the result', () => {
        jest.spyOn(householdHelpers, 'countryName').mockImplementation(() => 'mock-country');
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
          },
          mocks: {
            $services: services,
          },

        });
        expect(wrapper.vm.country).toEqual('mock-country');
      });
    });

    describe('lastUpdated', () => {
      it(' returns the right date when there are timestamps for both entity and metadata', async () => {
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
          },
          mocks: {
            $services: services,
          },

        });

        expect(wrapper.vm.lastUpdated).toEqual('May 26, 2021');
      });

      it(' returns the right date when there are timestamps only for entity', async () => {
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
          },
          mocks: {
            $services: services,
          },

        });

        expect(wrapper.vm.lastUpdated).toEqual('May 26, 2021');
      });
    });

    describe('canEdit', () => {
      it('returns true if user has level 1 and feature flag is off', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: householdEntity.id,
          },
          computed: {
            household() {
              return householdCreate;
            },
          },
          mocks: {
            $services: services,
          },
          pinia: getPiniaForUser(UserRoles.level1),
        });
        wrapper.vm.$hasFeature = jest.fn(() => false);
        expect(wrapper.vm.canEdit).toBeTruthy();
      });

      it('returns true if user has level 0 and feature flag is on', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: householdEntity.id,
          },
          computed: {
            household() {
              return householdCreate;
            },
          },
          mocks: {
            $services: services,
          },
          pinia: getPiniaForUser(UserRoles.level0),
        });
        wrapper.vm.$hasFeature = jest.fn(() => true);
        expect(wrapper.vm.canEdit).toBeTruthy();
      });

      it('returns false if user does not have level 1', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia: getPiniaForUser(UserRoles.contributorIM),
          propsData: {
            id: householdEntity.id,
          },
          computed: {
            household() {
              return householdCreate;
            },
          },
          mocks: {
            $services: services,
          },
        });

        expect(wrapper.vm.canEdit).toBeFalsy();
      });
    });

    describe('canMove', () => {
      it('returns true if user has level 2', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: householdEntity.id,
          },
          computed: {
            household() {
              return householdCreate;
            },
          },
          mocks: {
            $services: services,
          },
          pinia: getPiniaForUser(UserRoles.level2),
        });

        expect(wrapper.vm.canMove).toBeTruthy();
      });

      it('returns false if user does not have level 2', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: householdEntity.id,
          },
          computed: {
            household() {
              return householdCreate;
            },
          },
          mocks: {
            $services: services,
          },
          pinia: getPiniaForUser(UserRoles.level1),
        });

        expect(wrapper.vm.canMove).toBeFalsy();
      });
    });

    describe('enableAutocomplete', () => {
      it('return correct value', () => {
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
          },
          mocks: {
            $hasFeature: () => true,
            $services: services,
          },
        });
        expect(wrapper.vm.enableAutocomplete).toBe(true);

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
          },
          mocks: {
            $services: services,
            $hasFeature: () => false,
          },
        });
        expect(wrapper.vm.enableAutocomplete).toBe(false);
      });
    });

    describe('eventNames', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          data() {
            return {
              allEvents: [...events, otherEvent],
            };
          },
          propsData: {
            id: householdEntity.id,
          },
          mocks: {
            $services: services,
          },
        });
      });
      it('returns expected number of names', () => {
        expect(Object.keys(wrapper.vm.eventNames).length).toBe(3);
      });
      it('includes expected values', () => {
        expect(wrapper.vm.eventNames[events[0].entity.id]).toBeTruthy();
        expect(wrapper.vm.eventNames[events[1].entity.id]).toBeTruthy();
        expect(wrapper.vm.eventNames[otherEvent.entity.id]).toBeTruthy();
      });
    });
  });

  describe('lifecycle', () => {
    describe('created', () => {
      beforeEach(() => {
        jest.clearAllMocks();
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: householdEntity.id,
          },
          mocks: {
            $services: services,
          },
        });
      });
      it('calls registration storage action fetchGenders', () => {
        expect(registrationStore.fetchGenders).toHaveBeenCalledTimes(1);
      });

      it('calls registration storage action fetchPreferredLanguages', () => {
        expect(registrationStore.fetchPreferredLanguages).toHaveBeenCalledTimes(1);
      });

      it('calls registration storage action fetchPrimarySpokenLanguages', () => {
        expect(registrationStore.fetchPrimarySpokenLanguages).toHaveBeenCalledTimes(1);
      });

      it('calls fetchHouseholdData, fetchMyEvents, fetchAllEvents, fetchCaseFiles, fetchShelterLocations', async () => {
        wrapper.vm.fetchHouseholdData = jest.fn();
        wrapper.vm.fetchMyEvents = jest.fn();
        wrapper.vm.fetchAllEvents = jest.fn();
        wrapper.vm.fetchCaseFiles = jest.fn();
        wrapper.vm.fetchShelterLocations = jest.fn();
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.fetchHouseholdData).toHaveBeenCalled();
        expect(wrapper.vm.fetchMyEvents).toHaveBeenCalled();
        expect(wrapper.vm.fetchAllEvents).toHaveBeenCalled();
        expect(wrapper.vm.fetchCaseFiles).toHaveBeenCalled();
        expect(wrapper.vm.fetchShelterLocations).toHaveBeenCalled();
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          id: householdEntity.id,
        },
        mocks: {
          $services: services,
        },

      });
    });

    describe('fetchAllEvents', () => {
      it('calls public searchEventsById with the expected parameters', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          data() {
            return {
              caseFiles: [{ eventId: '1' }, { eventId: '2' }, { eventId: '3' }, { eventId: '4' }],
            };
          },
          propsData: {
            id: householdEntity.id,
          },
          mocks: {
            $services: services,
          },

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
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          data() {
            return {
              caseFiles: [{ eventId: '1' }, { eventId: '2' }, { eventId: '3' }, { eventId: '4' }],
            };
          },
          propsData: {
            id: householdEntity.id,
          },
          mocks: {
            $services: services,
          },

        });
        await wrapper.vm.fetchHouseholdData();
        expect(householdStore.fetch).toHaveBeenCalledWith(householdEntity.id);
        expect(householdMetadataStore.fetch).toHaveBeenCalledWith(householdEntity.id, false);
      });
    });

    describe('setHouseholdCreate', () => {
      it('calls buildHouseholdCreateData and the registration mutation with the data received from buildHouseholdCreateData', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: householdEntity.id,
          },
          computed: {
            householdEntity() {
              return householdEntity;
            },
          },
          mocks: {
            $services: services,
          },
        });

        jest.spyOn(wrapper.vm, 'buildHouseholdCreateData').mockImplementation(() => householdCreate);
        jest.spyOn(wrapper.vm, 'addShelterLocationData').mockImplementation(() => [member]);
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

        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: householdEntity.id,
          },
          data() {
            return {
              myEvents: events,
            };
          },
          computed: {
            country() {
              return 'mock-country';
            },
            household() {
              return altHousehold;
            },
          },
          mocks: {
            $services: services,
          },
        });

        wrapper.vm.addAdditionalMember();
        expect(wrapper.vm.$toasted.global.warning).toHaveBeenCalledWith('warning.MAX_ADDITIONAL_MEMBERS_reached');
      });

      it('should disabled the button add if limit is reached', () => {
        const altHousehold = householdCreate;
        [...Array(MAX_ADDITIONAL_MEMBERS).keys()].forEach((i) => {
          altHousehold.additionalMembers.push(mockMember({ id: Math.random() + i }));
        });

        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: householdEntity.id,
          },
          computed: {
            country() {
              return 'mock-country';
            },
            household() {
              return altHousehold;
            },
          },
          mocks: {
            $services: services,
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
          },
          mocks: {
            $services: services,
          },
        });
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
  });
});
