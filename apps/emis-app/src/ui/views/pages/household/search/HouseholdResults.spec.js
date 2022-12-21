import Vuetify from 'vuetify';
import { mockCombinedHouseholds, mockCombinedHousehold } from '@libs/entities-lib/household';
import _range from 'lodash/range';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { mockStorage } from '@/storage';

import Component from '@/ui/views/pages/household/search/HouseholdResults.vue';

import { tabs } from '@/store/modules/registration/tabs';

const localVue = createLocalVue();

const storage = mockStorage();

const vuetify = new Vuetify();

const parsedHousehold = {
  primaryBeneficiary: {},
  additionalMembers: [],
  id: '1',
};

describe('HouseholdResultsMove.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      propsData: {
        items: mockCombinedHouseholds(),
        isSplitMode: false,
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Lifecycle', () => {
    describe('mounted', () => {
      it('calls getCaseFilesInEvent', () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            items: mockCombinedHouseholds(),
            isSplitMode: false,
            hideEventInfo: false,
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.getCaseFilesInEvent = jest.fn();
        wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.getCaseFilesInEvent).toHaveBeenCalled();
      });

      it('does not call getCaseFilesInEvent if is split mode', () => {
        jest.clearAllMocks();
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            items: mockCombinedHouseholds(),
            isSplitMode: true,
            hideEventInfo: false,
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.getCaseFilesInEvent = jest.fn();
        wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.getCaseFilesInEvent).not.toHaveBeenCalled();
      });

      it('does not call getCaseFilesInEvent if hideEventInfo is true', () => {
        jest.clearAllMocks();
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            items: mockCombinedHouseholds(),
            isSplitMode: false,
            hideEventInfo: true,
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.getCaseFilesInEvent = jest.fn();
        wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.getCaseFilesInEvent).not.toHaveBeenCalled();
      });
    });
  });

  describe('Methods', () => {
    describe('isRegisteredInCurrentEvent', () => {
      it('should return  true if the household passed is part of householdsInEvent', async () => {
        await wrapper.setData({ householdsInEvent: ['household-id'] });
        expect(wrapper.vm.isRegisteredInCurrentEvent('household-id')).toEqual(true);
      });
      it('should return  false if the household passed is not part of householdsInEvent', async () => {
        await wrapper.setData({ householdsInEvent: ['household-id'] });
        expect(wrapper.vm.isRegisteredInCurrentEvent('not-household-id')).toEqual(false);
      });
    });

    describe('getCaseFilesInEvent', () => {
      it('calls casefile search with the right filter', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            items: [mockCombinedHousehold({ id: 'mock-id-1' }), mockCombinedHousehold({ id: 'mock-id-2' })],
            isSplitMode: false,
          },
          computed: {
            currentEventId() {
              return 'event-id';
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.$storage.caseFile.actions.search = jest.fn(() => ({ ids: ['id-1', 'id-2'] }));
        wrapper.vm.getCaseFilesInEvent();

        expect(wrapper.vm.$storage.caseFile.actions.search)
          .toHaveBeenCalledWith({ filter: "search.in(Entity/HouseholdId, 'mock-id-1|mock-id-2', '|') and Entity/EventId eq 'event-id'" });
      });

      it('calls casefile search multiple times if there are more than 20 household ids', async () => {
        const range = _range(41);
        const households = range.map((i) => mockCombinedHousehold({ id: i }));

        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            items: households,
            isSplitMode: false,
          },
          computed: {
            currentEventId() {
              return 'event-id';
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.$storage.caseFile.actions.search = jest.fn(() => ({ ids: ['id-1', 'id-2'] }));
        wrapper.vm.getCaseFilesInEvent();

        expect(wrapper.vm.$storage.caseFile.actions.search)
          .toHaveBeenCalledTimes(3);
      });

      it('calls the casefile getter and saves the household ids of the returned casefiles into householdsInEvent', async () => {
        const caseFiles = [{ entity: { householdId: 'h-id-1' } }, { entity: { householdId: 'h-id-2' } }];
        wrapper.vm.$storage.caseFile.actions.search = jest.fn(() => ({ ids: ['id-1', 'id-2'] }));
        wrapper.vm.$storage.caseFile.getters.getByIds = jest.fn(() => caseFiles);

        await wrapper.vm.getCaseFilesInEvent();
        expect(wrapper.vm.$storage.caseFile.getters.getByIds).toHaveBeenCalledWith(['id-1', 'id-2']);
        expect(wrapper.vm.householdsInEvent).toEqual(['h-id-1', 'h-id-2']);
      });
    });

    describe('hasAdditionalMember', () => {
      it('should return true if additional member', () => {
        const household = {
          primaryBeneficiary: {},
          additionalMembers: [{}, {}],
        };
        expect(wrapper.vm.hasAdditionalMember(household)).toBe(true);
      });
      it('should return false if no additional member', () => {
        const household = {
          primaryBeneficiary: {},
          additionalMembers: [],
        };
        expect(wrapper.vm.hasAdditionalMember(household)).toBe(false);
      });
    });

    describe('viewDetails', () => {
      it('should set detailsId to current household id for loading button', async () => {
        expect(wrapper.vm.detailsId).toEqual('');
        await wrapper.vm.viewDetails(parsedHousehold);
        expect(wrapper.vm.detailsId).toEqual(parsedHousehold.id);
      });

      it('should call fetchHouseholdCreate method with id as param', async () => {
        wrapper.vm.fetchHouseholdCreate = jest.fn();
        await wrapper.vm.viewDetails(parsedHousehold);
        expect(wrapper.vm.fetchHouseholdCreate).toHaveBeenLastCalledWith(parsedHousehold.id);
      });

      it('should save the parsed household in the store', async () => {
        wrapper.vm.fetchHouseholdCreate = jest.fn(() => ({}));
        await wrapper.vm.viewDetails(parsedHousehold);
        expect(wrapper.vm.$storage.registration.mutations.setHouseholdCreate).toHaveBeenLastCalledWith({});
      });

      describe('not split more', () => {
        it('should set association mode to true', async () => {
          await wrapper.vm.viewDetails(parsedHousehold);
          expect(wrapper.vm.$storage.registration.mutations.setHouseholdAssociationMode).toHaveBeenLastCalledWith(true);
        });

        it('should set already registered to correct value', async () => {
          wrapper.vm.isRegisteredInCurrentEvent = jest.fn(() => true);
          await wrapper.vm.viewDetails(parsedHousehold);
          expect(wrapper.vm.$storage.registration.mutations.setHouseholdAlreadyRegistered).toHaveBeenLastCalledWith(true);
        });

        it('should set currentTab to review ', async () => {
          wrapper.vm.isRegisteredInCurrentEvent = jest.fn(() => true);
          await wrapper.vm.viewDetails(parsedHousehold);
          expect(wrapper.vm.$storage.registration.mutations.setCurrentTabIndex).toHaveBeenLastCalledWith(tabs().findIndex((t) => t.id === 'review'));
        });
      });

      describe('in split mode', () => {
        it('emits showDetails, with the household id as parameter', async () => {
          wrapper = shallowMount(Component, {
            localVue,
            vuetify,
            propsData: {
              items: mockCombinedHouseholds(),
              isSplitMode: true,
            },
            mocks: {
              $storage: storage,
            },
          });
          await wrapper.vm.viewDetails(parsedHousehold);
          expect(wrapper.emitted('showDetails')[0][0]).toEqual(parsedHousehold.id);
        });
      });
    });
  });

  describe('Computed', () => {
    describe('isRegisteredInCurrentEvent', () => {
      it('should return a function that returns true if the household passed is part of householdsInEvent', async () => {
        await wrapper.setData({ householdsInEvent: ['household-id'] });
        const fn = wrapper.vm.isRegisteredInCurrentEvent;
        expect(fn('household-id')).toEqual(true);
      });

      it('should return a function that returns false if the household passed is not part of householdsInEvent', async () => {
        await wrapper.setData({ householdsInEvent: ['household-id'] });
        const fn = wrapper.vm.isRegisteredInCurrentEvent;
        expect(fn('not-household-id')).toEqual(false);
      });
    });

    describe('currentEventId', () => {
      it('should return id of the current event', () => {
        const currentEvent = wrapper.vm.$storage.registration.getters.event();
        expect(wrapper.vm.currentEventId)
          .toEqual(currentEvent.id);
      });
    });
  });
});
