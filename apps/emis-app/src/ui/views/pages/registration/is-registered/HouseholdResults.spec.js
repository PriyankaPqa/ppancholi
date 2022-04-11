import Vuetify from 'vuetify';
import { mockCombinedHouseholds } from '@libs/registration-lib/entities/household';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { mockStorage } from '@/store/storage';

import Component from '@/ui/views/pages/registration/is-registered/HouseholdResults.vue';

import { tabs } from '@/store/modules/registration/tabs';

const localVue = createLocalVue();

const storage = mockStorage();

const vuetify = new Vuetify();

const parsedHousehold = {
  primaryBeneficiary: {},
  additionalMembers: [],
  id: '1',
  eventIds: ['222'],
};

describe('HouseholdResults.vue', () => {
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

  describe('Methods', () => {
    describe('hasAdditionalMember', () => {
      it('should return true if additional member', () => {
        const household = {
          primaryBeneficiary: {},
          additionalMembers: [{}, {}],
          eventIds: ['1'],
        };
        expect(wrapper.vm.hasAdditionalMember(household)).toBe(true);
      });
      it('should return false if no additional member', () => {
        const household = {
          primaryBeneficiary: {},
          additionalMembers: [],
          eventIds: ['1'],
        };
        expect(wrapper.vm.hasAdditionalMember(household)).toBe(false);
      });
    });

    describe('isRegisteredInCurrentEvent', () => {
      it('should return true if household is registered for current event', () => {
        const currentEvent = wrapper.vm.$storage.registration.getters.event();
        const household = {
          primaryBeneficiary: {},
          eventIds: [currentEvent.id],
        };

        const res = wrapper.vm.isRegisteredInCurrentEvent(household);
        expect(res).toBe(true);
      });
      it('should return false if not', () => {
        const household = {
          primaryBeneficiary: {},
          eventIds: ['1'],
        };

        const res = wrapper.vm.isRegisteredInCurrentEvent(household);
        expect(res).toBe(false);
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
        expect(wrapper.vm.fetchHouseholdCreate).toHaveBeenLastCalledWith(parsedHousehold.id, null);
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
    describe('currentEventId', () => {
      it('should return id of the current event', () => {
        const currentEvent = wrapper.vm.$storage.registration.getters.event();
        expect(wrapper.vm.currentEventId)
          .toEqual(currentEvent.id);
      });
    });
  });
});
