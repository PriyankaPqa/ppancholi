import Vuetify from 'vuetify';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockAddress } from '@crctech/registration-lib/src/entities/beneficiary';
import Component from './HomeAddressTemplate.vue';

const localVue = createLocalVue();

describe('HomeAddressTemplate.vue', () => {
  let wrapper;

  beforeEach(async () => {
    const vuetify = new Vuetify();
    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      propsData: {
        address: mockAddress(),
      },
    });
  });

  describe('Template', () => {
    it('should display the street without unit', () => {
      const el = wrapper.findDataTest('homeAddress__street');
      expect(el.text()).toBe('247 Some Street');
    });

    it('should display the street with unit', async () => {
      await wrapper.setProps({
        address: mockAddress({ unitSuite: '123' }),
      });
      const el = wrapper.findDataTest('homeAddress__street');
      expect(el.text()).toBe('247 Some Street #123');
    });

    it('should display the city, province and postal code', async () => {
      const el = wrapper.findDataTest('homeAddress__line');
      expect(el.text()).toBe('Ottawa, ON, K1W 1G7');
    });

    it('should display the country', async () => {
      const el = wrapper.findDataTest('homeAddress__country');
      expect(el.text()).toBe('CA');
    });

    it('should display no fixed home if selected', () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          address: mockAddress(),
        },
        store: {
          modules: {
            beneficiary: {
              state: {
                beneficiary: {
                  noFixedHome: true,
                },
              },
            },
          },
        },
      });
      const el = wrapper.findDataTest('noFixedHomeAddress');
      expect(el.text()).toBe('registration.addresses.noFixedHomeAddress');
    });
  });
});
