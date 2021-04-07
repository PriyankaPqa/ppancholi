import { createLocalVue, shallowMount } from '@/test/testSetup';
import { Event, mockEventsSearchData } from '@/entities/event';
import helpers from '@/ui/helpers';
import { ECanadaProvinces } from '@/types';

import Component from '../components/EventLocationSection.vue';

const localVue = createLocalVue();

const mockEvent = new Event(mockEventsSearchData()[0]);

describe('EventLocationSection.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        locations: mockEvent.registrationLocations,
        dataTestPrefix: 'registration',
      },
      computed: {
        sortedLocations() {
          return mockEvent.registrationLocations;
        },
      },
    });
  });

  describe('Template', () => {
    it('table renders when the event has registration locations', () => {
      expect(wrapper.find('table').exists()).toBeTruthy();

      const locations = wrapper.findAll('tr');
      expect(locations.length).toBe(mockEvent.registrationLocations.length);
    });

    it('does not render when the event has no locations', () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          locations: [],
          dataTestPrefix: 'registration',
        },
      });

      expect(wrapper.find('table').exists()).toBeFalsy();
    });

    describe('location name', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-registration-location-section-name-0');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right name', () => {
        const element = wrapper.findDataTest('event-registration-location-section-name-0');
        expect(element.text()).toEqual(wrapper.vm.locations[0].name.translation.en);
      });
    });

    describe('location status-chip', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-registration-location-section-status-0');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right status', () => {
        const element = wrapper.findDataTest('event-registration-location-section-status-0');
        expect(element.props().status).toEqual(wrapper.vm.locations[0].status);
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

      it('emits submit, with the right data if form is valid', async () => {
        const element = wrapper.findDataTest('event-registration-location-section-edit-0');

        await element.vm.$emit('click');
        expect(wrapper.emitted('edit')[0][0]).toEqual(wrapper.vm.locations[0].name.translation.en);
      });
    });
  });

  describe('computed', () => {
    describe('sortedLocations', () => {
      it('return the locations sorted by name', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            locations: mockEvent.registrationLocations,
            dataTestPrefix: 'registration',
          },
        });

        expect(wrapper.vm.sortedLocations).toEqual(helpers.sortMultilingualArray(wrapper.vm.locations, 'name'));
      });
    });
  });

  describe('Methods', () => {
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
