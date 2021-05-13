import Vuetify from 'vuetify';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import TemporaryAddressTemplate from './TemporaryAddressTemplate.vue';
import { mockBeneficiary } from '../../../../entities/beneficiary';
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
