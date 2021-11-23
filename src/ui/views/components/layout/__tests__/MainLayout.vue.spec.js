import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockEvent } from '@crctech/registration-lib/src/entities/event';
import Component from '../MainLayout.vue';

const storage = mockStorage();
storage.registration.actions.fetchEvent = jest.fn(() => mockEvent());

describe('MainLayout.vue', () => {
  const localVue = createLocalVue();

  let wrapper;

  beforeEach(async () => {
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
    });

    await wrapper.setData({ fetchingData: false });
    jest.clearAllMocks();
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
      describe('verifyLocation', () => {
        it('gets the tenant from the current url', async () => {
          wrapper.vm.$route = { params: { lang: 'lang', registrationLink: 'reg' } };
          await wrapper.vm.verifyLocation();
          expect(wrapper.vm.$services.publicApi.getTenantByRegistrationDomain).toHaveBeenCalledWith(wrapper.vm.getCurrentDomain());
        });

        it('gets the event from storage', async () => {
          wrapper.vm.$route = { params: { lang: 'lang', registrationLink: 'reg' } };
          await wrapper.vm.verifyLocation();
          expect(storage.registration.actions.fetchEvent).toHaveBeenCalledWith('lang', 'reg');
        });
      });

      describe('fetchData', () => {
        it('calls fetchGenders', async () => {
          await wrapper.vm.fetchData();
          expect(wrapper.vm.$storage.registration.actions.fetchGenders).toHaveBeenCalled();
        });

        it('calls fetchPreferredLanguages', async () => {
          await wrapper.vm.fetchData();
          expect(wrapper.vm.$storage.registration.actions.fetchPreferredLanguages).toHaveBeenCalled();
        });

        it('calls fetchPrimarySpokenLanguages', async () => {
          await wrapper.vm.fetchData();
          expect(wrapper.vm.$storage.registration.actions.fetchPrimarySpokenLanguages).toHaveBeenCalled();
        });
      });
    });
  });
});
