import { mockEventSummary } from '@libs/entities-lib/src/event';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import helpers from '@/ui/helpers';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { mockProvider } from '@/services/provider';
import Component from '../MainLayout.vue';

const { pinia, registrationStore } = useMockRegistrationStore();
const { tenantSettingsStore } = useMockTenantSettingsStore(pinia);
describe('MainLayout.vue', () => {
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
    registrationStore.fetchEvent = jest.fn(() => mockEventSummary());
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
      describe('initializeEvent', () => {
        it('gets the tenant from the current url', async () => {
          wrapper.vm.$route = { params: { lang: 'lang', registrationLink: 'reg' }, query: {} };
          await wrapper.vm.initializeEvent();
          expect(wrapper.vm.$services.publicApi.getTenantByRegistrationDomain).toHaveBeenCalledWith(helpers.getCurrentDomain(wrapper.vm.$route));
        });

        it('gets the event from the store', async () => {
          wrapper.vm.$route = { params: { lang: 'lang', registrationLink: 'reg' }, query: {} };
          await wrapper.vm.initializeEvent();
          expect(registrationStore.fetchEvent).toHaveBeenCalledWith('lang', 'reg');
        });

        it('set the tenantId to appInsights', async () => {
          wrapper.vm.$route = { params: { lang: 'lang', registrationLink: 'reg' }, query: {} };
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

        it('sets registration assessment to complete', async () => {
          wrapper.vm.$route = { params: { lang: 'lang', registrationLink: 'reg' }, query: {} };
          await wrapper.vm.initializeEvent();
          expect(wrapper.vm.$services.assessmentForms.getForBeneficiary).toHaveBeenCalledWith(mockEventSummary().registrationAssessments[0].assessmentId);
          expect(registrationStore.setAssessmentToComplete).toHaveBeenCalledWith({
            assessmentForm: wrapper.vm.$services.assessmentForms.getForBeneficiary(),
            registrationAssessment: mockEventSummary().registrationAssessments[0],
          });
        });
      });

      describe('fetchData', () => {
        it('calls fetchGenders', async () => {
          await wrapper.vm.fetchData();
          expect(registrationStore.fetchGenders).toHaveBeenCalled();
        });

        it('calls fetchPreferredLanguages', async () => {
          await wrapper.vm.fetchData();
          expect(registrationStore.fetchPreferredLanguages).toHaveBeenCalled();
        });

        it('calls fetchPrimarySpokenLanguages', async () => {
          await wrapper.vm.fetchData();
          expect(registrationStore.fetchPrimarySpokenLanguages).toHaveBeenCalled();
        });

        it('calls fetchFeatures', async () => {
          wrapper.vm.fetchFeatures = jest.fn();

          await wrapper.vm.fetchData();
          expect(tenantSettingsStore.fetchPublicFeatures).toHaveBeenCalled();
        });

        it('tracks exception', async () => {
          const testError = new Error('err');

          registrationStore.fetchPrimarySpokenLanguages = jest.fn(
            () => new Promise(() => {
              throw testError;
            }),
          );

          await wrapper.vm.fetchData();

          expect(wrapper.vm.$appInsights.trackException).toHaveBeenCalledWith(testError, {}, 'MainLayout', 'fetchData');
        });

        describe('mouseMoved', () => {
          it('initialized movement when not initialized', async () => {
            wrapper.vm.mouseMoved({ clientX: 123, clientY: 456 });
            expect(registrationStore.selfRegistrationLog.mouseDistance).toEqual(0);
            expect(registrationStore.selfRegistrationLog.mouseTime).toEqual(0);
            expect(wrapper.vm.previousMouseCoordinates).toEqual({ x: 123, y: 456 });
          });
          it('records movement when initialized and throttles time', async () => {
            wrapper.vm.mouseMoved({ clientX: 123, clientY: 456 });

            wrapper.vm.mouseMoved({ clientX: 125, clientY: 450 });
            expect(registrationStore.selfRegistrationLog.mouseDistance).toEqual(8);
            expect(registrationStore.selfRegistrationLog.mouseTime).toEqual(1);
            wrapper.vm.mouseMoved({ clientX: 125, clientY: 451 });
            expect(registrationStore.selfRegistrationLog.mouseDistance).toEqual(9);
            expect(registrationStore.selfRegistrationLog.mouseTime).toEqual(1);
            // eslint-disable-next-line no-promise-executor-return
            await new Promise((resolve) => setTimeout(resolve, 1100));
            expect(registrationStore.selfRegistrationLog.mouseDistance).toEqual(9);
            expect(registrationStore.selfRegistrationLog.mouseTime).toEqual(1);
            wrapper.vm.mouseMoved({ clientX: 120, clientY: 451 });
            expect(registrationStore.selfRegistrationLog.mouseDistance).toEqual(14);
            expect(registrationStore.selfRegistrationLog.mouseTime).toEqual(2);
            // eslint-disable-next-line no-promise-executor-return
            await new Promise((resolve) => setTimeout(resolve, 1100));
            expect(registrationStore.selfRegistrationLog.mouseDistance).toEqual(14);
            expect(registrationStore.selfRegistrationLog.mouseTime).toEqual(2);
          });
        });
      });
    });
  });
});
