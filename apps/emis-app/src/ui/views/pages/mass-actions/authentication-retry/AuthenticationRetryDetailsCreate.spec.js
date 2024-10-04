import { mockEventSummary } from '@libs/entities-lib/event/event.mock';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';


import { mockProvider } from '@/services/provider';
import { AuthenticationTier } from '@libs/entities-lib/mass-action';
import Component from './AuthenticationRetryDetailsCreate.vue';

const formCopy = {
  event: mockEventSummary(),
  tier: AuthenticationTier.Tier1
};

const localVue = createLocalVue();
const services = mockProvider();

describe('AuthenticationRetryDetailsCreate.vue', () => {
  let wrapper;

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          form: formCopy,
        },
        mocks: {
          $services: services,
        },
      });
    });

    describe('rules', () => {
      it('should return proper rules', () => {
        expect(wrapper.vm.rules)
          .toEqual({
            event: {
              required: true,
            },
            tier: {
              required: true,
            },
          });
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          form: formCopy,
        },
        mocks: {
          $services: services,
        },
      });
    });

    describe('onClearEvent', () => {
      it('should call onSetEvent with null', () => {
        wrapper.vm.onSetEvent = jest.fn();
        wrapper.vm.onClearEvent();
        expect(wrapper.vm.onSetEvent).toHaveBeenLastCalledWith(null);
      });
    });

    describe('onSetEvent', () => {
      it('should set the event and reset other fields', async () => {
        await wrapper.vm.onSetEvent(mockEventSummary());
        expect(wrapper.vm.formCopy).toEqual({ ...formCopy });
      });
    });
  });

  describe('Watch', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          form: formCopy,
        },

      });
      wrapper.vm.onSetEvent = jest.fn();
    });

    describe('formCopy', () => {
      it('should emit update event with proper params', () => {
        expect(wrapper.emitted('update')[0][0]).toEqual(wrapper.vm.formCopy);
      });
    });

    describe('formCopy.event', () => {
      it('should call onSetEvent with proper param ', async () => {
        expect(wrapper.vm.onSetEvent).toHaveBeenLastCalledWith(wrapper.vm.formCopy.event);
      });
    });
  });
});
