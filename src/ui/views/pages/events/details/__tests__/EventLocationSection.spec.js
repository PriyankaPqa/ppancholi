/**
 * @group ui/components/events
 */

import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockEventEntity } from '@/entities/event';
import { ECanadaProvinces } from '@/types';

import Component from '../components/EventLocationSection.vue';

const localVue = createLocalVue();

const mockEvent = mockEventEntity();

describe('EventLocationSection.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          location: mockEvent.registrationLocations[0],
          index: 0,
          dataTestPrefix: 'registration',
          canEdit: true,
        },
      });
    });

    describe('location name', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-registration-location-section-name-0');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right name', () => {
        const element = wrapper.findDataTest('event-registration-location-section-name-0');
        expect(element.text()).toEqual(wrapper.vm.location.name.translation.en);
      });
    });

    describe('location status-chip', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-registration-location-section-status-0');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right status', () => {
        const element = wrapper.findDataTest('event-registration-location-section-status-0');
        expect(element.props().status).toEqual(wrapper.vm.location.status);
      });
    });

    describe('location address', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-registration-location-section-address-0');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('edit button', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-registration-location-section-edit-0');
        expect(element.exists()).toBeTruthy();
      });

      it('does not render if canEdit is false', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            location: mockEvent.registrationLocations[0],
            index: 0,
            dataTestPrefix: 'registration',
            canEdit: false,
          },
        });

        const element = wrapper.findDataTest('event-registration-location-section-edit-0');
        expect(element.exists()).toBeFalsy();
      });

      it('emits submit, with the right data if form is valid', async () => {
        const element = wrapper.findDataTest('event-registration-location-section-edit-0');

        await element.vm.$emit('click');
        expect(wrapper.emitted('edit')[0][0]).toEqual(wrapper.vm.location.id);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          location: mockEvent.registrationLocations[0],
          index: 0,
          dataTestPrefix: 'registration',
          canEdit: true,
        },
      });
    });

    describe('getAddress', () => {
      it('concatenates address correctly', async () => {
        const location = {
          address: {
            country: 'CA',
            province: ECanadaProvinces.QC,
            city: 'Montreal',
            streetAddress: 'street',
            postalCode: 'h1k1k1',
          },
        };
        expect(wrapper.vm.getAddress(location)).toBe('street Montreal, QC, h1k1k1, CA');
      });
    });
  });
});
