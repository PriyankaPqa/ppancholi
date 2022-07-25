import { mockEvent } from '@libs/registration-lib/entities/event';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
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
          wrapper.vm.$route = { params: { lang: 'lang', registrationLink: 'reg' }, query: {} };
          await wrapper.vm.verifyLocation();
          expect(wrapper.vm.$services.publicApi.getTenantByRegistrationDomain).toHaveBeenCalledWith(wrapper.vm.getCurrentDomain());
        });

        it('gets the event from storage', async () => {
          wrapper.vm.$route = { params: { lang: 'lang', registrationLink: 'reg' }, query: {} };
          await wrapper.vm.verifyLocation();
          expect(storage.registration.actions.fetchEvent).toHaveBeenCalledWith('lang', 'reg');
        });

        it('set the tenantId to appInsights', async () => {
          wrapper.vm.$route = { params: { lang: 'lang', registrationLink: 'reg' }, query: {} };
          await wrapper.vm.verifyLocation();

          expect(wrapper.vm.$appInsights.setBasicContext).toHaveBeenCalledTimes(2);
          expect(wrapper.vm.$appInsights.setBasicContext.mock.calls).toEqual([
            [
              {
                tenantId: expect.anything(),
              },
            ],
            [
              {
                event: expect.anything(),
              },
            ],
          ]);
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

        it('calls fetchFeatures', async () => {
          wrapper.vm.fetchFeatures = jest.fn();

          await wrapper.vm.fetchData();
          expect(wrapper.vm.$storage.tenantSettings.actions.fetchPublicFeatures).toHaveBeenCalled();
        });

        it('tracks exception', async () => {
          const testError = new Error('err');

          wrapper.vm.$storage.registration.actions.fetchPrimarySpokenLanguages = jest.fn(
            () => new Promise(() => {
              throw testError;
            }),
          );

          await wrapper.vm.fetchData();

          expect(wrapper.vm.$appInsights.trackException).toHaveBeenCalledWith(testError, {}, 'MainLayout', 'fetchData');
        });
      });

      describe('getCurrentDomain', () => {
        it('should return dev tenant if localhost', () => {
          global.window = Object.create(window);
          wrapper.vm.$route.query = undefined;
          Object.defineProperty(window, 'location', {
            value: {
              href: 'http://localhost:8080/en/registration/bc-fire-event/',
              hostname: 'localhost',
            },
          });
          expect(wrapper.vm.getCurrentDomain()).toBe('beneficiary-dev.crc-tech.ca');
        });

        it('should dev tenant if beneficiary feature branch', () => {
          global.window = Object.create(window);
          wrapper.vm.$route.query = undefined;
          Object.defineProperty(window, 'location', {
            value: {
              href: 'http://beneficiary-1234.crc-tech.ca/en/registration/bc-fire-event/',
              hostname: 'beneficiary-1234.crc-tech.ca',
            },
          });
          expect(wrapper.vm.getCurrentDomain()).toBe('beneficiary-dev.crc-tech.ca');
        });

        it('should return the tenant if specified in a query params', () => {
          wrapper.vm.$route.query['force-tenant'] = 'forceTenant';
          global.window = Object.create(window);
          Object.defineProperty(window, 'location', {
            value: {
              href: 'http://beneficiary-1234.crc-tech.ca/en/registration/bc-fire-event/?force-tenant=forceTenant',
              hostname: 'beneficiary-1234',
            },
          });
          expect(wrapper.vm.getCurrentDomain()).toBe('forceTenant');
        });
      });
    });
  });
});
