import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { Event, mockEventsSearchData } from '@/entities/event';
import helpers from '@/ui/helpers';
import { ECanadaProvinces } from '@/types';

import Component from '../components/EventLocationSection.vue';

const localVue = createLocalVue();

const mockEvent = new Event(mockEventsSearchData()[0]);

describe('EventLocationSection.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          locations: mockEvent.registrationLocations,
        },
      });
    });

    it('renders when the event has registration locations', () => {
      const locations = wrapper.findAll('tr');

      expect(locations.length).toBe(mockEvent.registrationLocations.length);
      expect(wrapper.findDataTest('event-location-section-container').exists()).toBe(true);
    });

    it('does not render when the event has no locations', () => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          locations: [],
        },
      });

      const locations = wrapper.findAll('tr');

      expect(locations.length).toBe(0);
      expect(wrapper.findDataTest('event-location-section-container').exists()).toBe(false);
    });

    describe('location name', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-location-section-name-0');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right name', () => {
        const element = wrapper.findDataTest('event-location-section-name-0');
        expect(element.text()).toEqual(wrapper.vm.locations[0].name.translation.en);
      });
    });

    describe('location status-chip', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-location-section-status-0');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right status', () => {
        const element = wrapper.findDataTest('event-location-section-status-0');
        expect(element.props().status).toEqual(wrapper.vm.locations[0].status);
      });
    });

    describe('location address', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-location-section-address-0');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('edit button', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-location-section-edit-0');
        expect(element.exists()).toBeTruthy();
      });

      it('emits submit, with the right data if form is valid', async () => {
        const element = wrapper.findDataTest('event-location-section-edit-0');

        await element.vm.$emit('click');
        expect(wrapper.emitted('edit')[0][0]).toEqual(wrapper.vm.locations[0].name.translation.en);
      });
    });
  });

  describe('computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          locations: mockEvent.registrationLocations,
        },
      });
    });

    describe('sortedLocations', () => {
      it('return the locations sorted by name', () => {
        expect(wrapper.vm.sortedLocations).toEqual(helpers.sortMultilingualArray(wrapper.vm.locations, 'name'));
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          locations: mockEvent.registrationLocations,
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
