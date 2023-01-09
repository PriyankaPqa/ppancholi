import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  mockAssessmentTotalSubmissions,
  mockCombinedAssessmentForm, mockCombinedAssessmentTemplate,
} from '@libs/entities-lib/assessment-template';
import { mockStorage } from '@/storage';
import { useMockProgramStore } from '@/pinia/program/program.mock';
import Component from './AssessmentTemplateDetails.vue';

const storage = mockStorage();
const localVue = createLocalVue();
const { pinia } = useMockProgramStore();

describe('AssessmentTemplateDetails', () => {
  let wrapper;
  const combinedAssessmentForm = mockCombinedAssessmentForm();
  const assessmentForm = combinedAssessmentForm.entity;
  const combinedAssessmentTemplate = mockCombinedAssessmentTemplate();
  const assessmentTotalSubmissions = mockAssessmentTotalSubmissions();
  const assessmentTemplate = combinedAssessmentTemplate.entity;

  describe('Computed', () => {
    beforeEach(async () => {
      jest.clearAllMocks();
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          id: 'mock-event-id',
        },
        mocks: {
          $storage: storage,
          $route: {
            params: {
              assessmentTemplateId: 'mock-assessmentTemplate-id',
            },
          },
        },
      });
      await wrapper.setData({ assessmentTemplate: assessmentForm });
    });

    describe('assessmentTemplateData', () => {
      it('returns the right data when assessmentForm', () => {
        expect(wrapper.vm.assessmentTemplateData).toEqual([
          {
            label: 'assessmentTemplate.program',
            data: 'Program A',
            test: 'program',
          },
          {
            label: 'common.description',
            data: assessmentForm.description.translation.en,
            test: 'description',
          },
          {
            label: 'assessmentTemplate.savePartialSurveyResults',
            data: 'common.no',
            test: 'savePartialSurveyResults',
          },
          {
            label: 'assessmentTemplate.frequency',
            data: 'enums.assessmentFrequencyType.Multiple',
            test: 'frequency',
          },
          {
            label: 'assessmentTemplate.totalSubmissionsCompleted',
            data: '1',
            test: 'totalSubmissionsCompleted',
          },
          {
            label: 'assessmentTemplate.totalSubmissionsPartialCompleted',
            data: '1',
            test: 'totalSubmissionsPartialCompleted',
          },
          {
            label: 'assessmentTemplate.messageIfUnavailable',
            data: assessmentForm.messageIfUnavailable.translation.en,
            test: 'messageIfUnavailable',
          },
        ]);
      });

      it('returns the right data when assessmentTemplate', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
            $route: {
              params: {
                assessmentTemplateId: 'mock-assessmentTemplate-id',
              },
            },
          },
        });

        await wrapper.setData({ assessmentTemplate });

        expect(wrapper.vm.assessmentTemplateData).toEqual([
          {
            label: 'common.description',
            data: assessmentForm.description.translation.en,
            test: 'description',
          },
          {
            label: 'assessmentTemplate.savePartialSurveyResults',
            data: 'common.no',
            test: 'savePartialSurveyResults',
          },
          {
            label: 'assessmentTemplate.frequency',
            data: 'enums.assessmentFrequencyType.Multiple',
            test: 'frequency',
          },
          {
            label: 'assessmentTemplate.messageIfUnavailable',
            data: assessmentForm.messageIfUnavailable.translation.en,
            test: 'messageIfUnavailable',
          },
        ]);
      });
    });

    describe('assessmentTemplateEditRoute', () => {
      it('should redirect to the case assessmentTemplate edit page', () => {
        expect(wrapper.vm.assessmentTemplateEditRoute).toEqual({
          name: wrapper.vm.baseRoute.edit.name,
          params: {
            assessmentTemplateId: 'mock-assessmentTemplate-id',
          },
        });
      });
    });
  });

  describe('lifecycle - create', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: 'mock-event-id',
        },
        mocks: {
          $storage: storage,
          $route: {
            params: {
              assessmentTemplateId: 'mock-assessmentTemplate-id',
            },
          },
        },
      });
    });

    it('should call fetch', () => {
      expect(wrapper.vm.$storage.assessmentForm.actions.fetch).toHaveBeenCalledWith(
        { id: 'mock-assessmentTemplate-id' },
        { useEntityGlobalHandler: true, useMetadataGlobalHandler: false },
      );
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: 'mock-event-id',
        },
        mocks: {
          $storage: storage,
          $route: {
            params: {
              assessmentTemplateId: 'mock-assessmentTemplate-id',
            },
          },
        },
      });
    });

    describe('goToAssessmentTemplates', () => {
      it('should redirect to home page', async () => {
        wrapper.vm.goToAssessmentTemplates();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: wrapper.vm.baseRoute.home.name,
        });
      });
    });

    describe('goToEditor', () => {
      it('should redirect to editor page', async () => {
        window.open = jest.fn();
        wrapper.vm.goToEditor();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.resolve).toHaveBeenCalledWith({
          name: wrapper.vm.baseRoute.builder.name,
          params: {
            assessmentTemplateId: wrapper.vm.assessmentTemplateId,
            id: wrapper.vm.eventId,
          },
        });
        expect(window.open).toHaveBeenCalledWith(wrapper.vm.$router.resolve().href, '_blank');
      });

      describe('getAssessmentTotalSubmissions', () => {
        it('should get assessment total submissions', async () => {
          expect(wrapper.vm.$services.assessmentForms.assessmentTotalSubmissions).toHaveBeenCalledWith('mock-assessmentTemplate-id');
          expect(wrapper.vm.assessmentTotalSubmissions).toEqual(assessmentTotalSubmissions);
          expect(wrapper.vm.getAssessmentTotalSubmissions).toBeTruthy();
        });
      });
    });
  });

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: 'mock-event-id',
        },
        mocks: {
          $storage: storage,
          $route: {
            params: {
              assessmentTemplateId: 'mock-assessmentTemplate-id',
            },
          },
        },
        computed: {
          assessmentTemplateData() {
            return [{
              label: 'mock-label',
              data: 'mock-data',
              test: 'mock-test',
            }];
          },
        },
      });
    });

    describe('assessmentTemplate data', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('assessmentTemplate_details_mock-test');
      });
      it('displays the right label', () => {
        expect(element.text()).toContain('mock-label');
      });
      it('contains the right data', () => {
        expect(element.text()).toContain('mock-data');
      });
    });

    describe('back button', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('assessmentTemplate_details_back_btn');
      });
      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('calls goToAssessmentTemplates when clicked', async () => {
        jest.spyOn(wrapper.vm, 'goToAssessmentTemplates').mockImplementation(() => { });
        await element.vm.$emit('click');
        expect(wrapper.vm.goToAssessmentTemplates).toHaveBeenCalledTimes(1);
      });
    });
  });
});
