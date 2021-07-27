import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import {
  mockGenders, mockHouseholdCreate, mockPreferredLanguages, mockPrimarySpokenLanguages,
} from '@crctech/registration-lib/src/entities/household-create';
import { mockCombinedHousehold, mockHouseholdEntity, mockHouseholdMetadata } from '@crctech/registration-lib/src/entities/household';
import { mockMember } from '@crctech/registration-lib/src/entities/value-objects/member';
import { mockStorage } from '@/store/storage';
import { ECanadaProvinces } from '@/types';

import {
  mockCombinedCaseFile, mockCaseFileEntity, mockCaseFileMetadata, CaseFileStatus,
} from '@/entities/case-file';
import helpers from '@/ui/helpers';

import Component from './HouseholdProfile.vue';

const localVue = createLocalVue();
const householdCreate = { ...mockHouseholdCreate(), additionalMembers: [mockMember()] };
const household = mockCombinedHousehold();
const storage = mockStorage();
const caseFile = mockCombinedCaseFile();

describe('HouseholdProfile.spec.vue', () => {
  let wrapper;
  storage.registration.actions.fetchGenders = jest.fn(() => mockGenders());
  storage.registration.actions.fetchPreferredLanguages = jest.fn(() => mockPreferredLanguages());
  storage.registration.actions.fetchPrimarySpokenLanguages = jest.fn(() => mockPrimarySpokenLanguages());
  storage.household.actions.fetch = jest.fn(() => household);
  storage.caseFile.actions.search = jest.fn(() => ({ ids: ['1'] }));
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
            household: householdCreate,
          };
        },
        computed: {
          addressLine1() { return 'address-line-1'; },
          addressLine2() { return 'address-line-2'; },
          country() { return 'mock-country'; },
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('registration number', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('household_profile_registration_number');
        expect(element.exists()).toBeTruthy();
      });
      it('displays the right data', () => {
        const element = wrapper.findDataTest('household_profile_registration_number');
        expect(element.text()).toContain(wrapper.vm.household.registrationNumber);
      });
    });

    describe('homeAddress', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('household_profile_home_address');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right data', () => {
        const element = wrapper.findDataTest('household_profile_home_address');
        expect(element.text()).toContain(wrapper.vm.addressLine1);
        expect(element.text()).toContain(wrapper.vm.addressLine2);
        expect(element.text()).toContain(wrapper.vm.country);
      });
    });

    describe('created', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('household_profile_created_date');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right data', () => {
        const element = wrapper.findDataTest('household_profile_created_date');
        expect(element.text()).toContain('May 26, 2021');
      });
    });

    describe('last updated', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('household_profile_last_updated_date');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right data', () => {
        const element = wrapper.findDataTest('household_profile_last_updated_date');
        expect(element.text()).toContain('May 26, 2021');
      });
    });
  });

  describe('Computed', () => {
    describe('openCaseFiles', () => {
      it('returns the open case files', () => {
        const cfOpen = { entity: mockCaseFileEntity({ id: '1', caseFileStatus: CaseFileStatus.Open }), metadata: mockCaseFileMetadata() };
        const cfClosed = { entity: mockCaseFileEntity({ id: '1', caseFileStatus: CaseFileStatus.Closed }), metadata: mockCaseFileMetadata() };
        const caseFiles = [cfOpen, cfClosed];
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          data() {
            return {
              household: householdCreate,
            };
          },
          computed: {
            caseFiles() {
              return caseFiles;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.openCaseFiles).toEqual([cfOpen]);
      });
    });

    describe('closedCaseFiles', () => {
      it('returns the open case files', () => {
        const cfOpen = { entity: mockCaseFileEntity({ id: '1', caseFileStatus: CaseFileStatus.Open }), metadata: mockCaseFileMetadata() };
        const cfClosed = { entity: mockCaseFileEntity({ id: '1', caseFileStatus: CaseFileStatus.Closed }), metadata: mockCaseFileMetadata() };
        const caseFiles = [cfOpen, cfClosed];
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          data() {
            return {
              household: householdCreate,
            };
          },
          computed: {
            caseFiles() {
              return caseFiles;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.closedCaseFiles).toEqual([cfClosed]);
      });
    });

    describe('addressLine1', () => {
      it('returns the right data when there is a unit suite ', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          data() {
            return {
              household: { ...householdCreate, homeAddress: { ...householdCreate.homeAddress, unitSuite: '13' } },
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
          data() {
            return {
              household: householdCreate,
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
              household: householdCreate,
            };
          },
          computed: {
            provinceCodeName() {
              return 'QC';
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.addressLine2)
          .toEqual(`${wrapper.vm.household.homeAddress.city}, ${wrapper.vm.provinceCodeName}, ${wrapper.vm.household.homeAddress.postalCode}`);
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
              household: householdCreate,
              householdData: household,
              caseFileIds: ['1'],
            };
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.caseFiles).toMatchObject([caseFile]);
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
          data() {
            return {
              household: householdCreate,
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
          data() {
            return {
              household: householdCreate,
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
              household: householdCreate,
              householdData:
              { entity: mockHouseholdEntity({ timestamp: '2021-07-01' }), metadata: mockHouseholdMetadata({ timestamp: null }) },
            };
          },
          mocks: { $storage: storage },
        });

        expect(wrapper.vm.lastUpdated).toEqual('Jul 1, 2021');
      });
    });

    describe('provinceCodeName', () => {
      it(' returns the right data when province is not other', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          data() {
            return {
              household: { ...householdCreate, homeAddress: { ...householdCreate.homeAddress, province: ECanadaProvinces.QC } },
            };
          },
          mocks: { $storage: storage },
        });

        expect(wrapper.vm.provinceCodeName).toEqual('QC');
      });

      it('returns the right data when province is other', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: household.entity.id,
          },
          data() {
            return {
              household: {
                ...householdCreate,
                homeAddress:
                { ...householdCreate.homeAddress, province: ECanadaProvinces.OT, specifiedOtherProvince: 'mock-province' },
              },
            };
          },
          mocks: { $storage: storage },
        });

        expect(wrapper.vm.provinceCodeName).toEqual('mock-province');
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

      it('calls fetchHouseholdData', () => {
        jest.spyOn(wrapper.vm, 'fetchHouseholdData').mockImplementation(() => {});
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.fetchHouseholdData).toHaveBeenCalledTimes(1);
      });
      it('calls fetchCaseFilesInformation', () => {
        jest.spyOn(wrapper.vm, 'fetchCaseFilesInformation').mockImplementation(() => {});
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.fetchCaseFilesInformation).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
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
    describe('fetchHouseholdData', () => {
      it('calls household storage action fetch with the id', async () => {
        await wrapper.vm.fetchHouseholdData();
        expect(wrapper.vm.$storage.household.actions.fetch).toHaveBeenCalledWith(household.entity.id);
      });

      it('calls buildHouseholdCreateData  with the result of the storage call', async () => {
        jest.spyOn(wrapper.vm, 'buildHouseholdCreateData').mockImplementation(() => {});
        await wrapper.vm.fetchHouseholdData();
        expect(wrapper.vm.buildHouseholdCreateData).toHaveBeenCalledWith(household);
      });

      it('saves into household the data received from buildHouseholdCreateData', async () => {
        jest.spyOn(wrapper.vm, 'buildHouseholdCreateData').mockImplementation(() => householdCreate);
        await wrapper.vm.fetchHouseholdData();
        expect(wrapper.vm.household).toEqual(householdCreate);
      });
    });

    describe('fetchCaseFilesInformation', () => {
      it('calls case files storage action search with the right filter', async () => {
        await wrapper.vm.fetchCaseFilesInformation();
        expect(wrapper.vm.$storage.caseFile.actions.search).toHaveBeenCalledWith({ filter: { Entity: { HouseholdId: household.entity.id } } });
      });

      it('saves into caseFileIds the data received from search', async () => {
        await wrapper.vm.fetchCaseFilesInformation();
        expect(wrapper.vm.caseFileIds).toEqual(['1']);
      });
    });
  });
});
