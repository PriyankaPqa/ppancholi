import Vuetify from 'vuetify';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import HomeAddressTemplate from '@/ui/views/pages/registration/review/addresses/HomeAddressTemplate.vue';
import TemporaryAddressTemplate from '@/ui/views/pages/registration/review/addresses/TemporaryAddressTemplate.vue';
import { mockBeneficiary } from '@crctech/registration-lib/src/entities/beneficiary';
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
        beneficiary: mockBeneficiary(),
      },
    });
  });

  describe('Template', () => {
    it('renders home address template', async () => {
      const component = wrapper.findComponent(HomeAddressTemplate);
      expect(component.exists()).toBe(true);
    });

    it('renders temporary address template', async () => {
      const component = wrapper.findComponent(TemporaryAddressTemplate);
      expect(component.exists()).toBe(true);
    });
  });
});
