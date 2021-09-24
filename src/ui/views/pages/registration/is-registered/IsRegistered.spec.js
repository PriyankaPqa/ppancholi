import Vuetify from 'vuetify';
import { RcDialog } from '@crctech/component-library';
import { mockSplitHousehold } from '@crctech/registration-lib/src/entities/household-create';
import { mockCombinedHousehold } from '@crctech/registration-lib/src/entities/household';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import HouseholdSearch from '@/ui/views/pages/registration/is-registered/HouseholdSearch.vue';
import HouseholdResults from '@/ui/views/pages/registration/is-registered/HouseholdResults.vue';

import { mockStorage } from '@/store/storage';

import moment from '@/ui/plugins/moment';
import Component from './IsRegistered.vue';

const localVue = createLocalVue();

const storage = mockStorage();

const vuetify = new Vuetify();

describe('IsRegistered.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();

    storage.household.actions.fetch = jest.fn(() => mockCombinedHousehold());
    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Template', () => {
    describe('HouseholdSearch', () => {
      it('should be rendered if showResultPage is false', () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          computed: {
            showResultPage: () => false,
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.findComponent(HouseholdSearch).exists()).toBeTruthy();
        expect(wrapper.findComponent(HouseholdResults).exists()).toBeFalsy();
      });
      it('should call search method when search is emitted', () => {
        wrapper.vm.search = jest.fn();
        const component = wrapper.findComponent(HouseholdSearch);
        component.vm.$emit('search', 'params');
        expect(wrapper.vm.search).toHaveBeenCalledWith('params');
      });
    });

    describe('HouseholdResults', () => {
      it('should be rendered if showResultPage is true', () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          computed: {
            showResultPage: () => true,
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.findComponent(HouseholdSearch).exists()).toBeFalsy();
        expect(wrapper.findComponent(HouseholdResults).exists()).toBeTruthy();
      });

      it('should pass searchResults as props', () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          computed: {
            showResultPage: () => true,
          },
          mocks: {
            $storage: storage,
          },
        });
        const component = wrapper.findComponent(HouseholdResults);
        expect(component.props().items).toEqual([]);
      });
    });

    describe('Details dialog', () => {
      it('renders if showDetailsDialog is true', () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          data() {
            return {
              showDetailsDialog: true,
            };
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.findComponent(RcDialog).exists()).toBeTruthy();
      });
    });
  });

  describe('Methods', () => {
    describe('search', () => {
      it('should set criteria', () => {
        expect(wrapper.vm.criteria).toEqual({});
        wrapper.vm.search({ test: 'test' });
        expect(wrapper.vm.criteria).toEqual({ test: 'test' });
      });
      it('should call search actions with proper parameters', async () => {
        await wrapper.vm.search({});
        expect(wrapper.vm.$storage.household.actions.search).toHaveBeenCalledWith({
          search: wrapper.vm.searchCriteria,
          filter: wrapper.vm.filters,
          top: 999,
          queryType: 'full',
        });
      });

      it('should set searchResults', async () => {
        await wrapper.setData({
          searchResults: [],
        });
        await wrapper.vm.search({});
        expect(wrapper.vm.searchResults).toEqual(wrapper.vm.$storage.household.getters.getByIds());
      });

      it('should call setHouseholdResultsShown mutation with proper parameter', async () => {
        await wrapper.vm.search({});
        expect(wrapper.vm.$storage.registration.mutations.setHouseholdResultsShown).toHaveBeenCalledWith(true);
      });

      it('should call filterOutSplittedHousehold if in split mode', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          computed: {
            isSplitMode() { return true; },
          },
          mocks: {
            $storage: storage,
          },
        });

        jest.spyOn(wrapper.vm, 'filterOutSplittedHousehold').mockImplementation(() => {});
        await wrapper.vm.search({});
        expect(wrapper.vm.filterOutSplittedHousehold).toHaveBeenCalled();
      });
    });

    describe('showDetails', () => {
      it('calls fetchCaseFilesInformation', () => {
        jest.spyOn(wrapper.vm, 'fetchCaseFilesInformation').mockImplementation(() => {});
        wrapper.vm.showDetails('mock-id');
        expect(wrapper.vm.fetchCaseFilesInformation).toHaveBeenCalledWith('mock-id');
      });

      it('calls fetchCaseFilesInformation if isSplitMode is true', async () => {
        expect(wrapper.vm.showDetailsDialog).toBeFalsy();
        await wrapper.vm.showDetails('mock-id');
        expect(wrapper.vm.showDetailsDialog).toBeTruthy();
      });
    });

    describe('filterOutSplittedHousehold', () => {
      it('removes the results with the id of the origin household for the split', async () => {
        storage.household.getters.getAll = jest.fn(() => [
          { entity: { id: mockSplitHousehold().originHouseholdId } },
          { entity: { id: 'foo' } },
        ]);
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          mocks: {
            $storage: storage,
          },
          store: {
            modules: {
              registration: {
                state: {
                  splitHousehold: mockSplitHousehold(),
                },
              },
            },
          },
        });

        await wrapper.vm.filterOutSplittedHousehold();
        expect(wrapper.vm.searchResults).toEqual([{ entity: { id: 'foo' } }]);
      });
    });

    describe('fetchCaseFilesInformation', () => {
      it('calls household actions fetch', () => {
        wrapper.vm.fetchCaseFilesInformation();
        expect(storage.household.actions.fetch).toHaveBeenCalled();
      });

      it('updates caseFiles with the call result', async () => {
        await wrapper.vm.fetchCaseFilesInformation();
        expect(wrapper.vm.caseFiles).toEqual(mockCombinedHousehold().metadata.caseFiles);
      });
    });
  });

  describe('Computed', () => {
    describe('metadataFilters', () => {
      it('should add email to filter if here', () => {
        wrapper.setData({
          criteria: {
            emailAddress: 'test@test.ca',
          },
        });
        const expected = {
          Email: wrapper.vm.criteria.emailAddress,
        };
        expect(wrapper.vm.metadataFilters).toEqual(expected);
      });

      it('should add birthDate to filter if here', () => {
        wrapper.setData({
          criteria: {
            birthDate: '1990-01-01',
          },
        });
        const expected = {
          DateOfBirth: moment.utc(wrapper.vm.criteria.birthDate).format(),
        };
        expect(wrapper.vm.metadataFilters).toEqual(expected);
      });

      it('should add phone to filter if here', () => {
        wrapper.setData({
          criteria: {
            phone: '438-888-888',
          },
        });
        const expected = {
          or: [
            { 'HomePhoneNumber/E164Number': wrapper.vm.criteria.phone },
            { 'MobilePhoneNumber/E164Number': wrapper.vm.criteria.phone },
            { 'AlternatePhoneNumber/E164Number': wrapper.vm.criteria.phone },
          ],
        };
        expect(wrapper.vm.metadataFilters).toEqual(expected);
      });
    });

    describe('searchCriteria', () => {
      it('should add firstName to search if here (contains operator)', () => {
        wrapper.setData({
          criteria: {
            firstName: 'Mister',
          },
        });
        const expected = `Metadata/MemberMetadata/FirstName:/.*${wrapper.vm.criteria.firstName}.*/`;
        expect(wrapper.vm.searchCriteria).toEqual(expected);
      });

      it('should add lastName to search if here (contains operator)', () => {
        wrapper.setData({
          criteria: {
            lastName: 'Test',
          },
        });
        const expected = `Metadata/MemberMetadata/LastName:/.*${wrapper.vm.criteria.lastName}.*/`;
        expect(wrapper.vm.searchCriteria).toEqual(expected);
      });

      it('should add both to filter if here (contains operator)', () => {
        wrapper.setData({
          criteria: {
            firstName: 'Mister',
            lastName: 'Test',
          },
        });
        const expected = `Metadata/MemberMetadata/FirstName:/.*${wrapper.vm.criteria.firstName}.*/
        AND Metadata/MemberMetadata/LastName:/.*${wrapper.vm.criteria.lastName}.*/`;
        expect(wrapper.vm.searchCriteria).toEqual(expected);
      });
    });

    describe('filters', () => {
      it('should return the correct filters', () => {
        expect(wrapper.vm.filters).toEqual({
          and: [
            {
              Metadata: {
                MemberMetadata: {
                  any: {
                    ...wrapper.vm.metadataFilters,
                  },
                },
              },
            },
            {
              Entity: {
                RegistrationNumber: wrapper.vm.criteria.registrationNumber,
              },
            },
          ],
        });
      });
    });

    describe('searchLoading', () => {
      it('returns the right value', (() => {
        expect(wrapper.vm.searchLoading).toEqual(wrapper.vm.$store.state.householdEntities.searchLoading);
      }));
    });

    describe('isSplitMode', () => {
      it('returns the right value', (() => {
        expect(wrapper.vm.isSplitMode).toEqual(wrapper.vm.$storage.registration.getters.isSplitMode());
      }));
    });
  });

  describe('Lifecycle', () => {
    describe('mounted', () => {
      it('sets results so we can come back on page with results', () => {
        jest.clearAllMocks();
        wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.$storage.household.getters.getAll).toHaveBeenCalledTimes(1);
      });

      it('calls filterOutSplittedHousehold if isSplitMode is true', () => {
        storage.registration.getters.isSplitMode = jest.fn(() => true);
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          mocks: {
            $storage: storage,
          },
        });
        jest.spyOn(wrapper.vm, 'filterOutSplittedHousehold').mockImplementation(() => {});
        wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.filterOutSplittedHousehold).toHaveBeenCalled();
      });
    });
  });
});
