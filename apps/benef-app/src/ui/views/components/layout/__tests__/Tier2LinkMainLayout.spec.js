import { createLocalVue, shallowMount } from '@/test/testSetup';
import helpers from '@/ui/helpers';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { mockProvider } from '@/services/provider';
import Component from '../Tier2LinkMainLayout.vue';

const { pinia, registrationStore } = useMockRegistrationStore();
const { tenantSettingsStore } = useMockTenantSettingsStore(pinia);
describe('Tier2LinkMainLayout.vue', () => {
  const localVue = createLocalVue();
  const services = mockProvider();

  let wrapper;

  beforeEach(async () => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      mocks: {
        $services: services,
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
    });

    describe('Methods', () => {
      describe('initializeEvent', () => {
        it('gets the tenant from the current url', async () => {
          wrapper.vm.$route = { params: { caseFileId: 'caseFileId' }, query: {} };
          await wrapper.vm.initializeEvent();
          expect(wrapper.vm.$services.publicApi.getTenantByRegistrationDomain).toHaveBeenCalledWith(helpers.getCurrentDomain(wrapper.vm.$route));
        });

        it('gets the details from the store', async () => {
          wrapper.vm.$route = { params: { caseFileId: 'caseFileId' }, query: {} };
          await wrapper.vm.initializeEvent();
          expect(registrationStore.fetchDetailsForTier2Process).toHaveBeenCalledWith('caseFileId');
          expect(registrationStore.getEvent).toHaveBeenCalled();
        });

        it('set the tenantId to appInsights', async () => {
          jest.clearAllMocks();
          wrapper.vm.$route = { params: { caseFileId: 'caseFileId' }, query: {} };
          await wrapper.vm.initializeEvent();

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
        it('calls tenantSettingsStore', async () => {
          await wrapper.vm.fetchData();
          expect(tenantSettingsStore.fetchPublicFeatures).toHaveBeenCalled();
          expect(tenantSettingsStore.fetchBranding).toHaveBeenCalled();
          expect(tenantSettingsStore.validateCaptchaAllowedIpAddress).toHaveBeenCalled();
        });

        it('tracks exception', async () => {
          const testError = new Error('err');

          tenantSettingsStore.fetchPublicFeatures = jest.fn(
            () => new Promise(() => {
              throw testError;
            }),
          );

          await wrapper.vm.fetchData();

          expect(wrapper.vm.$appInsights.trackException).toHaveBeenCalledWith(testError, {}, 'Tier2LinkMainLayout', 'fetchData');
        });
      });
    });
  });
});
