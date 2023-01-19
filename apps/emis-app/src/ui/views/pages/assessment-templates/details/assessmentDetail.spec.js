import { mockStorage } from '@/storage';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  mockAssessmentFormEntity, AssessmentFormEntity, AssessmentTemplateEntity,
} from '@libs/entities-lib/assessment-template';
import routes from '@/constants/routes';
import { useMockAssessmentFormStore } from '@/pinia/assessment-form/assessment-form.mock';
import { useMockAssessmentTemplateStore } from '@/pinia/assessment-template/assessment-template.mock';
import { createTestingPinia } from '@pinia/testing';
import { useMockProgramStore } from '@/pinia/program/program.mock';
import assessmentDetail from './assessmentDetail';

const Component = {
  render() {},
  mixins: [assessmentDetail],
};

const assessmentForm = mockAssessmentFormEntity();

const localVue = createLocalVue();
let storage = mockStorage();
let pinia = createTestingPinia({ stubActions: false });
let assessmentFormStore = useMockAssessmentFormStore(pinia).assessmentFormStore;
let assessmentTemplateStore = useMockAssessmentTemplateStore(pinia).assessmentTemplateStore;
let programStore = useMockProgramStore(pinia).programStore;

describe('assessmentDetail', () => {
  let wrapper;

  const mountWrapper = async (eventId = null, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: { id: eventId },
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
        $hasRole: (r) => r === hasRole,
        $storage: storage,
        $route: {
          params: {
            assessmentTemplateId: 'assId',
          },
        },
      },
      ...additionalOverwrites,
    });

    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    storage = mockStorage();
    pinia = createTestingPinia({ stubActions: false });
    assessmentFormStore = useMockAssessmentFormStore(pinia).assessmentFormStore;
    assessmentTemplateStore = useMockAssessmentTemplateStore(pinia).assessmentTemplateStore;
    programStore = useMockProgramStore(pinia).programStore;
    jest.clearAllMocks();
  });

  describe('Computed', () => {
    describe('isFormMode', () => {
      it('return true if assessment is an assessment form', async () => {
        await mountWrapper('eventId');
        expect(wrapper.vm.isFormMode).toBeTruthy();
        await mountWrapper();
        expect(wrapper.vm.isFormMode).toBeFalsy();
      });
    });

    describe('eventId', () => {
      it('return eventId', async () => {
        await mountWrapper('eventId');
        expect(wrapper.vm.eventId).toBe('eventId');
        await mountWrapper();
        expect(wrapper.vm.eventId).toBeNull();
      });
    });

    describe('assessmentForm', () => {
      it('return assessmentForm if form mode', async () => {
        await mountWrapper('eventId');
        await wrapper.setData({ assessmentTemplate: assessmentForm });
        expect(wrapper.vm.assessmentForm).toBe(assessmentForm);
        await mountWrapper();
        await wrapper.setData({ assessmentTemplate: assessmentForm });
        expect(wrapper.vm.assessmentForm).toBeNull();
      });
    });

    describe('baseRoute', () => {
      it('return home of correct mode', async () => {
        await mountWrapper('eventId');
        expect(wrapper.vm.baseRoute).toBe(routes.events.assessments);
        await mountWrapper();
        expect(wrapper.vm.baseRoute).toBe(routes.assessmentTemplates);
      });
    });
  });

  describe('Methods', () => {
    describe('loadDetails', () => {
      it('fetches from correct store depending on isFormMode', async () => {
        await mountWrapper(assessmentFormStore.fetch().eventId);
        await wrapper.vm.loadDetails();
        expect(assessmentFormStore.fetch)
          .toHaveBeenCalledWith({ id: wrapper.vm.assessmentTemplateId });
        expect(wrapper.vm.assessmentTemplate).toEqual(new AssessmentFormEntity(assessmentFormStore.fetch()));
        jest.clearAllMocks();
        await mountWrapper();
        await wrapper.vm.loadDetails();
        expect(assessmentTemplateStore.fetch)
          .toHaveBeenCalledWith({ id: wrapper.vm.assessmentTemplateId });
        expect(wrapper.vm.assessmentTemplate).toEqual(new AssessmentTemplateEntity(assessmentTemplateStore.fetch()));
      });

      it('fetches the program if one is associated', async () => {
        await mountWrapper('eventId');
        await wrapper.vm.loadDetails();
        expect(programStore.fetch).toHaveBeenCalledWith(
          { id: wrapper.vm.assessmentTemplate.programId, eventId: wrapper.vm.assessmentTemplate.eventId },
        );
      });
    });
  });
});
