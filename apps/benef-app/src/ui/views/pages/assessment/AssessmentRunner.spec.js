import { createLocalVue, shallowMount } from '@/test/testSetup';
import flushPromises from 'flush-promises';
import { mockProvider } from '@/services/provider';
import helpers from '@/ui/helpers';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import Component from './AssessmentRunner.vue';

let services = mockProvider();
const localVue = createLocalVue();

const { pinia, tenantSettingsStore } = useMockTenantSettingsStore();

describe('AssessmentRunner.vue', () => {
  let wrapper;

  const mount = async (eventId = 'mock-event-id', assessmentResponseId = 'mock-assessmentResponse-id') => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        testMode: true,
        id: eventId,
        assessmentTemplateId: 'mock-assessmentTemplate-id',
        assessmentResponseId,
      },
      mocks: { $services: services },
    });

    await flushPromises();
  };

  beforeEach(async () => {
    services = mockProvider();
    await mount();
  });

  describe('Lifecycle', () => {
    describe('mounted', () => {
      it('calls initializeSurvey and initializeTenant', async () => {
        jest.clearAllMocks();
        wrapper.vm.initializeSurvey = jest.fn();
        wrapper.vm.initializeTenant = jest.fn();

        const hook = wrapper.vm.$options.mounted[wrapper.vm.$options.mounted.length - 1];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.initializeSurvey).toHaveBeenCalled();
        expect(wrapper.vm.initializeTenant).toHaveBeenCalled();
      });
      it('sets color scheme', async () => {
        jest.clearAllMocks();
        wrapper.vm.surveyJsHelper.setColorScheme = jest.fn();

        const hook = wrapper.vm.$options.mounted[wrapper.vm.$options.mounted.length - 1];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.surveyJsHelper.setColorScheme).toHaveBeenCalledWith(
          '#surveyContainer',
          tenantSettingsStore.currentTenantSettings.branding.colours,
        );
      });
    });
  });

  describe('methods', () => {
    describe('saveAnswers', () => {
      it('sets response answers from helper and calls save method', async () => {
        wrapper.vm.surveyJsHelper.surveyToAssessmentResponse = jest.fn(() => 'some object');
        await wrapper.vm.saveAnswers(null);
        expect(services.assessmentResponses.saveAssessmentAnsweredQuestions).toHaveBeenCalledWith('some object');
        expect(wrapper.vm.response).toEqual(services.assessmentResponses.saveAssessmentAnsweredQuestions('some object'));
      });
    });

    describe('completeSurvey', () => {
      it('calls save answers and completeSurveyByBeneficiary and sets surveyCompleted flag', async () => {
        wrapper.vm.saveAnswers = jest.fn(() => 'some object');
        await wrapper.vm.completeSurvey(null);
        expect(wrapper.vm.saveAnswers).toHaveBeenCalled();
        expect(services.assessmentResponses.completeSurveyByBeneficiary).toHaveBeenCalled();
        expect(wrapper.vm.surveyCompleted).toEqual(true);
      });
    });

    describe('initializeSurvey', () => {
      it('calls loadDetails', async () => {
        jest.clearAllMocks();
        wrapper.vm.loadDetails = jest.fn();

        await wrapper.vm.initializeSurvey();
        expect(wrapper.vm.loadDetails).toHaveBeenCalled();
      });
      it('fetches assessmentResponse', async () => {
        await wrapper.vm.initializeSurvey();
        expect(services.assessmentResponses.getForBeneficiary).toHaveBeenCalledWith(wrapper.vm.assessmentResponseId);
      });
      it('sets survey object', () => {
        expect(wrapper.vm.survey).not.toBeNull();
        expect(wrapper.vm.survey.data).toEqual(JSON.parse(wrapper.vm.response.externalToolState.data.rawJson));
      });
      it('sets survey onValueChanged if saving partial survey results is allowed', async () => {
        wrapper.vm.assessmentTemplate.savePartialSurveyResults = true;
        jest.clearAllMocks();
        wrapper.vm.loadDetails = jest.fn();
        await wrapper.vm.initializeSurvey();
        expect(wrapper.vm.survey.onValueChanged.callbacks).toHaveLength(2);
      });
      it('not sets survey onValueChanged if saving partial survey results is not allowed', async () => {
        wrapper.vm.assessmentTemplate.savePartialSurveyResults = false;
        jest.clearAllMocks();
        wrapper.vm.loadDetails = jest.fn();
        await wrapper.vm.initializeSurvey();
        expect(wrapper.vm.survey.onValueChanged.callbacks).toHaveLength(1);
      });
    });

    describe('initializeTenant', () => {
      it('gets the tenant from the current url and fetches branding', async () => {
        wrapper.vm.$route = { params: { lang: 'lang', registrationLink: 'reg' }, query: {} };
        await wrapper.vm.initializeTenant();
        expect(wrapper.vm.$services.publicApi.getTenantByRegistrationDomain).toHaveBeenCalledWith(helpers.getCurrentDomain(wrapper.vm.$route));
        expect(tenantSettingsStore.fetchBranding).toHaveBeenCalled();
      });
    });

    describe('loadDetails', () => {
      it('fetches assessmentResponse', async () => {
        await wrapper.vm.initializeSurvey();
        expect(services.assessmentResponses.getForBeneficiary).toHaveBeenCalledWith(wrapper.vm.assessmentResponseId);
      });
      it('fetches assessmentForm', async () => {
        await wrapper.vm.initializeSurvey();
        expect(services.assessmentForms.getForBeneficiary).toHaveBeenCalledWith(wrapper.vm.assessmentTemplateId);
      });
    });

    describe('beforeAssessmentRunnerWindowUnload', () => {
      it('calls preventDefault and sets returnValue when survey is not completed', async () => {
        const event = {
          preventDefault: jest.fn(),
          returnValue: null,
        };
        wrapper.vm.beforeAssessmentRunnerWindowUnload(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.returnValue).toEqual('');
      });
    });
  });
});
