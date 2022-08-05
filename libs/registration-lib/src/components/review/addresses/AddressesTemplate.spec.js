import Vuetify from 'vuetify';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockHouseholdCreate } from '@libs/entities-lib/household-create';
import CurrentAddressTemplate from './CurrentAddressTemplate.vue';
import HomeAddressTemplate from './HomeAddressTemplate.vue';
import Component from './AddressesTemplate.vue';

const localVue = createLocalVue();

describe('AddressesTemplate.vue', () => {
  let wrapper;
  beforeEach(async () => {
    const vuetify = new Vuetify();

    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      propsData: {
        household: mockHouseholdCreate(),
      },
    });
  });

  describe('Template', () => {
    it('renders home address template', async () => {
      const component = wrapper.findComponent(HomeAddressTemplate);
      expect(component.exists()).toBe(true);
    });

    it('renders temporary address template', async () => {
      const component = wrapper.findComponent(CurrentAddressTemplate);
      expect(component.exists()).toBe(true);
    });
  });
});
