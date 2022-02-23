/**
 * @group ui/components/registration
 */
import Vuetify from 'vuetify';
import { RcDialog } from '@crctech/component-library';
import { mockSplitHousehold } from '@libs/registration-lib/entities/household-create';
import { mockCombinedHousehold } from '@libs/registration-lib/entities/household';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import HouseholdSearch from '@/ui/views/pages/registration/is-registered/HouseholdSearch.vue';
import HouseholdResults from '@/ui/views/pages/registration/is-registered/HouseholdResults.vue';

import { mockStorage } from '@/store/storage';

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
    describe('onSearch', () => {
      it('should call search method for the mixin', async () => {
        wrapper.vm.search = jest.fn();
        await wrapper.vm.onSearch(null);
        expect(wrapper.vm.search).toHaveBeenLastCalledWith(null);
      });

      it('should call setHouseholdResultsShown mutation with proper parameter', async () => {
        await wrapper.vm.onSearch({});
        expect(wrapper.vm.$storage.registration.mutations.setHouseholdResultsShown).toHaveBeenCalledWith(true);
      });

      it('should call filterOutSplitHousehold if in split mode', async () => {
        wrapper = shallowMount(Component, {
          localVue,
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

    describe('filterOutSplitHousehold', () => {
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

        await wrapper.vm.filterOutSplitHousehold();
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
    describe('isSplitMode', () => {
      it('returns the right value', (() => {
        expect(wrapper.vm.isSplitMode).toEqual(wrapper.vm.$storage.registration.getters.isSplitMode());
      }));
    });

    describe('enableAutocomplete', () => {
      it('return correct value', () => {
        storage.tenantSettings.getters.isFeatureEnabled.mockReturnValueOnce(true);
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.enableAutocomplete).toBe(true);

        storage.tenantSettings.getters.isFeatureEnabled.mockReturnValueOnce(false);
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.enableAutocomplete).toBe(false);
      });
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

      it('calls filterOutSplitHousehold if isSplitMode is true', () => {
        storage.registration.getters.isSplitMode = jest.fn(() => true);
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          mocks: {
            $storage: storage,
          },
        });
        jest.spyOn(wrapper.vm, 'filterOutSplitHousehold').mockImplementation(() => {});
        wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.filterOutSplitHousehold).toHaveBeenCalled();
      });
    });
  });
});
