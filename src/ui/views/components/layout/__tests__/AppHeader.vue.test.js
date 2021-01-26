import flushPromises from 'flush-promises';
import {
  createLocalVue,
  mount,
} from '@/test/testSetup';
import Component from '../AppHeader.vue';

const localVue = createLocalVue();

describe('AppHeader.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Component, {
      localVue,
    });
  });

  describe('logo', () => {
    test('The logo is displayed correctly by changing the system language', async () => {
      const element = wrapper.find('[data-test="appHeader__logo"]');
      expect(element.classes('logoEn')).toBeTruthy();

      wrapper.vm.$i18n.locale = 'fr';

      await flushPromises();

      expect(element.classes('logoFr')).toBeTruthy();
    });
  });
});
