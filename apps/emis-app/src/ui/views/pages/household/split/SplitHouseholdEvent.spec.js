import {
  createLocalVue, shallowMount, mount,
} from '@/test/testSetup';
import {
  mockEventMainInfo, mockEventEntityData,
} from '@libs/entities-lib/event';
import { mockStorage } from '@/storage';

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
        const event = mockEventEntityData()[0];
        await wrapper.vm.setEvent(event);
        expect(storage.registration.mutations.setEvent).toHaveBeenCalledWith(event);
      });

      it('should call setAssessmentToComplete mutations with proper params', async () => {
        const event = mockEventEntityData()[0];
        await wrapper.vm.setEvent(event);
        expect(wrapper.vm.$services.assessmentForms.get).toHaveBeenCalledWith({ id: event.registrationAssessments[0].assessmentId });
        expect(wrapper.vm.$storage.registration.mutations.setAssessmentToComplete).toHaveBeenCalledWith({
          assessmentForm: wrapper.vm.$services.assessmentForms.get(),
          registrationAssessment: event.registrationAssessments[0],
        });
      });
    });
  });
});
