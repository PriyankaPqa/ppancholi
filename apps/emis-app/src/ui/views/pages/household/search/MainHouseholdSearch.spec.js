import Vuetify from 'vuetify';

import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/storage';

import { useMockHouseholdStore } from '@/pinia/household/household.mock';
import Component from './MainHouseholdSearch.vue';

const localVue = createLocalVue();

const storage = mockStorage();

const vuetify = new Vuetify();

const { pinia, householdStore } = useMockHouseholdStore();

describe('MainHouseholdSearch.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();

    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      vuetify,
      mocks: {
        $storage: storage,
      },

    });
  });

  describe('template', () => {
    it('displays the search page if showResultPage is false', async () => {
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
      const searchPage = wrapper.findDataTest('household-search');
      const resultsPage = wrapper.findDataTest('household-results');
      expect(searchPage.exists()).toBeTruthy();
      expect(resultsPage.exists()).toBeFalsy();
    });

    it('displays the results page if showResultPage is true', async () => {
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
      const searchPage = wrapper.findDataTest('household-search');
      const resultsPage = wrapper.findDataTest('household-results');
      expect(searchPage.exists()).toBeFalsy();
      expect(resultsPage.exists()).toBeTruthy();
    });
  });

  describe('computed', () => {
    describe('showResultPage', () => {
      it('returns the right value', () => {
        householdStore.searchResultsShown = true;
        expect(wrapper.vm.showResultPage).toBeTruthy();
        householdStore.searchResultsShown = false;
        expect(wrapper.vm.showResultPage).toBeFalsy();
      });
    });
  });

  describe('methods', () => {
    describe('onSearch', () => {
      it('calls search and setSearchResultsShown', async () => {
        const criteria = { firstName: 'Joe', lastName: 'Black' };
        wrapper.vm.search = jest.fn();
        await wrapper.vm.onSearch(criteria);
        expect(wrapper.vm.search).toHaveBeenCalledWith(criteria);
        expect(householdStore.searchResultsShown).toEqual(true);
      });
    });

    describe('back', () => {
      it('sets setSearchResultsShown to false', async () => {
        await wrapper.vm.back();
        expect(householdStore.searchResultsShown).toEqual(false);
      });
    });
  });
});
