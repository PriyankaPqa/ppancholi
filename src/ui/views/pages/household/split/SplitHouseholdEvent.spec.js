import { createLocalVue, shallowMount } from '@/test/testSetup';
import { EEventStatus, mockEventEntityData, mockEventMainInfo } from '@/entities/event';
import { mockStorage } from '@/store/storage';

import Component from './SplitHouseholdEvent.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('SplitHouseholdEvent', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: { $storage: storage },
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
          mocks: { $storage: storage },
        });
        wrapper.vm.fetchActiveEvents = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.fetchActiveEvents).toHaveBeenCalledTimes(1);
      });

      it('should set event to the value in the store', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: { $storage: storage },
          store: {
            modules: {
              registration: {
                state: {
                  event: mockEventMainInfo().entity,
                },
              },
            },
          },
        });
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.event).toEqual(mockEventMainInfo().entity);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: { $storage: storage },
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
        expect(wrapper.vm.events).toEqual(events.map((e) => e.entity));
      });
    });

    describe('setEvent', () => {
      it('calls the storage mutation setEvent', async () => {
        jest.clearAllMocks();
        const event = mockEventEntityData();
        await wrapper.vm.setEvent(event);
        expect(storage.registration.mutations.setEvent).toHaveBeenCalledWith(event);
      });
    });
  });
});
