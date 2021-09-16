import { mockHouseholdCreate, Member } from '@crctech/registration-lib/src/entities/household-create';
import { mockCombinedHousehold, mockHouseholdEntity, mockHouseholdMetadata } from '@crctech/registration-lib/src/entities/household';
import { mockMember } from '@crctech/registration-lib/src/entities/value-objects/member';
import { MAX_ADDITIONAL_MEMBERS } from '@crctech/registration-lib/src/constants/validations';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockEventMainInfo, EEventLocationStatus, EEventStatus } from '@/entities/event';
import { mockCombinedCaseFile, CaseFileStatus } from '@/entities/case-file';
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
  // storage.caseFile.actions.search = jest.fn(() => ({ ids: ['1'] }));
  storage.household.actions.fetch = jest.fn(() => mockCombinedHousehold());
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
            householdData: household,
            loading: false,
          };
        },
        computed: {
          addressLine1() { return 'address-line-1'; },
          addressLine2() { return 'address-line-2'; },
          country() { return 'mock-country'; },
          household() { return householdCreate; },
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
              householdData: household,
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
          data() {
            return {
              householdData: household,
            };
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.household).toEqual(householdCreate);
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
          },
          data() {
            return {
              householdData: household,
            };
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
          data() {
            return {
              householdData: household,
            };
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
          data() {
            return {
              householdData: household,
            };
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
          data() {
            return {
              householdData: household,
            };
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
          data() {
            return {
              householdData: household,
            };
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
              householdData: household,
              caseFileIds: ['1'],
            };
          },
          computed: {
            household() { return householdCreate; },
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
          data() {
            return {
              householdData: household,
            };
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
          },
          data() {
            return {
              householdData:
                { entity: mockHouseholdEntity({ timestamp: '2021-07-01' }), metadata: mockHouseholdMetadata({ timestamp: '2021-07-03' }) },
            };
          },
          mocks: { $storage: storage },
        });

        expect(wrapper.vm.lastUpdated).toEqual('Jul 3, 2021');
      });

      it(' returns the right date when there are timestamps only for entity', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          data() {
            return {
              householdData:
                { entity: mockHouseholdEntity({ timestamp: '2021-07-01' }), metadata: mockHouseholdMetadata({ timestamp: null }) },
            };
          },
          computed: {
            household() { return householdCreate; },
          },
          mocks: { $storage: storage },
        });

        expect(wrapper.vm.lastUpdated).toEqual('Jul 1, 2021');
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
          data() {
            return {
              householdData: household,
            };
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
          data() {
            return {
              householdData: household,
            };
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
          data() {
            return {
              householdData: household,
            };
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
          data() {
            return {
              householdData: household,
            };
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
          data() {
            return {
              householdData: household,
            };
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
              householdData: household,
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
          data() {
            return {
              events,
              householdData: household,
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
        });
        expect(wrapper.vm.showEditAddress).toBe(false);

        wrapper.vm.editAddress();

        expect(wrapper.vm.showEditAddress).toBe(true);
      });
    });
  });
});
