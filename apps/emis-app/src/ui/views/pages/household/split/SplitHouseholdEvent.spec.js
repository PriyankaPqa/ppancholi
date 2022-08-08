import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockEventEntityData, mockEventMainInfo } from '@libs/entities-lib/event';
import { mockStorage } from '@/store/storage';

import Component from './SplitHouseholdEvent.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('SplitHouseholdEvent', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
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
