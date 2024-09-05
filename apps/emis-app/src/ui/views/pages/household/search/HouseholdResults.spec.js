import Vuetify from 'vuetify';
import { mockHouseholdEntity, HouseholdStatus } from '@libs/entities-lib/household';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';
import helpers from '@libs/shared-lib/helpers/helpers';
import Component from '@/ui/views/pages/household/search/HouseholdResults.vue';

import { tabs } from '@/pinia/registration/tabs';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { mockMember } from '@libs/entities-lib/value-objects/member';
import { ECurrentAddressTypes, mockHouseholdCreateData } from '@libs/entities-lib/household-create';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';

helpers.callSearchInInBatches = jest.fn(() => ({ ids: ['id-1', 'id-2'] }));
const localVue = createLocalVue();

const vuetify = new Vuetify();

const { pinia, registrationStore } = useMockRegistrationStore();
useMockHouseholdStore(pinia);

const parsedHousehold = {
  householdStatus: HouseholdStatus.Open,
  id: 'mock-id-1',
  primaryBeneficiary: { ...mockMember(), id: 'mock-person-id-1' },
  additionalMembers: [mockMember({ id: 'mock-person-id-2' })],
};

describe('HouseholdResults.vue', () => {
  let wrapper;

  const doMount = async (featureList = []) => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      vuetify,
      featureList,
      propsData: {
        items: [mockHouseholdEntity({ id: '1' }), mockHouseholdEntity({ id: '2' })],
        isSplitMode: false,
      },
    });
    wrapper.vm.buildHouseholdCreateData = jest.fn();
  };

  beforeEach(async () => {
    await doMount();
  });

  describe('Lifecycle', () => {
    describe('mounted', () => {
      it('calls getCaseFilesInEvent', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          vuetify,
          propsData: {
            items: [mockHouseholdEntity({ id: '1' }), mockHouseholdEntity({ id: '2' })],
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
            items: [mockHouseholdEntity({ id: '1' }), mockHouseholdEntity({ id: '2' })],
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
            items: [mockHouseholdEntity({ id: '1' }), mockHouseholdEntity({ id: '2' })],
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
      // cant get this one to work... javascript heap error...
      // it('calls helper callSearchInInBatches  with the right payload', async () => {
      //   wrapper = shallowMount(Component, {
      //     localVue,
      //     pinia,
      //     vuetify,
      //     propsData: {
      //       items: [mockHouseholdEntity({ id: 'mock-id-1' }), mockHouseholdEntity({ id: 'mock-id-2' })],
      //       isSplitMode: false,
      //     },
      //     computed: {
      //       currentEventId() {
      //         return 'event-id';
      //       },
      //     },
      //   });
      //   await wrapper.vm.getCaseFilesInEvent();

      //   expect(helpers.callSearchInInBatches)
      //     .toHaveBeenCalledWith({
      //       ids: ['mock-id-1', 'mock-id-2'],
      //       service: wrapper.vm.combinedCaseFileStore,
      //       searchInFilter: "search.in(Entity/HouseholdId, '{ids}')",
      //       otherFilter: "Entity/EventId eq 'event-id'",
      //       otherApiParameters: [null, false, true],
      //     });
      // });

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
      it('resets all current addresses to unknown if flag is on', async () => {
        let householdCreate = null;
        wrapper.vm.fetchHouseholdCreate = jest.fn(() => mockHouseholdCreateData());
        registrationStore.setHouseholdCreate = jest.fn((h) => {
          householdCreate = h;
        });
        await wrapper.vm.viewDetails(parsedHousehold);
        expect(householdCreate.primaryBeneficiary.currentAddress.addressType).not.toEqual(ECurrentAddressTypes.Unknown);
        expect(householdCreate.additionalMembers[0].currentAddress.addressType).not.toEqual(ECurrentAddressTypes.Unknown);

        await doMount([wrapper.vm.$featureKeys.CaseFileIndividual]);
        wrapper.vm.fetchHouseholdCreate = jest.fn(() => mockHouseholdCreateData());
        await wrapper.vm.viewDetails(parsedHousehold);
        expect(householdCreate.primaryBeneficiary.currentAddress.addressType).toEqual(ECurrentAddressTypes.Unknown);
        expect(householdCreate.additionalMembers[0].currentAddress.addressType).toEqual(ECurrentAddressTypes.Unknown);
      });

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
              items: [mockHouseholdEntity({ id: '1' }), mockHouseholdEntity({ id: '2' })],
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
              items: [mockHouseholdEntity({ id: '1' }), mockHouseholdEntity({ id: '2' })],
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

        it('should return false when household status is Open', () => {
          wrapper = shallowMount(Component, {
            localVue,
            pinia,
            vuetify,
            propsData: {
              items: [mockHouseholdEntity({ id: '1' }), mockHouseholdEntity({ id: '2' })],
              isSplitMode: true,
            },
            data() {
              return {
                loading: false,
              };
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
