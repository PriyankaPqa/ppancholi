import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockEventEntity } from '@libs/entities-lib/event';

import { useMockEventStore } from '@/pinia/event/event.mock';

import Component from '../components/EventExceptionalAuthenticationDialog.vue';

const localVue = createLocalVue();
const mockEvent = mockEventEntity();
mockEvent.exceptionalAuthenticationTypes[0].exceptionalAuthenticationTypeId = 'AA';

const { pinia, eventStore } = useMockEventStore();

describe('EventExceptionalAuthenticationDialog.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, otherOptions = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        event: mockEvent,
      },
      ...otherOptions,
    });
  };

  describe('lifecycle', () => {
    it('create sets items', () => {
      mountWrapper();
      expect(wrapper.vm.items).toEqual([{ option: wrapper.vm.sortedExceptionalAuth[0], selected: true, max: 2 }, { option: wrapper.vm.sortedExceptionalAuth[1], selected: false }]);
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      mountWrapper();
    });

    describe('sortedExceptionalAuth', () => {
      it('filters out the default items', async () => {
        mountWrapper();
        const data = wrapper.vm.sortedExceptionalAuth;
        expect(eventStore.getExceptionalAuthenticationTypes)
          .toHaveBeenCalledWith(true, wrapper.vm.event.exceptionalAuthenticationTypes.map((x) => x.exceptionalAuthenticationTypeId));
        expect(data.length).toEqual(eventStore.getExceptionalAuthenticationTypes().length - 2);
        expect(data.filter((x) => x.isDefault).length).toEqual(0);
      });
    });

    describe('staticExceptionalAuth', () => {
      it('filters out the default items', async () => {
        mountWrapper();
        const data = wrapper.vm.staticExceptionalAuth;
        expect(eventStore.getExceptionalAuthenticationTypes)
          .toHaveBeenCalledWith(true, wrapper.vm.event.exceptionalAuthenticationTypes.map((x) => x.exceptionalAuthenticationTypeId));
        expect(data.length).toEqual(2);
        expect(data.filter((x) => x.isDefault).length).toEqual(1);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      mountWrapper();
    });

    describe('onSubmit', () => {
      it('saves data', async () => {
        jest.clearAllMocks();
        const items = [{ selected: true, option: { id: 'someid' }, max: 3 }, { selected: false, option: { id: 'somesecondid' }, max: 5 }];
        await wrapper.setData({ items });
        await wrapper.vm.onSubmit();
        expect(eventStore.updateExceptionalAuthenticationType)
          .toHaveBeenCalledWith({ eventId: wrapper.vm.event.id, types: [{ exceptionalAuthenticationTypeId: 'someid', maxNumberOfUsages: 3 }] });
      });
    });
  });
});
