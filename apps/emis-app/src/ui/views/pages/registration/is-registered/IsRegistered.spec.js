import Vuetify from 'vuetify';
import { RcDialog } from '@libs/component-lib/components';
import { mockSplitHousehold } from '@libs/entities-lib/household-create';
import { mockCombinedHousehold } from '@libs/entities-lib/household';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import HouseholdSearch from '@/ui/views/pages/household/search/HouseholdSearch.vue';
import HouseholdResults from '@/ui/views/pages/household/search/HouseholdResults.vue';

import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';

import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import Component from './IsRegistered.vue';

const localVue = createLocalVue();

const vuetify = new Vuetify();
const { pinia, householdStore } = useMockHouseholdStore();
const { registrationStore } = useMockRegistrationStore(pinia);

describe('IsRegistered.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      vuetify,
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

        });
        expect(wrapper.findComponent(HouseholdSearch).exists()).toBeFalsy();
        expect(wrapper.findComponent(HouseholdResults).exists()).toBeTruthy();
      });

      it('should pass searchResults as props', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          vuetify,
          computed: {
            showResultPage: () => true,
          },

        });
        await wrapper.setData({ searchResults: [mockCombinedHousehold()] });
        const component = wrapper.findComponent(HouseholdResults);
        expect(component.props().items).toEqual([mockCombinedHousehold()]);
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
        expect(householdStore.searchResultsShown).toEqual(false);
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
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          vuetify,

        });

        await wrapper.setData({
          searchResults: [
            { entity: { id: mockSplitHousehold().originHouseholdId } },
            { entity: { id: 'foo' } },
          ],
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
      it('return correct value', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          vuetify,
        });
        await wrapper.setFeature(FeatureKeys.AddressAutoFill, false);
        expect(wrapper.vm.enableAutocomplete).toBe(false);

        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          vuetify,
        });
        await wrapper.setFeature(FeatureKeys.AddressAutoFill, true);
        expect(wrapper.vm.enableAutocomplete).toBe(true);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('sets results so we can come back on page with results', () => {
        jest.clearAllMocks();
        wrapper.vm.combinedHouseholdStore.getByIds = jest.fn(() => []);
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.combinedHouseholdStore.getByIds).toHaveBeenCalledTimes(1);
      });

      it('calls filterOutSplitHousehold if isSplitMode is true', () => {
        registrationStore.isSplitMode = jest.fn(() => true);
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          vuetify,

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
