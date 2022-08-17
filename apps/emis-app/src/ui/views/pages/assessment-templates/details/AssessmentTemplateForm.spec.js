import _sortBy from 'lodash/sortBy';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import { Status } from '@libs/entities-lib/base';
import {
  mockAssessmentFormEntity, mockAssessmentTemplateEntity, PublishStatus, AssessmentFormEntity, AssessmentTemplateEntity,
} from '@libs/entities-lib/assessment-template';
import { mockProgramEntities } from '@libs/entities-lib/program';
import { MAX_LENGTH_MD, MAX_LENGTH_XL } from '@libs/shared-lib/constants/validations';
import Component from './AssessmentTemplateForm.vue';

const localVue = createLocalVue();
let storage = mockStorage();
const assessmentTemplate = mockAssessmentTemplateEntity();
const assessmentForm = mockAssessmentFormEntity();

describe('AssessmentTemplateForm.vue', () => {
  let wrapper;

  // eslint-disable-next-line max-params
  const mountWrapper = async (assessmentTemplate = assessmentForm, fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: { assessmentTemplate, isEditMode: true, isNameUnique: true },
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
            max: MAX_LENGTH_XL,
          },
          messageIfUnavailable: {
            max: MAX_LENGTH_XL,
          },
          frequency: {
            required: wrapper.vm.isFormMode,
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
    });
  });

  describe('Watch', () => {
    describe('localAssessment', () => {
      it('emits when localAssessment is changed', async () => {
        await mountWrapper();

        expect(wrapper.emitted('update:assessmentTemplate').length).toBe(1);

        await wrapper.setData({
          localAssessment: { name: 'newName' },
        });
        expect(wrapper.emitted('update:assessmentTemplate').length).toBe(2);
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

    describe('resetAsUnique', () => {
      it('emits update:is-name-unique to true if it is false', async () => {
        await mountWrapper();
        wrapper.setProps({ isNameUnique: false });
        await wrapper.vm.$nextTick();
        await wrapper.vm.resetAsUnique();
        expect(wrapper.emitted('update:is-name-unique')[0][0]).toBe(true);
      });
    });

    describe('searchPrograms', () => {
      it('should call storage actions with proper parameters', async () => {
        await mountWrapper();
        await wrapper.vm.searchPrograms();

        expect(wrapper.vm.$storage.program.actions.search).toHaveBeenCalledWith({
          filter: {
            'Entity/EventId': assessmentForm.eventId,
          },
        }, null, true);

        expect(wrapper.vm.$storage.program.getters.getByIds).toHaveBeenCalledWith(wrapper.vm.$storage.program.actions.search().ids);

        expect(wrapper.vm.programs).toEqual(wrapper.vm.$storage.program.getters.getByIds().map((t) => t.entity));
      });
    });
  });
});
