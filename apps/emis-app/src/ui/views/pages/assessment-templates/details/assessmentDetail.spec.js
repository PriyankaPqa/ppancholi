import { mockStorage } from '@/storage';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  mockAssessmentFormEntity, AssessmentFormEntity, AssessmentTemplateEntity,
} from '@libs/entities-lib/assessment-template';
import routes from '@/constants/routes';
import assessmentDetail from './assessmentDetail';

const Component = {
  render() {},
  mixins: [assessmentDetail],
};

const assessmentForm = mockAssessmentFormEntity();

const localVue = createLocalVue();
let storage = mockStorage();

describe('assessmentDetail', () => {
  let wrapper;

  const mountWrapper = async (eventId = null, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: { id: eventId, assessmentTemplateId: 'assId' },
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
        $hasRole: (r) => r === hasRole,
        $storage: storage,
      },
      ...additionalOverwrites,
    });

    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    storage = mockStorage();
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
        await mountWrapper('eventId');
        await wrapper.vm.loadDetails();
        expect(storage.assessmentForm.actions.fetch).toHaveBeenCalledWith(
          { id: wrapper.vm.assessmentTemplateId }, { useEntityGlobalHandler: true, useMetadataGlobalHandler: false },
        );
        expect(wrapper.vm.assessmentTemplate).toEqual(new AssessmentFormEntity(storage.assessmentForm.actions.fetch().entity));
        jest.clearAllMocks();
        await mountWrapper();
        await wrapper.vm.loadDetails();
        expect(storage.assessmentTemplate.actions.fetch).toHaveBeenCalledWith(
          { id: wrapper.vm.assessmentTemplateId }, { useEntityGlobalHandler: true, useMetadataGlobalHandler: false },
        );
        expect(wrapper.vm.assessmentTemplate).toEqual(new AssessmentTemplateEntity(storage.assessmentTemplate.actions.fetch().entity));
      });

      it('fetches the program if one is associated', async () => {
        await mountWrapper('eventId');
        await wrapper.vm.loadDetails();
        expect(storage.program.actions.fetch).toHaveBeenCalledWith(
          { id: wrapper.vm.assessmentTemplate.programId, eventId: wrapper.vm.assessmentTemplate.eventId },
        );
      });
    });
  });
});
