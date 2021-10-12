import { mockHouseholdCreate, Member } from '@crctech/registration-lib/src/entities/household-create';
import { mockCombinedHousehold, mockHouseholdEntity, mockHouseholdMetadata } from '@crctech/registration-lib/src/entities/household';
import { mockMember } from '@crctech/registration-lib/src/entities/value-objects/member';
import { MAX_ADDITIONAL_MEMBERS } from '@crctech/registration-lib/src/constants/validations';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockEventMainInfo, EEventLocationStatus, EEventStatus } from '@/entities/event';
import { mockCombinedCaseFile, CaseFileStatus } from '@/entities/case-file';
import { mockUserStateLevel } from '@/test/helpers';
import helpers from '@/ui/helpers';

import Component from './HouseholdProfile.vue';

const localVue = createLocalVue();
const householdCreate = { ...mockHouseholdCreate(), additionalMembers: [mockMember()] };
const household = mockCombinedHousehold();
const storage = mockStorage();
const caseFile = mockCombinedCaseFile();
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

describe('HouseholdProfile.vue', () => {
  let wrapper;
  storage.registration.getters.householdCreate = jest.fn(() => householdCreate);
  storage.household.getters.get = jest.fn(() => household);
  storage.household.actions.fetch = jest.fn(() => household);
  storage.caseFile.getters.getByIds = jest.fn(() => [caseFile]);

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          id: household.entity.id,
        },
        data() {
          return {
            events,
            loading: false,
          };
        },
        computed: {
          addressLine1() { return 'address-line-1'; },
          addressLine2() { return 'address-line-2'; },
          country() { return 'mock-country'; },
          household() { return householdCreate; },
          householdData() { return household; },
        },
        mocks: {
          $storage: storage,
        },
      });
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
        wrapper = mount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          data() {
            return {
              events,
              loading: false,
            };
          },
          computed: {
            addressLine1() { return 'address-line-1'; },
            addressLine2() { return 'address-line-2'; },
            country() { return 'mock-country'; },
            household() { return householdCreate; },
            canEdit() { return true; },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.findDataTest('member_address_edit_btn').exists()).toBeTruthy();
      });
      it('does not render the edit button if the user cannot edit', () => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          data() {
            return {
              events,
              loading: false,
            };
          },
          computed: {
            addressLine1() { return 'address-line-1'; },
            addressLine2() { return 'address-line-2'; },
            country() { return 'mock-country'; },
            household() { return householdCreate; },
            canEdit() { return false; },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.findDataTest('member_address_edit_btn').exists()).toBeFalsy();
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
    describe('shelterLocations', () => {
      it('returns the correct list of shelter locations', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            addressLine1() { return 'address-line-1'; },
            addressLine2() { return 'address-line-2'; },
            country() { return 'mock-country'; },
            household() { return householdCreate; },
          },
          data() {
            return {
              events,
            };
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.shelterLocations).toEqual([
          { id: 'loc-1', status: EEventLocationStatus.Active }, { id: 'loc-3', status: EEventLocationStatus.Active }]);
      });
    });

    describe('household', () => {
      it('returns the right data', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            household() { return householdCreate; },
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.household).toEqual(householdCreate);
      });
    });

    describe('householdData', () => {
      it('returns the right data', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            household() { return householdCreate; },
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.householdData).toEqual(household);
      });
    });

    describe('activeCaseFiles', () => {
      it('returns the open case files', () => {
        const cfOpen = { caseFileId: '1', caseFileStatus: CaseFileStatus.Open };
        const cfClosed = { caseFileId: '2', caseFileStatus: CaseFileStatus.Closed };
        const caseFiles = [cfOpen, cfClosed];
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            caseFiles() {
              return caseFiles;
            },
            household() {
              return householdCreate;
            },
            householdData() {
              return household;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.activeCaseFiles).toEqual([cfOpen]);
      });
    });

    describe('inactiveCaseFiles', () => {
      it('returns the open case files', () => {
        const cfOpen = { caseFileId: '1', caseFileStatus: CaseFileStatus.Open };
        const cfClosed = { caseFileId: '2', caseFileStatus: CaseFileStatus.Closed };
        const caseFiles = [cfOpen, cfClosed];
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            caseFiles() {
              return caseFiles;
            },
            household() { return householdCreate; },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.inactiveCaseFiles).toEqual([cfClosed]);
      });
    });

    describe('addressLine1', () => {
      it('returns the right data when there is a unit suite ', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            household() { return { ...householdCreate, homeAddress: { ...householdCreate.homeAddress, unitSuite: '13' } }; },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.addressLine1).toEqual(`13-${wrapper.vm.household.homeAddress.streetAddress},`);
      });

      it('returns the right data when there is no unit suite ', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            household() { return householdCreate; },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.addressLine1).toEqual(`${wrapper.vm.household.homeAddress.streetAddress},`);
      });
    });

    describe('addressLine2', () => {
      it('returns the right data', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            household() { return householdCreate; },
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.addressLine2)
          .toEqual(`${wrapper.vm.household.homeAddress.city}, ON, ${wrapper.vm.household.homeAddress.postalCode}`);
      });
    });

    describe('caseFiles', () => {
      it('returns the right data', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          data() {
            return {
              caseFileIds: ['1'],
            };
          },
          computed: {
            household() { return householdCreate; },
            householdData() { return household; },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.caseFiles).toEqual(wrapper.vm.householdData.metadata.caseFiles);
      });
    });

    describe('country', () => {
      it(' calls helpers  countryName and returns the result', () => {
        jest.spyOn(helpers, 'countryName').mockImplementation(() => 'mock-country');
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            household() { return householdCreate; },
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.country).toEqual('mock-country');
      });
    });

    describe('lastUpdated', () => {
      it(' returns the right date when there are timestamps for both entity and metadata', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            household() { return householdCreate; },
            householdData() { return household; },
          },
          mocks: { $storage: storage },
        });

        expect(wrapper.vm.lastUpdated).toEqual('May 26, 2021');
      });

      it(' returns the right date when there are timestamps only for entity', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            household() { return householdCreate; },
            householdData() {
              return { entity: mockHouseholdEntity({ timestamp: '2021-07-01' }), metadata: mockHouseholdMetadata({ timestamp: null }) };
            },
          },
          mocks: { $storage: storage },
        });

        expect(wrapper.vm.lastUpdated).toEqual('Jul 1, 2021');
      });
    });

    describe('canEdit', () => {
      it('returns true if user has level 1', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            household() { return householdCreate; },
            householdData() { return household; },
          },
          store: {
            ...mockUserStateLevel(1),
          },
          mocks: {
            $storage: {
              registration: { getters: { householdCreate: jest.fn(() => householdCreate) } },
              caseFile: { getters: { getByIds: jest.fn(() => [caseFile]) } },
              household: { actions: { fetch: jest.fn(() => mockCombinedHousehold()) } },
            },
          },
        });

        expect(wrapper.vm.canEdit).toBeTruthy();
      });

      it('returns false if user does not have level 1', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            household() { return householdCreate; },
            householdData() { return household; },
          },
          store: {
            modules: {
              user: {
                state:
                  {
                    oid: '7',
                    email: 'test@test.ca',
                    family_name: 'Joe',
                    given_name: 'Pink',
                    roles: ['contributorIM'],
                  },
              },
            },
          },
          mocks: {
            $storage: {
              registration: { getters: { householdCreate: jest.fn(() => householdCreate) } },
              caseFile: { getters: { getByIds: jest.fn(() => [caseFile]) } },
              household: { actions: { fetch: jest.fn(() => mockCombinedHousehold()) } },
            },
          },
        });

        expect(wrapper.vm.canEdit).toBeFalsy();
      });
    });
  });

  describe('lifecycle', () => {
    describe('created', () => {
      beforeEach(() => {
        jest.clearAllMocks();
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          mocks: {
            $storage: storage,
          },
        });
        jest.spyOn(wrapper.vm, 'fetchHouseholdData').mockImplementation(() => { });
      });
      it('calls registration storage action fetchGenders', () => {
        expect(wrapper.vm.$storage.registration.actions.fetchGenders).toHaveBeenCalledTimes(1);
      });

      it('calls registration storage action fetchPreferredLanguages', () => {
        expect(wrapper.vm.$storage.registration.actions.fetchPreferredLanguages).toHaveBeenCalledTimes(1);
      });

      it('calls registration storage action fetchPrimarySpokenLanguages', () => {
        expect(wrapper.vm.$storage.registration.actions.fetchPrimarySpokenLanguages).toHaveBeenCalledTimes(1);
      });

      it('calls fetchHouseholdData', async () => {
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.fetchHouseholdData).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
    describe('fetchActiveEvents', () => {
      it('calls searchMyEvents service with the right filter', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            activeCaseFiles() { return [{ eventId: 'id-1' }, { eventId: 'id-2' }]; },
            household() { return householdCreate; },
          },
          mocks: {
            $storage: storage,
          },
        });

        const expectedFilter = `search.in(Entity/Id, 'id-1|id-2', '|') and Entity/Schedule/Status eq ${EEventStatus.Open}`;
        await wrapper.vm.fetchActiveEvents();
        expect(wrapper.vm.$services.events.searchMyEvents).toHaveBeenCalledWith({ filter: expectedFilter, top: 999 });
      });
    });

    describe('fetchHouseholdData', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          mocks: {
            $storage: storage,
          },
        });
      });
      it('calls household storage action fetch with the id', async () => {
        await wrapper.vm.fetchHouseholdData();
        expect(wrapper.vm.$storage.household.actions.fetch).toHaveBeenCalledWith(household.entity.id);
      });

      it('calls the registration mutation with the data received from buildHouseholdCreateData', async () => {
        jest.spyOn(wrapper.vm, 'buildHouseholdCreateData').mockImplementation(() => householdCreate);
        jest.spyOn(wrapper.vm, 'addShelterLocationData').mockImplementation(() => [member]);
        await wrapper.vm.fetchHouseholdData();
        expect(storage.registration.mutations.setHouseholdCreate).toHaveBeenCalledWith(householdCreate);
      });
    });

    describe('addAdditionalMember', () => {
      it('should set newAdditionalMember to new instance of member', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.addAdditionalMember();
        expect(wrapper.vm.newAdditionalMember).toEqual(new Member());
      });

      it('should set showAddAdditionalMember to true', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          mocks: {
            $storage: storage,
          },
        });
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
          propsData: {
            id: household.entity.id,
          },
          data() {
            return {
              events,
            };
          },
          computed: {
            addressLine1() { return 'address-line-1'; },
            addressLine2() { return 'address-line-2'; },
            country() { return 'mock-country'; },
            household() { return altHousehold; },
          },
          mocks: {
            $storage: storage,
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
          propsData: {
            id: household.entity.id,
          },
          computed: {
            addressLine1() { return 'address-line-1'; },
            addressLine2() { return 'address-line-2'; },
            country() { return 'mock-country'; },
            household() { return altHousehold; },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.disabledAddMembers).toBeFalsy();
        wrapper.vm.addAdditionalMember();
        expect(wrapper.vm.disabledAddMembers).toBeTruthy();
      });
    });

    describe('editAddress', () => {
      it('it show edit household address dialog', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            household() { return householdCreate; },
            householdData() { return household; },
          },
          mocks: { $storage: storage },
        });
        expect(wrapper.vm.showEditAddress).toBe(false);

        wrapper.vm.editAddress();

        expect(wrapper.vm.showEditAddress).toBe(true);
      });
    });
  });
});
