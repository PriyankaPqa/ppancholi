import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { ProgramEntity } from '@libs/entities-lib/program';
import { mockAssessmentFormEntity } from '@libs/entities-lib/assessment-template';
import { MAX_LENGTH_MD, MAX_LENGTH_LG } from '@libs/shared-lib/constants/validations';
import { Status } from '@libs/entities-lib/base';
import { useMockAssessmentFormStore } from '@/pinia/assessment-form/assessment-form.mock';
import { createTestingPinia } from '@pinia/testing';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

import Component from '../ProgramForm.vue';

const localVue = createLocalVue();
let pinia = createTestingPinia({ stubActions: false });
let assessmentFormStore = useMockAssessmentFormStore(pinia).assessmentFormStore;

describe('ProgramForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    pinia = createTestingPinia({ stubActions: false });
    assessmentFormStore = useMockAssessmentFormStore(pinia).assessmentFormStore;
    jest.clearAllMocks();
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          isEditMode: false,
          program: new ProgramEntity(),
          isNameUnique: true,
          isDirty: false,
        },

      });
    });

    describe('isStatusActive', () => {
      it('returns true for Active programs', async () => {
        await wrapper.setData({
          localProgram: {
            ...wrapper.vm.localProgram,
            status: Status.Active,
          },
        });

        expect(wrapper.vm.isStatusActive).toBe(true);
      });

      it('returns false for Inactive programs', async () => {
        await wrapper.setData({
          localProgram: {
            ...wrapper.vm.localProgram,
            status: Status.Inactive,
          },
        });

        expect(wrapper.vm.isStatusActive).toBe(false);
      });

      it('sets the program to Active when passed true', () => {
        wrapper.vm.isStatusActive = true;

        expect(wrapper.vm.localProgram.status).toBe(Status.Active);
      });

      it('sets the program to Inactive when passed false', () => {
        wrapper.vm.isStatusActive = false;

        expect(wrapper.vm.localProgram.status).toBe(Status.Inactive);
      });
    });

    describe('statusColor', () => {
      it('returns the correct value for an active program', async () => {
        await wrapper.setData({
          localProgram: {
            ...wrapper.vm.localProgram,
            status: Status.Active,
          },
        });

        expect(wrapper.vm.statusColor).toBe('status_success white--text');
      });

      it('returns the correct value for an inactive program', async () => {
        await wrapper.setData({
          localProgram: {
            ...wrapper.vm.localProgram,
            status: Status.Inactive,
          },
        });

        expect(wrapper.vm.statusColor).toBe('status_green_pale black--text');
      });
    });

    describe('assessmentFormItems', () => {
      it('returns the correct select item for an active assessment form', async () => {
        const assessmentFormEntity = mockAssessmentFormEntity();

        await wrapper.setData({
          assessmentForms: [{
            ...assessmentFormEntity,
            status: Status.Active,
          }],
        });

        const assessmentFormItems = wrapper.vm.assessmentFormItems;
        expect(assessmentFormItems).toEqual([{ text: wrapper.vm.$m(assessmentFormEntity.name), value: assessmentFormEntity.id }]);
      });

      it('returns the correct select item for an inactive assessment form', async () => {
        const assessmentFormEntity = mockAssessmentFormEntity();

        await wrapper.setData({
          assessmentForms: [{
            ...assessmentFormEntity,
            status: Status.Inactive,
          }],
        });

        const assessmentFormItems = wrapper.vm.assessmentFormItems;
        let itemText = wrapper.vm.$m(assessmentFormEntity.name);
        itemText += ` (${wrapper.vm.$t('enums.Status.Inactive')})`;
        expect(assessmentFormItems).toEqual([{ text: itemText, value: assessmentFormEntity.id }]);
      });
    });
  });

  describe('created', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          isEditMode: false,
          program: new ProgramEntity(),
          isNameUnique: true,
          isDirty: false,
        },

      });
    });

    it('calls method to fetch and set assessment forms when is editing', async () => {
      await wrapper.setProps({
        isEditMode: true,
      });

      await wrapper.setData({
        localProgram: {
          ...wrapper.vm.localProgram,
          id: 'PROGRAM_ID',
        },
        assessmentForms: [],
      });

      const hook = wrapper.vm.$options.created[0];
      await hook.call(wrapper.vm);

      expect(assessmentFormStore.fetchByProgramId).toHaveBeenCalledTimes(1);
      expect(assessmentFormStore.fetchByProgramId).toHaveBeenCalledWith('PROGRAM_ID');
      expect(wrapper.vm.assessmentForms).toEqual(await assessmentFormStore.fetchByProgramId());
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          isEditMode: false,
          program: new ProgramEntity(),
          isNameUnique: false,
          isDirty: false,
        },
      });
    });

    describe('setLanguageMode', () => {
      it('sets the value of language mode', () => {
        wrapper.vm.setLanguageMode('de');
        expect(wrapper.vm.languageMode).toBe('de');
      });

      it('causes the program entity to fill multilingual attributes', () => {
        const spy = jest.spyOn(wrapper.vm.localProgram, 'fillEmptyMultilingualAttributes');
        wrapper.vm.setLanguageMode('de');
        expect(wrapper.vm.localProgram.fillEmptyMultilingualAttributes).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe('resetAsUnique', () => {
      it('emits the update:is-name-unique event', () => {
        wrapper.vm.resetAsUnique();
        expect(wrapper.emitted('update:is-name-unique').length).toBe(1);
        expect(wrapper.emitted('update:is-name-unique')[0]).toEqual([true]);
      });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        pinia,
        propsData: {
          isEditMode: false,
          program: new ProgramEntity(),
          isNameUnique: true,
          isDirty: false,
        },
      });
    });

    test('program name is required', async () => {
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findTextFieldWithValidation('program-name');
      expect(el.classes('invalid')).toBe(true);
    });

    test('the program name has a max length of MAX_LENGTH_MD', async () => {
      wrapper.vm.localProgram.name.translation[wrapper.vm.languageMode] = 'x'.repeat(MAX_LENGTH_MD + 1);
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findTextFieldWithValidation('program-name');
      expect(el.classes('invalid')).toBe(true);
    });

    test('the paymentModalities select is required', async () => {
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findSelectWithValidation('payment-modalities');
      expect(el.classes('invalid')).toBe(true);
    });

    test('the description is required', async () => {
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findTextFieldWithValidation('program-description');
      expect(el.classes('invalid')).toBe(true);
    });

    test('the description has a max length of MAX_LENGTH_LG', async () => {
      wrapper.vm.localProgram.description.translation[wrapper.vm.langaugeMode] = 'x'.repeat(MAX_LENGTH_LG + 1);
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findTextFieldWithValidation('program-description');
      expect(el.classes('invalid')).toBe(true);
    });

    test('the assessmentForms select is required when completedAssessments checkbox is checked', async () => {
      await wrapper.setProps({
        isEditMode: true,
      });

      await wrapper.setData({
        assessmentForms: [mockAssessmentFormEntity()],
      });

      const elCheckbox = wrapper.findDataTest('program-eligibility-hasCompletedAssessments');
      elCheckbox.setChecked();
      expect(elCheckbox.element.checked).toBe(true);

      wrapper.vm.localProgram.eligibilityCriteria.completedAssessments = true;
      expect(wrapper.vm.localProgram.eligibilityCriteria.completedAssessments).toBe(true);

      await wrapper.vm.$refs.form.validate();
      const elSelect = wrapper.findSelectWithValidation('program-selectAssessment');
      expect(elSelect.classes('invalid')).toBe(true);
    });
  });

  describe('Completed assessments disabled', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        pinia,
        propsData: {
          isEditMode: false,
          program: new ProgramEntity(),
          isNameUnique: true,
          isDirty: false,
        },
      });
    });

    test('the completedAssessments checkbox is disabled when is not editing', async () => {
      await wrapper.setData({
        assessmentForms: [mockAssessmentFormEntity()],
      });

      const el = wrapper.findDataTest('program-eligibility-hasCompletedAssessments');
      expect(el.element).toHaveProperty('disabled', true);
    });

    test('the completedAssessments checkbox is disabled when assessment forms list is empty', async () => {
      await wrapper.setProps({
        isEditMode: true,
      });

      const el = wrapper.findDataTest('program-eligibility-hasCompletedAssessments');
      expect(el.element).toHaveProperty('disabled', true);
    });

    test('the completedAssessmentIds select is disabled when is not editing', async () => {
      await wrapper.setData({
        assessmentForms: [mockAssessmentFormEntity()],
      });

      wrapper.vm.localProgram.eligibilityCriteria.completedAssessments = true;

      const el = wrapper.findDataTest('program-selectAssessment');
      expect(el.attributes('disabled')).toBe('disabled');
    });

    test('the completedAssessmentIds select is disabled when assessment forms list is empty', async () => {
      await wrapper.setProps({
        isEditMode: true,
      });

      wrapper.vm.localProgram.eligibilityCriteria.completedAssessments = true;

      const el = wrapper.findDataTest('program-selectAssessment');
      expect(el.attributes('disabled')).toBe('disabled');
    });

    test('the completedAssessmentIds select is disabled when the completedAssessments checkbox is not checked', async () => {
      await wrapper.setProps({
        isEditMode: true,
      });

      await wrapper.setData({
        assessmentForms: [mockAssessmentFormEntity()],
      });

      wrapper.vm.localProgram.eligibilityCriteria.completedAssessments = false;

      const el = wrapper.findDataTest('program-selectAssessment');
      expect(el.attributes('disabled')).toBe('disabled');
    });
  });

  describe('Program use for lodging checkbox', () => {
    it('should be rendered when feature flag Lodging is on', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          isEditMode: false,
          program: new ProgramEntity(),
          isNameUnique: true,
          isDirty: false,
        },
        featureList: [FeatureKeys.Lodging],
      });

      const element = wrapper.findDataTest('program-useForLodging');
      expect(element.exists()).toBeTruthy();
    });

    it('should not be rendered when feature flag Lodging is off', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          isEditMode: false,
          program: new ProgramEntity(),
          isNameUnique: true,
          isDirty: false,
        },
        featureList: [],
      });

      const element = wrapper.findDataTest('program-useForLodging');
      expect(element.exists()).toBeFalsy();
    });

    it('approval required checkbox should be disabled when use for lodging is checked', async () => {
      const currentProgram = new ProgramEntity();
      currentProgram.useForLodging = true;

      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          isEditMode: false,
          program: currentProgram,
          isNameUnique: true,
          isDirty: false,
        },
        featureList: [FeatureKeys.Lodging],
      });

      const element = wrapper.findDataTest('program-approvalRequired');
      expect(element.attributes('disabled')).toBeTruthy();
    });

    it('approval required checkbox not should be disabled when use for lodging is unchecked', async () => {
      const currentProgram = new ProgramEntity();
      currentProgram.useForLodging = false;

      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          isEditMode: false,
          program: currentProgram,
          isNameUnique: true,
          isDirty: false,
        },
        featureList: [FeatureKeys.Lodging],
      });

      const element = wrapper.findDataTest('program-approvalRequired');
      expect(element.attributes('disabled')).toBeFalsy();
    });

    it('approval required checkbox should be unchecked when use for lodging is checked', async () => {
      const currentProgram = new ProgramEntity();
      currentProgram.approvalRequired = true;
      currentProgram.useForLodging = false;

      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          isEditMode: false,
          program: currentProgram,
          isNameUnique: true,
          isDirty: false,
        },
        featureList: [FeatureKeys.Lodging],
      });

      await wrapper.setData({
        localProgram: {
          useForLodging: true,
        },
      });

      expect(wrapper.vm.localProgram.approvalRequired).toEqual(false);
    });
  });

  describe('watch', () => {
    describe('program lodging', () => {
      it('should only update program approval required to false when program lodging is updated to true', async () => {
        const currentProgram = new ProgramEntity();
        currentProgram.approvalRequired = true;
        currentProgram.useForLodging = true;

        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            isEditMode: false,
            program: currentProgram,
            isNameUnique: true,
            isDirty: false,
          },
          featureList: [FeatureKeys.Lodging],
        });

        await wrapper.setData({
          localProgram: {
            useForLodging: false,
          },
        });

        expect(wrapper.vm.localProgram.approvalRequired).toEqual(true);

        await wrapper.setData({
          localProgram: {
            useForLodging: true,
          },
        });

        expect(wrapper.vm.localProgram.approvalRequired).toEqual(false);
      });
    });
  });
});
