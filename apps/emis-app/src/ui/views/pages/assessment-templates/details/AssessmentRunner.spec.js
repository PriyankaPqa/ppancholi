import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import flushPromises from 'flush-promises';
import Component from './AssessmentRunner.vue';

let storage = mockStorage();
const localVue = createLocalVue();

describe('AssessmentRunner', () => {
  let wrapper;

  const mount = async (eventId = 'mock-event-id', assessmentResponseId = 'mock-assessmentResponse-id') => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        testMode: true,
        id: eventId,
        assessmentTemplateId: 'mock-assessmentTemplate-id',
        assessmentResponseId,
      },
      mocks: { $storage: storage },
    });

    await flushPromises();
  };

  beforeEach(async () => {
    storage = mockStorage();
    await mount();
  });

  describe('Lifecycle', () => {
    describe('mounted', () => {
      it('calls loadDetails', async () => {
        jest.clearAllMocks();
        wrapper.vm.loadDetails = jest.fn();

        const hook = wrapper.vm.$options.mounted[wrapper.vm.$options.mounted.length - 1];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.loadDetails).toHaveBeenCalled();
      });
      it('fetches assessmentResponse when id is passed', async () => {
        expect(storage.assessmentResponse.actions.fetch).toHaveBeenCalledWith(
          { id: wrapper.vm.assessmentResponseId }, { useEntityGlobalHandler: true, useMetadataGlobalHandler: false },
        );
      });
      it('sets survey object', () => {
        expect(wrapper.vm.survey).not.toBeNull();
        expect(wrapper.vm.survey.data).toEqual(JSON.parse(wrapper.vm.response.externalToolState.data.rawJson));
      });
    });
  });

  describe('methods', () => {
    describe('saveAnswers', () => {
      it('sets response answers from helper and calls save method', async () => {
        wrapper.vm.surveyJsHelper.surveyToAssessmentResponse = jest.fn(() => 'some object');
        await wrapper.vm.saveAnswers(null);
        expect(storage.assessmentResponse.actions.saveAssessmentAnsweredQuestions).toHaveBeenCalledWith('some object');
        expect(wrapper.vm.response).toEqual(storage.assessmentResponse.actions.saveAssessmentAnsweredQuestions('some object'));
      });

      it('doesnt call save method if no assessmentResponseId', async () => {
        await mount('eventId', null);
        wrapper.vm.surveyJsHelper.surveyToAssessmentResponse = jest.fn(() => 'some object');
        await wrapper.vm.saveAnswers(null);
        expect(storage.assessmentResponse.actions.saveAssessmentAnsweredQuestions).not.toHaveBeenCalled();
        expect(wrapper.vm.response).toEqual('some object');
      });
    });
  });
});
