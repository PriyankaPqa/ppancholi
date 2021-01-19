import flushPromises from 'flush-promises';
import {
  createLocalVue,
  mount,
} from '@/test/testSetup';
import routes from '@/constants/routes';
import Component from '../Layout/AppHeader.vue';

const localVue = createLocalVue();

describe('AppHeader.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Component, {
      localVue,
      mocks: {
        $route: {
          name: routes.crc_registration_individual.name,
        },
      },
      store: {
        modules: {
          user: {
            given_name: 'Erik',
          },
        },
      },
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

  describe('Contact us button is displayed correctly', () => {
    test('when the device size is medium and up', async () => {
      const element = wrapper.find('[data-test="appHeader__contactUs"]');
      wrapper.vm.$vuetify.breakpoint.mdAndUp = true;

      await flushPromises();

      expect(element.exists()).toBeTruthy();
    });

    test('when the page is landing page and the device size is small and up', async () => {
      const element = wrapper.find('[data-test="appHeader__contactUs"]');

      wrapper.vm.$vuetify.breakpoint.mdAndUp = false;
      wrapper.vm.$vuetify.breakpoint.smAndUp = true;
      wrapper.vm.$route.name = routes.crc_registration_landing_page.name;

      await flushPromises();

      expect(element.exists()).toBeTruthy();
    });
  });

  describe('Contact us button is not displayed', () => {
    test('when the device size is not medium and up', async () => {
      const element = wrapper.find('[data-test="appHeader__contactUs"]');
      wrapper.vm.$vuetify.breakpoint.mdAndUp = false;

      await flushPromises();

      expect(element.exists()).toBeFalsy();
    });

    test('when the page is not landing page or the device size is not small and up', async () => {
      const element = wrapper.find('[data-test="appHeader__contactUs"]');

      wrapper.vm.$vuetify.breakpoint.mdAndUp = false;
      wrapper.vm.$vuetify.breakpoint.smAndUp = false;
      wrapper.vm.$route.name = routes.crc_registration_landing_page.name;

      await flushPromises();

      expect(element.exists()).toBeFalsy();

      wrapper.vm.$vuetify.breakpoint.smAndUp = true;
      wrapper.vm.$route.name = routes.crc_registration_individual.name;

      await flushPromises();

      expect(element.exists()).toBeFalsy();
    });
  });
});
