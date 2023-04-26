import Vuetify from 'vuetify';
import { mockCombinedHouseholds, mockCombinedHousehold, mockHouseholdMemberMetadata, HouseholdStatus } from '@libs/entities-lib/household';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';
import helpers from '@libs/shared-lib/helpers/helpers';
import Component from '@/ui/views/pages/household/search/HouseholdResults.vue';

import { tabs } from '@/pinia/registration/tabs';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { mockMember } from '@libs/entities-lib/value-objects/member';

const localVue = createLocalVue();

const vuetify = new Vuetify();

const { pinia, registrationStore } = useMockRegistrationStore();

const parsedHousehold = {
  ...mockHouseholdMemberMetadata(),
  id: 'mock-id-1',
  primaryBeneficiary: { ...mockMember(), id: 'mock-person-id-1', householdStatus: HouseholdStatus.Open },
  additionalMembers: [mockMember({ id: 'mock-person-id-2' })],
};

describe('HouseholdResultsMove.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      vuetify,
      propsData: {
        items: mockCombinedHouseholds(),
        isSplitMode: false,
      },
    });
    wrapper.vm.buildHouseholdCreateData = jest.fn();
  });

  describe('Lifecycle', () => {
    describe('mounted', () => {
      it('calls getCaseFilesInEvent', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          vuetify,
          propsData: {
            items: mockCombinedHouseholds(),
            isSplitMode: false,
            hideEventInfo: false,
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
          pinia,
          vuetify,
          propsData: {
            items: mockCombinedHouseholds(),
            isSplitMode: true,
            hideEventInfo: false,
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
          pinia,
          vuetify,
          propsData: {
            items: mockCombinedHouseholds(),
            isSplitMode: false,
            hideEventInfo: true,
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
      it('calls helper callSearchInInBatches  with the right payload', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
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

        });
        helpers.callSearchInInBatches = jest.fn(() => ({ ids: ['id-1', 'id-2'] }));
        await wrapper.vm.getCaseFilesInEvent();

        expect(helpers.callSearchInInBatches)
          .toHaveBeenCalledWith({
            ids: ['mock-id-1', 'mock-id-2'],
            service: wrapper.vm.combinedCaseFileStore,
            searchInFilter: "search.in(Entity/HouseholdId, '{ids}')",
            otherFilter: "Entity/EventId eq 'event-id'",
          });
      });

      it('calls the casefile getter and saves the household ids of the returned casefiles into householdsInEvent', async () => {
        const caseFiles = [{ entity: { householdId: 'h-id-1' } }, { entity: { householdId: 'h-id-2' } }];
        helpers.callSearchInInBatches = jest.fn(() => ({ ids: ['id-1', 'id-2'] }));
        wrapper.vm.combinedCaseFileStore.getByIds = jest.fn(() => caseFiles);

        await wrapper.vm.getCaseFilesInEvent();
        expect(wrapper.vm.combinedCaseFileStore.getByIds).toHaveBeenCalledWith(['id-1', 'id-2']);
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
        expect(registrationStore.setHouseholdCreate).toHaveBeenLastCalledWith({});
      });

      describe('not split more', () => {
        it('should set association mode to true', async () => {
          await wrapper.vm.viewDetails(parsedHousehold);
          expect(registrationStore.householdAssociationMode).toEqual(true);
        });

        it('should set already registered to correct value', async () => {
          wrapper.vm.isRegisteredInCurrentEvent = jest.fn(() => true);
          await wrapper.vm.viewDetails(parsedHousehold);
          expect(registrationStore.householdAlreadyRegistered).toEqual(true);
        });

        it('should set currentTab to review ', async () => {
          wrapper.vm.isRegisteredInCurrentEvent = jest.fn(() => true);
          await wrapper.vm.viewDetails(parsedHousehold);
          expect(registrationStore.currentTabIndex).toEqual(tabs().findIndex((t) => t.id === 'review'));
        });
      });

      describe('in split mode', () => {
        it('emits showDetails, with the household id as parameter', async () => {
          wrapper = shallowMount(Component, {
            localVue,
            pinia,
            vuetify,
            propsData: {
              items: mockCombinedHouseholds(),
              isSplitMode: true,
            },
          });
          wrapper.vm.buildHouseholdCreateData = jest.fn();
          await wrapper.vm.viewDetails(parsedHousehold);
          expect(wrapper.emitted('showDetails')[0][0]).toEqual(parsedHousehold.id);
        });
      });

      describe('detailsButtonDisabled', () => {
        it('should return true when it is loading', () => {
          wrapper = shallowMount(Component, {
            localVue,
            pinia,
            vuetify,
            propsData: {
              items: mockCombinedHouseholds(),
              isSplitMode: true,
            },
            data() {
              return {
                loading: true,
              };
            },
          });
          expect(wrapper.vm.detailsButtonDisabled(null)).toEqual(true);
        });

        it('should return false when household status is Open and has Feature', () => {
          wrapper = shallowMount(Component, {
            localVue,
            pinia,
            vuetify,
            propsData: {
              items: mockCombinedHouseholds(),
              isSplitMode: true,
            },
            data() {
              return {
                loading: false,
              };
            },
            computed: {
              hasFeatureHouseholdStatus: () => true,
            },
          });
          expect(wrapper.vm.detailsButtonDisabled(parsedHousehold)).toEqual(false);
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
        const currentEvent = registrationStore.getEvent();
        expect(wrapper.vm.currentEventId)
          .toEqual(currentEvent.id);
      });
    });
  });
});
