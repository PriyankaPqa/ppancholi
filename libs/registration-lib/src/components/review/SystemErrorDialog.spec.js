import Vuetify from 'vuetify';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import Component from './SystemErrorDialog.vue';

const localVue = createLocalVue();

describe('SystemErrorDialog.vue', () => {
  let wrapper;
  beforeEach(async () => {
    const vuetify = new Vuetify();

    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      propsData: {
        show: true,
        phone: '514-666-6666',
      },
    });
  });

  describe('Methods', () => {
    describe('close', () => {
      it('emits update:show false', async () => {
        await wrapper.vm.close();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });
  });
});
