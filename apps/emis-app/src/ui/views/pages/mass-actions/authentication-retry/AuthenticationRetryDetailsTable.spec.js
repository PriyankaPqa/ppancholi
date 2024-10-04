import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockCombinedMassAction, mockMassActionEntity, AuthenticationTier } from '@libs/entities-lib/mass-action';
import { mockEventEntity } from '@libs/entities-lib/event';
import { useMockEventStore } from '@/pinia/event/event.mock';

import Component from './AuthenticationRetryDetailsTable.vue';

const localVue = createLocalVue();

const { pinia, eventStore } = useMockEventStore();

describe('AuthenticationRetryDetailsTable.vue', () => {
  let wrapper;

  const doMount = (shallow, otherData) => {
    const massAction = mockMassActionEntity();
    massAction.details.tier = AuthenticationTier.Tier1;
    const options = {
      localVue,
      pinia,
      propsData: {
        massAction,
      },
      data() {
        return {
          ...otherData,
        };
      },
    };
    if (shallow === true) {
      wrapper = shallowMount(Component, options);
    } else {
      wrapper = mount(Component, options);
    }
  };

  describe('Computed', () => {
    beforeEach(() => {
      doMount(true, {
        event: mockEventEntity(),
      });
    });
    describe('rows', () => {
      it('should return proper rows', () => {
        expect(wrapper.vm.rows).toEqual([
          {
            label: 'massActions.authenticationRetry.create.event.label',
            value: mockEventEntity().name.translation.en,
            dataTest: 'event',
            loading: wrapper.vm.eventLoading,
          },
          {
            label: 'massActions.authenticationRetry.create.authenticationTier.label',
            value: 'enums.authenticationTier.Tier1',
            dataTest: 'authenticationTier',
          },
        ]);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      doMount(true);
    });
    describe('fetchEvent', () => {
      it('should fetch the event', async () => {
        const id = mockCombinedMassAction().entity.details.eventId;
        await wrapper.vm.fetchEvent();
        expect(eventStore.fetch).toHaveBeenCalledWith(id);
      });
    });
  });

  describe('Lifecycle', () => {
    beforeEach(() => {
      doMount(true);
    });
    describe('created', () => {
      it('fetches all data', async () => {
        jest.clearAllMocks();
        wrapper.vm.fetchEvent = jest.fn();

        await wrapper.vm.$options.created[0].call(wrapper.vm);

        expect(wrapper.vm.fetchEvent).toHaveBeenCalledTimes(1);
      });
    });
  });
});
