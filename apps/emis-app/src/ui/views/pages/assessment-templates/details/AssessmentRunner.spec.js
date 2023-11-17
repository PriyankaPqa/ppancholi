import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockProvider } from '@/services/provider';
import { mockAssessmentResponseEntity } from '@libs/entities-lib/assessment-template';
import flushPromises from 'flush-promises';
import { createTestingPinia } from '@pinia/testing';
import { useMockAssessmentResponseStore } from '@/pinia/assessment-response/assessment-response.mock';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';

import Component from './AssessmentRunner.vue';

let services = mockProvider();
const localVue = createLocalVue();

describe('AssessmentRunner.vue', () => {
  let wrapper;
  let pinia = createTestingPinia({ stubActions: false });
  let assessmentResponseStore = useMockAssessmentResponseStore(pinia).assessmentResponseStore;
  let tenantSettingsStore = useMockTenantSettingsStore(pinia).tenantSettingsStore;

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
      stubs: ['Survey'],
    });

    await flushPromises();
  };

  beforeEach(async () => {
    pinia = createTestingPinia({ stubActions: false });
    assessmentResponseStore = useMockAssessmentResponseStore(pinia).assessmentResponseStore;
    tenantSettingsStore = useMockTenantSettingsStore(pinia).tenantSettingsStore;
    services = mockProvider();
    await mount();
  });

  describe('Lifecycle', () => {
    describe('beforeRouteLeave', () => {
      let next;
      beforeEach(() => {
        next = jest.fn(() => {});
      });

      it('opens the dialog if partial saving is not allowed and survey is not yet completed', async () => {
        wrapper.vm.assessmentTemplate.savePartialSurveyResults = false;
        wrapper.vm.surveyCompleted = false;
        await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
        expect(wrapper.vm.$confirm).toHaveBeenCalled();
      });

      it('calls next if the confirmation dialog returns true', async () => {
        wrapper.vm.assessmentTemplate.savePartialSurveyResults = false;
        wrapper.vm.surveyCompleted = false;
        wrapper.vm.$confirm = jest.fn(() => true);
        await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
        expect(next).toBeCalled();
      });

      it('does not call next if the confirmation dialog returns false', async () => {
        wrapper.vm.assessmentTemplate.savePartialSurveyResults = false;
        wrapper.vm.surveyCompleted = false;
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
        expect(next).not.toBeCalled();
      });

      it('calls next if partial saving is allowed', async () => {
        wrapper.vm.assessmentTemplate.savePartialSurveyResults = true;
        wrapper.vm.surveyCompleted = false;
        await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
        expect(wrapper.vm.$confirm).not.toHaveBeenCalled();
        expect(next).toBeCalled();
      });

      it('calls next if survey is completed', async () => {
        wrapper.vm.assessmentTemplate.savePartialSurveyResults = false;
        wrapper.vm.surveyCompleted = true;
        await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
        expect(wrapper.vm.$confirm).not.toHaveBeenCalled();
        expect(next).toBeCalled();
      });
    });

    describe('mounted', () => {
      it('calls loadDetails', async () => {
        jest.clearAllMocks();
        wrapper.vm.loadDetails = jest.fn();

        const hook = wrapper.vm.$options.mounted[wrapper.vm.$options.mounted.length - 1];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.loadDetails).toHaveBeenCalled();
      });
      it('fetches assessmentResponse when id is passed', async () => {
        expect(assessmentResponseStore.fetch)
          .toHaveBeenCalledWith({ id: wrapper.vm.assessmentResponseId });
      });
      it('sets survey object', () => {
        expect(wrapper.vm.survey).not.toBeNull();
        expect(wrapper.vm.survey.data).toEqual(JSON.parse(wrapper.vm.response.externalToolState.data.rawJson));
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
      it('sets survey onValueChanged if saving partial survey results is allowed', async () => {
        wrapper.vm.assessmentTemplate.savePartialSurveyResults = true;
        jest.clearAllMocks();
        wrapper.vm.loadDetails = jest.fn();
        const hook = wrapper.vm.$options.mounted[wrapper.vm.$options.mounted.length - 1];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.survey.onValueChanged.callbacks).toHaveLength(2);
      });
      it('not sets survey onValueChanged if saving partial survey results is not allowed', async () => {
        wrapper.vm.assessmentTemplate.savePartialSurveyResults = false;
        jest.clearAllMocks();
        wrapper.vm.loadDetails = jest.fn();
        const hook = wrapper.vm.$options.mounted[wrapper.vm.$options.mounted.length - 1];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.survey.onValueChanged.callbacks).toHaveLength(1);
      });
    });
  });

  describe('methods', () => {
    describe('saveAnswers', () => {
      it('sets response answers from helper and calls save method', async () => {
        const response = mockAssessmentResponseEntity();
        wrapper.vm.surveyJsHelper.surveyToAssessmentResponse = jest.fn(() => response);
        await wrapper.vm.saveAnswers(null);
        expect(assessmentResponseStore.saveAssessmentAnsweredQuestions).toHaveBeenCalledWith(response);
        expect(wrapper.vm.response).toEqual(await assessmentResponseStore.saveAssessmentAnsweredQuestions(response));
      });

      it('doesnt call save method if no assessmentResponseId', async () => {
        await mount('eventId', null);
        const response = mockAssessmentResponseEntity();
        wrapper.vm.surveyJsHelper.surveyToAssessmentResponse = jest.fn(() => response);
        await wrapper.vm.saveAnswers(null);
        expect(assessmentResponseStore.saveAssessmentAnsweredQuestions).not.toHaveBeenCalled();
        expect(wrapper.vm.response).toEqual(response);
      });
    });

    describe('completeSurvey', () => {
      it('calls save answers and completeSurvey and sets surveyCompleted flag', async () => {
        wrapper.vm.saveAnswers = jest.fn(() => 'some object');
        await wrapper.vm.completeSurvey(null);
        expect(wrapper.vm.saveAnswers).toHaveBeenCalled();
        expect(services.assessmentResponses.completeSurvey).toHaveBeenCalled();
        expect(wrapper.vm.surveyCompleted).toEqual(true);
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
