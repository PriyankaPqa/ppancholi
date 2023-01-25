import Vuetify from 'vuetify';
import { RcDialog } from '@libs/component-lib/components';
import { mockSplitHousehold } from '@libs/entities-lib/household-create';
import { mockCombinedHousehold } from '@libs/entities-lib/household';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { mockStorage } from '@/storage';
import HouseholdSearch from '@/ui/views/pages/household/search/HouseholdSearch.vue';
import HouseholdResults from '@/ui/views/pages/household/search/HouseholdResults.vue';

import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import Component from './IsRegistered.vue';

const localVue = createLocalVue();

const storage = mockStorage();

const vuetify = new Vuetify();

const { pinia, registrationStore } = useMockRegistrationStore();

describe('IsRegistered.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();

    storage.household.actions.fetch = jest.fn(() => mockCombinedHousehold());
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
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
          pinia,
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
        const households = [{ entity: { id: 'foo' } }];
        storage.household.getters.getAll = jest.fn(() => households);
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          vuetify,
          computed: {
            showResultPage: () => true,
          },
          mocks: {
            $storage: storage,
          },
        });
        const component = wrapper.findComponent(HouseholdResults);
        expect(component.props().items).toEqual(households);
      });
    });

    describe('Details dialog', () => {
      it('renders if showDetailsDialog is true', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
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
    describe('onSearch', () => {
      it('should call search method for the mixin', async () => {
        wrapper.vm.search = jest.fn();
        await wrapper.vm.onSearch(null);
        expect(wrapper.vm.search).toHaveBeenLastCalledWith(null);
      });

      it('should set householdResultsShown to false in registration store', async () => {
        registrationStore.householdResultsShown = false;
        await wrapper.vm.onSearch({});
        expect(registrationStore.householdResultsShown).toEqual(true);
      });

      it('should call setSearchResultsShown mutation with proper parameter', async () => {
        await wrapper.vm.onSearch({});
        expect(wrapper.vm.$storage.household.mutations.setSearchResultsShown).toHaveBeenCalledWith(false);
      });

      it('should call filterOutSplitHousehold if in split mode', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          vuetify,
          computed: {
            isSplitMode() {
              return true;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        jest.spyOn(wrapper.vm, 'filterOutSplitHousehold').mockImplementation(() => {});
        await wrapper.vm.onSearch({});
        expect(wrapper.vm.filterOutSplitHousehold).toHaveBeenCalled();
      });
    });

    describe('showDetails', () => {
      it('calls fetchCaseFilesInformation if isSplitMode is true', async () => {
        expect(wrapper.vm.showDetailsDialog).toBeFalsy();
        await wrapper.vm.showDetails('mock-id');
        expect(wrapper.vm.showDetailsDialog).toBeTruthy();
      });
    });

    describe('filterOutSplitHousehold', () => {
      it('removes the results with the id of the origin household for the split', async () => {
        storage.household.getters.getAll = jest.fn(() => [
          { entity: { id: mockSplitHousehold().originHouseholdId } },
          { entity: { id: 'foo' } },
        ]);
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          vuetify,
          mocks: {
            $storage: storage,
          },
        });
        registrationStore.splitHouseholdState = mockSplitHousehold();
        await wrapper.vm.filterOutSplitHousehold();
        expect(wrapper.vm.searchResults).toEqual([{ entity: { id: 'foo' } }]);
      });
    });
  });

  describe('Computed', () => {
    describe('isSplitMode', () => {
      it('returns the right value', (() => {
        expect(wrapper.vm.isSplitMode).toEqual(registrationStore.isSplitMode());
      }));
    });

    describe('enableAutocomplete', () => {
      it('return correct value', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          vuetify,
          mocks: {
            $storage: storage,
            $hasFeature: () => true,
          },
        });
        expect(wrapper.vm.enableAutocomplete).toBe(true);

        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          vuetify,
          mocks: {
            $storage: storage,
            $hasFeature: () => false,
          },
        });
        expect(wrapper.vm.enableAutocomplete).toBe(false);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('sets results so we can come back on page with results', () => {
        jest.clearAllMocks();
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.$storage.household.getters.getAll).toHaveBeenCalledTimes(1);
      });

      it('calls filterOutSplitHousehold if isSplitMode is true', () => {
        registrationStore.isSplitMode = jest.fn(() => true);
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          vuetify,
          mocks: {
            $storage: storage,
          },
        });
        jest.spyOn(wrapper.vm, 'filterOutSplitHousehold').mockImplementation(() => {});
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.filterOutSplitHousehold).toHaveBeenCalled();
      });
    });
  });
});
