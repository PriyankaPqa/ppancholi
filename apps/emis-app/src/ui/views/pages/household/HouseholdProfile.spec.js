import { mockHouseholdCreate, Member } from '@libs/registration-lib/entities/household-create';
import { mockCombinedHousehold, mockHouseholdCaseFile } from '@libs/registration-lib/entities/household';
import { mockMember } from '@libs/registration-lib/entities/value-objects/member';
import { MAX_ADDITIONAL_MEMBERS } from '@libs/registration-lib/constants/validations';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockEventMainInfo, EEventLocationStatus } from '@/entities/event';
import { mockCombinedCaseFile, CaseFileStatus } from '@/entities/case-file';
import { mockUserStateLevel } from '@/test/helpers';
import householdHelpers from '@/ui/helpers/household';
import routes from '@/constants/routes';
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
      wrapper = shallowMount(Component, {
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
          country() {
            return 'mock-country';
          },
          household() {
            return householdCreate;
          },
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
        wrapper = shallowMount(Component, {
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
            $storage: storage,
          },
        });

        expect(wrapper.findDataTest('member_address_edit_btn').exists()).toBeTruthy();
      });
      it('does not render the edit button if the user cannot edit', () => {
        wrapper = shallowMount(Component, {
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
    describe('registrationLocations', () => {
      it('returns the right data', () => {
        const caseFiles = [mockHouseholdCaseFile(
          {
            caseFileId: 'id-1',
            registrationLocations: [
              { id: ' loc-id-1-active', status: EEventLocationStatus.Active },
              { id: ' loc-id-2-inactive', status: EEventLocationStatus.Inactive },
            ],
          },
        ),
        mockHouseholdCaseFile(
          {
            registrationLocations: [
              { id: ' loc-id-3-active', status: EEventLocationStatus.Active },
              { id: ' loc-id-4-inactive', status: EEventLocationStatus.Inactive },
            ],
          },
        ),

        ];

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            activeCaseFiles() {
              return caseFiles;
            },
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

        expect(wrapper.vm.registrationLocations).toEqual([
          { id: ' loc-id-1-active', status: EEventLocationStatus.Active }, { id: ' loc-id-3-active', status: EEventLocationStatus.Active },
        ]);
      });
    });

    describe('shelterLocations', () => {
      it('returns the correct list of shelter locations', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            country() {
              return 'mock-country';
            },
            household() {
              return householdCreate;
            },
          },
          data() {
            return {
              events: [...events,
                mockEventMainInfo(
                  {
                    id: '2',
                    schedule: { status: 0 },
                    shelterLocations: [{ id: 'loc-5', status: EEventLocationStatus.Active }],
                  },
                )],
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
            household() {
              return householdCreate;
            },
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
            household() {
              return householdCreate;
            },
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
            household() {
              return householdCreate;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.inactiveCaseFiles).toEqual([cfClosed]);
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
            household() {
              return householdCreate;
            },
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
        jest.spyOn(householdHelpers, 'countryName').mockImplementation(() => 'mock-country');
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            household() {
              return householdCreate;
            },
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
            household() {
              return householdCreate;
            },
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
            household() {
              return householdCreate;
            },
          },
          mocks: { $storage: storage },
        });

        expect(wrapper.vm.lastUpdated).toEqual('May 26, 2021');
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
            household() {
              return householdCreate;
            },
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
            household() {
              return householdCreate;
            },
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

    describe('canMove', () => {
      it('returns true if user has level 2', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            household() {
              return householdCreate;
            },
          },
          store: {
            ...mockUserStateLevel(2),
          },
          mocks: {
            $storage: {
              registration: { getters: { householdCreate: jest.fn(() => householdCreate) } },
              caseFile: { getters: { getByIds: jest.fn(() => [caseFile]) } },
              household: { actions: { fetch: jest.fn(() => mockCombinedHousehold()) } },
            },
          },
        });

        expect(wrapper.vm.canMove).toBeTruthy();
      });

      it('returns false if user does not have level 2', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            household() {
              return householdCreate;
            },
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

        expect(wrapper.vm.canMove).toBeFalsy();
      });
    });

    describe('enableAutocomplete', () => {
      it('return correct value', () => {
        storage.tenantSettings.getters.isFeatureEnabled.mockReturnValueOnce(true);
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            household() {
              return householdCreate;
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.enableAutocomplete).toBe(true);

        storage.tenantSettings.getters.isFeatureEnabled.mockReturnValueOnce(false);
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            household() {
              return householdCreate;
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.enableAutocomplete).toBe(false);
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
    describe('fetchMyEvents', () => {
      it('calls searchMyEvents service with the right filter', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            activeCaseFiles() {
              return [{ eventId: 'id-1' }, { eventId: 'id-2' }];
            },
            household() {
              return householdCreate;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        const expectedFilter = 'search.in(Entity/Id, \'id-1|id-2\', \'|\')';
        await wrapper.vm.fetchMyEvents();
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
        expect(wrapper.vm.$storage.household.actions.fetch).toHaveBeenCalledWith(household.entity.id,
          { useEntityGlobalHandler: true, useMetadataGlobalHandler: false });
      });

      it('calls setHouseholdCreate', async () => {
        jest.spyOn(wrapper.vm, 'setHouseholdCreate').mockImplementation(() => {});
        await wrapper.vm.fetchHouseholdData();
        expect(wrapper.vm.setHouseholdCreate).toHaveBeenCalledTimes(1);
      });
    });

    describe('setHouseholdCreate', () => {
      it('calls buildHouseholdCreateData and the registration mutation with the data received from buildHouseholdCreateData', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          computed: {
            householdData() {
              return household;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        jest.spyOn(wrapper.vm, 'buildHouseholdCreateData').mockImplementation(() => householdCreate);
        jest.spyOn(wrapper.vm, 'addShelterLocationData').mockImplementation(() => [member]);
        await wrapper.vm.setHouseholdCreate();
        expect(wrapper.vm.buildHouseholdCreateData).toHaveBeenCalledWith(household, null);
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
            country() {
              return 'mock-country';
            },
            household() {
              return altHousehold;
            },
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
            country() {
              return 'mock-country';
            },
            household() {
              return altHousehold;
            },
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

    describe('navigateBack', () => {
      it('should call router back method to new instance of member', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.$router.back = jest.fn();
        wrapper.vm.navigateBack();
        expect(wrapper.vm.$router.back).toHaveBeenCalledTimes(1);
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
            household() {
              return householdCreate;
            },
          },
          mocks: { $storage: storage },
        });
        expect(wrapper.vm.showEditAddress).toBe(false);

        wrapper.vm.editAddress();

        expect(wrapper.vm.showEditAddress).toBe(true);
      });
    });

    describe('moveMembers', () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: household.entity.id,
        },
      });
      it('should redirect to proper page', () => {
        wrapper.vm.moveMembers();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.household.householdMembersMove.name });
      });
    });
  });
});
