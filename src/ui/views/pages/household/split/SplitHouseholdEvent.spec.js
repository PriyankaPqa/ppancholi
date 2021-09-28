import { createLocalVue, shallowMount } from '@/test/testSetup';
import { EEventStatus } from '@/entities/event';

import Component from './SplitHouseholdEvent.vue';

const localVue = createLocalVue();

describe('SplitHouseholdEvent', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
      });
    });

    describe('event select', () => {
      it('renders the component', () => {
        const element = wrapper.findDataTest('household_profile_split_event_select');
        expect(element.exists()).toBeTruthy();
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call fetchActiveEvents', async () => {
        wrapper = shallowMount(Component, {
          localVue,
        });
        wrapper.vm.fetchActiveEvents = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.fetchActiveEvents).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
      });
    });

    describe('fetchActiveEvents', () => {
      it('should fetch the proper events', () => {
        wrapper.vm.fetchActiveEvents();
        expect(wrapper.vm.$services.events.searchMyEvents).toHaveBeenCalledWith({
          filter: { Entity: { Schedule: { Status: EEventStatus.Open } } },
          top: 999,
        });
      });

      it('maps the response into events', async () => {
        const events = [{ entity: { id: 'id 1', name: { translation: { en: 'name 1' } } } },
          { entity: { id: 'id 2', name: { translation: { en: 'name 2' } } } }];
        wrapper.vm.$services.events.searchMyEvents = jest.fn(() => ({ value: events }));

        await wrapper.vm.fetchActiveEvents();
        expect(wrapper.vm.events).toEqual(events);
      });
    });
  });
});
