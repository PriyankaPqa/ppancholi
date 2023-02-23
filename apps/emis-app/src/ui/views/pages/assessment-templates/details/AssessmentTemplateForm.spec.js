import _sortBy from 'lodash/sortBy';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { Status } from '@libs/entities-lib/base';
import {
  mockAssessmentFormEntity, mockAssessmentTemplateEntity, PublishStatus, AssessmentFormEntity, AssessmentTemplateEntity,
} from '@libs/entities-lib/assessment-template';
import { mockCombinedPrograms, mockProgramEntities } from '@libs/entities-lib/program';
import { MAX_LENGTH_MD, MAX_LENGTH_LG, MAX_LENGTH_SM } from '@libs/shared-lib/constants/validations';
import { useMockProgramStore } from '@/pinia/program/program.mock';
import utils from '@libs/entities-lib/utils';
import flushPromises from 'flush-promises';

import Component from './AssessmentTemplateForm.vue';

const localVue = createLocalVue();

const assessmentTemplate = mockAssessmentTemplateEntity();
const assessmentForm = mockAssessmentFormEntity();

const { pinia } = useMockProgramStore();
describe('AssessmentTemplateForm.vue', () => {
  let wrapper;

  // eslint-disable-next-line max-params
  const mountWrapper = async (assessmentTemplate = assessmentForm, fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        assessmentTemplate, isEditMode: true, isNameUnique: true, showEligibilityCriteriaWarning: false,
      },
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
        $hasRole: (r) => r === hasRole,

      },
      ...additionalOverwrites,
    });

    wrapper.vm.combinedProgramStore.search = jest.fn(() => ({
      ids: [mockProgramEntities()[0].id, mockProgramEntities()[1].id],
      count: mockProgramEntities().length,
    }));
    wrapper.vm.combinedProgramStore.getByIds = jest.fn(() => mockCombinedPrograms());
    wrapper.vm.searchResultIds = mockCombinedPrograms().map((e) => e.entity.id);

    await wrapper.vm.$nextTick();
    await flushPromises();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('Computed', () => {
    describe('isFormMode', () => {
      it('return true if assessment is an assessment form', async () => {
        await mountWrapper(assessmentForm);
        expect(wrapper.vm.isFormMode).toBeTruthy();
        await mountWrapper(assessmentTemplate);
        expect(wrapper.vm.isFormMode).toBeFalsy();
      });
    });

    describe('programsSorted', () => {
      it('returns the right value', async () => {
        await mountWrapper(assessmentForm);
        const programs = mockProgramEntities();
        await wrapper.setData({ programs });

        expect(wrapper.vm.programsSorted).toEqual(_sortBy(programs, (program) => program.name.translation.en));
      });
    });

    describe('programInactive', () => {
      it('returns the right value', async () => {
        const programs = mockProgramEntities();
        programs[0].status = Status.Active;
        assessmentForm.programId = programs[0].id;
        await mountWrapper(assessmentForm);
        await wrapper.setData({ programs });

        expect(wrapper.vm.programInactive).toEqual(false);

        programs[0].status = Status.Inactive;
        await wrapper.setData({ programs });

        expect(wrapper.vm.programInactive).toEqual(true);
      });
    });

    describe('rules', () => {
      it('returns the right value', async () => {
        await mountWrapper(assessmentForm);
        expect(wrapper.vm.rules).toEqual({
          name: {
            required: true,
            max: MAX_LENGTH_MD,
            customValidator: { isValid: wrapper.vm.isNameUnique, messageKey: 'validations.alreadyExists' },
          },
          description: {
            max: MAX_LENGTH_LG,
          },
          messageIfUnavailable: {
            max: MAX_LENGTH_LG,
          },
          frequency: {
            required: wrapper.vm.isFormMode,
          },
          scoringLabel: {
            required: true,
            max: MAX_LENGTH_SM,
          },
        });
      });
    });

    describe('isStatusActive', () => {
      it('returns whether status is active', async () => {
        await mountWrapper();
        expect(wrapper.vm.isStatusActive).toBeTruthy();
        await mountWrapper({ ...assessmentTemplate, status: Status.Inactive });
        expect(wrapper.vm.isStatusActive).toBeFalsy();
      });

      it('sets status', async () => {
        await mountWrapper();
        expect(wrapper.vm.localAssessment.status).toBe(Status.Active);
        wrapper.vm.isStatusActive = false;
        expect(wrapper.vm.localAssessment.status).toBe(Status.Inactive);
        wrapper.vm.isStatusActive = true;
        expect(wrapper.vm.localAssessment.status).toBe(Status.Active);
      });
    });

    describe('isPublished', () => {
      it('returns whether publishStatus is published', async () => {
        await mountWrapper({ ...assessmentTemplate, publishStatus: PublishStatus.Published });
        expect(wrapper.vm.isPublished).toBeTruthy();
        await mountWrapper({ ...assessmentTemplate, publishStatus: PublishStatus.Unpublished });
        expect(wrapper.vm.isPublished).toBeFalsy();
      });

      it('sets publishStatus', async () => {
        await mountWrapper();
        expect(wrapper.vm.localAssessment.publishStatus).toBe(PublishStatus.Published);
        wrapper.vm.isPublished = false;
        expect(wrapper.vm.localAssessment.publishStatus).toBe(PublishStatus.Unpublished);
        wrapper.vm.isPublished = true;
        expect(wrapper.vm.localAssessment.publishStatus).toBe(PublishStatus.Published);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call searchPrograms', async () => {
        await mountWrapper();
        jest.spyOn(wrapper.vm, 'searchPrograms').mockImplementation(() => {});

        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);

        expect(wrapper.vm.searchPrograms).toHaveBeenCalled();
      });

      it('should set localAssessment', async () => {
        await mountWrapper(assessmentForm);

        let hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);

        expect(wrapper.vm.localAssessment).toEqual(new AssessmentFormEntity(assessmentForm));
        await mountWrapper(assessmentTemplate);

        hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);

        expect(wrapper.vm.localAssessment).toEqual(new AssessmentTemplateEntity(assessmentTemplate));
      });

      it('should set originalAssessmentFormProgramId and originalAssessmentFormStatus', async () => {
        await mountWrapper(assessmentForm);

        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);

        expect(wrapper.vm.originalAssessmentFormProgramId).toEqual(assessmentForm.programId);
        expect(wrapper.vm.originalAssessmentFormStatus).toEqual(assessmentForm.status);
      });

      it('calls setIsSelectedAsProgramEligibilityCriteria', async () => {
        await mountWrapper(assessmentForm);
        wrapper.vm.setIsSelectedAsProgramEligibilityCriteria = jest.fn();

        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);

        expect(wrapper.vm.setIsSelectedAsProgramEligibilityCriteria).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Watch', () => {
    describe('localAssessment', () => {
      it('emits assessmentTemplate when localAssessment is changed', async () => {
        await mountWrapper();

        expect(wrapper.emitted('update:assessmentTemplate').length).toBe(1);

        await wrapper.setData({
          localAssessment: { name: { translation: { en: 'newName ' } } },
        });
        expect(wrapper.emitted('update:assessmentTemplate').length).toBe(2);
      });

      it('emits showEligibilityCriteriaWarning when localAssessment is changed for a form and isSelectedAsProgramEligibilityCriteria', async () => {
        await mountWrapper(assessmentForm);
        await wrapper.setData({
          localAssessment: { name: { translation: { en: 'newName ' } } },
          isSelectedAsProgramEligibilityCriteria: true,
        });
        expect(wrapper.emitted('update:show-eligibility-criteria-warning')?.length).toBe(1);
      });
    });
  });

  describe('Methods', () => {
    describe('setLanguageMode', () => {
      it('sets the languageMode', async () => {
        await mountWrapper();
        wrapper.vm.setLanguageMode('fr');
        expect(wrapper.vm.languageMode).toBe('fr');
      });

      it('calls fillEmptyMultilingualAttributes entity method', async () => {
        await mountWrapper();
        wrapper.vm.localAssessment.fillEmptyMultilingualAttributes = jest.fn();
        await wrapper.vm.setLanguageMode('fr');
        expect(wrapper.vm.localAssessment.fillEmptyMultilingualAttributes).toHaveBeenCalledTimes(1);
      });
    });

    describe('clearDescription', () => {
      it('clears the field description', async () => {
        await mountWrapper();
        await wrapper.setData({
          localAssessment: { description: { en: 'foo', fr: 'bar' } },
        });
        await wrapper.vm.clearDescription();
        expect(wrapper.vm.localAssessment.description).toEqual({
          translation: {
            en: '',
            fr: '',
          },
        });
      });
    });

    describe('clearMessage', () => {
      it('clears the field message', async () => {
        await mountWrapper();
        await wrapper.setData({
          localAssessment: { messageIfUnavailable: { en: 'foo', fr: 'bar' } },
        });
        await wrapper.vm.clearMessage();
        expect(wrapper.vm.localAssessment.messageIfUnavailable).toEqual({
          translation: {
            en: '',
            fr: '',
          },
        });
      });
    });

    describe('resetAsUnique', () => {
      it('emits update:is-name-unique to true if it is false', async () => {
        await mountWrapper();
        wrapper.setProps({ isNameUnique: false });
        await wrapper.vm.$nextTick();
        await wrapper.vm.resetAsUnique();
        expect(wrapper.emitted('update:is-name-unique')[0][0]).toBe(true);
      });
    });

    describe('setIsSelectedAsProgramEligibilityCriteria', () => {
      it('sets isSelectedAsProgramEligibilityCriteria flag', async () => {
        const programs = mockProgramEntities();
        programs[0].eligibilityCriteria.completedAssessmentIds = [assessmentForm.id];
        assessmentForm.programId = programs[0].id;
        await mountWrapper(assessmentForm);
        await wrapper.setData({
          localAssessment: assessmentForm,
          programs,
          originalAssessmentFormProgramId: assessmentForm.programId,
        });

        await wrapper.vm.setIsSelectedAsProgramEligibilityCriteria();

        expect(wrapper.vm.isSelectedAsProgramEligibilityCriteria).toEqual(true);
      });
    });

    describe('searchPrograms', () => {
      it('should call storage actions with proper parameters', async () => {
        await mountWrapper();
        await wrapper.vm.searchPrograms();

        expect(wrapper.vm.combinedProgramStore.search).toHaveBeenCalledWith({
          filter: {
            'Entity/EventId': assessmentForm.eventId,
          },
        }, null, true);

        expect(wrapper.vm.combinedProgramStore.getByIds).toHaveBeenCalledWith(['1', '2']);

        expect(wrapper.vm.programs).toEqual(wrapper.vm.combinedProgramStore.getByIds().map((t) => t.entity));
      });
    });

    describe('deleteScoring', () => {
      it('removes the range', async () => {
        await mountWrapper();
        const copy = [...wrapper.vm.localAssessment.scoringRanges];
        const range = wrapper.vm.localAssessment.scoringRanges[1];
        wrapper.vm.deleteScoring(range);
        expect(wrapper.vm.localAssessment.scoringRanges.length).toBe(copy.length - 1);
        expect(wrapper.vm.localAssessment.scoringRanges.find((x) => x === range)).toBeFalsy();
      });

      it('emits data-removed when scoring is removed', async () => {
        await mountWrapper();
        const range = wrapper.vm.localAssessment.scoringRanges[1];
        wrapper.vm.deleteScoring(range);
        expect(wrapper.emitted('update:data-removed')?.length).toBe(1);
      });
    });

    describe('addNewScoring', () => {
      it('pushes an empty range', async () => {
        await mountWrapper();
        wrapper.vm.localAssessment.scoringRanges.push = jest.fn();
        wrapper.vm.addNewScoring();
        expect(wrapper.vm.localAssessment.scoringRanges.push).toHaveBeenCalledWith({
          label: utils.initMultilingualAttributes(),
          maxValue: null,
          minValue: null,
        });
      });
    });

    describe('isRangeValid', () => {
      it('checks for valid ranges', async () => {
        await mountWrapper();
        const ranges = wrapper.vm.localAssessment.scoringRanges;
        ranges[0].minValue = '1';
        ranges[0].maxValue = '5';
        ranges[1].minValue = '6';
        ranges[1].maxValue = '6';
        expect(wrapper.vm.isRangeValid(0)).toEqual({ isValid: true });
        expect(wrapper.vm.isRangeValid(1)).toEqual({ isValid: true });

        ranges[1].minValue = '8';
        expect(wrapper.vm.isRangeValid(1)).toEqual({ isValid: false, messageKey: 'assessmentTemplate.invalidRange' });

        ranges[1].minValue = '2';
        expect(wrapper.vm.isRangeValid(0)).toEqual({ isValid: false, messageKey: 'assessmentTemplate.rangeOverlap' });
      });
    });
  });
});
