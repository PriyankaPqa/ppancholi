import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import Component from '../MainLayout.vue';

describe('MainLayout.vue', () => {
  const localVue = createLocalVue();

  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: mockStorage(),
      },
    });
  });

  describe('Template', () => {
    describe('Elements on page', () => {
      test('The app header is displayed correctly', async () => {
        const element = wrapper.find('[data-test="app-header"]');
        expect(element.exists()).toBeTruthy();
      });

      test('The router view transition is displayed correctly', async () => {
        const element = wrapper.find('[data-test="router-view-transition"]');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('Methods', () => {
      describe('fetchData', () => {
        it('calls fetchGenders', async () => {
          await wrapper.vm.fetchData();
          expect(wrapper.vm.$storage.registration.actions.fetchGenders).toHaveBeenCalledTimes(2);
        });

        it('calls fetchPreferredLanguages', async () => {
          await wrapper.vm.fetchData();
          expect(wrapper.vm.$storage.registration.actions.fetchPreferredLanguages).toHaveBeenCalledTimes(2);
        });

        it('calls fetchPrimarySpokenLanguages', async () => {
          await wrapper.vm.fetchData();
          expect(wrapper.vm.$storage.registration.actions.fetchPrimarySpokenLanguages).toHaveBeenCalledTimes(2);
        });
      });
    });
  });
});
