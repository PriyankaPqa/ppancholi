import { shallowMount, mount, createLocalVue } from '@/test/testSetup';
import { mockProvider } from '@/services/provider';
import { mockEventEntity } from '@libs/entities-lib/event';
import { AssessmentFormEntity, mockAssessmentFormEntity } from '@libs/entities-lib/assessment-template';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import { useMockAssessmentFormStore } from '@/pinia/assessment-form/assessment-form.mock';
import { createTestingPinia } from '@pinia/testing';
import { useMockProgramStore } from '@/pinia/program/program.mock';
import Component from './AssessmentTemplatePreview.vue';

const localVue = createLocalVue();
const services = mockProvider();
const mockAssessment = mockAssessmentFormEntity();
let wrapper;
const pinia = createTestingPinia({ stubActions: false });
const tenantSettingsStore = useMockTenantSettingsStore(pinia).tenantSettingsStore;
const assessmentFormStore = useMockAssessmentFormStore(pinia).assessmentFormStore;
const programStore = useMockProgramStore(pinia).programStore;

const doMount = (otherOptions = {}, fullMount = false) => {
  const options = {
    localVue,
    pinia,
    propsData: {
      show: true,
      event: mockEventEntity({ id: 'mock-id-1' }),
      assessment: mockAssessmentFormEntity({ id: 'mock-id-1' }),
    },
    mocks: {
      $services: services,
    },
    ...otherOptions,
  };

  wrapper = (fullMount ? mount : shallowMount)(Component, options);
};

describe('AssessmentTemplatePreview', () => {
  describe('Watch', () => {
    describe('assessment', () => {
      it('set assessment template if assessment changes', async () => {
        doMount();
        wrapper.vm.loadSurvey = jest.fn();
        await wrapper.setProps({ assessment: mockAssessment });
        expect(wrapper.vm.assessment).toEqual(mockAssessment);
        expect(wrapper.vm.loadSurvey).toHaveBeenCalled();
      });
    });
  });

  describe('mounted', () => {
    it('load survey', async () => {
      doMount();
      wrapper.vm.initialize = jest.fn();
      wrapper.vm.loadDetails = jest.fn();
      await wrapper.vm.loadSurvey();
      expect(wrapper.vm.initialize).toHaveBeenCalled();
      expect(wrapper.vm.loadDetails).toHaveBeenCalled();
    });
  });

  describe('Methods', () => {
    describe('close', () => {
      it('emits show false', async () => {
        doMount();
        wrapper.vm.initialize = jest.fn();
        await wrapper.vm.close();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });

    describe('initialize', () => {
      it('sets survey object', async () => {
        doMount();
        const hook = wrapper.vm.$options.mounted[wrapper.vm.$options.mounted.length - 1];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.survey).not.toBeNull();
      });

      it('sets color scheme', async () => {
        doMount();
        wrapper.vm.surveyJsHelper.setColorScheme = jest.fn();
        const hook = wrapper.vm.$options.mounted[wrapper.vm.$options.mounted.length - 1];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.surveyJsHelper.setColorScheme).toHaveBeenCalledWith(
          '#surveyContainer',
          tenantSettingsStore.currentTenantSettings.branding.colours,
        );
      });
    });

    describe('loadSurvey', () => {
      it('calls loadDetails', async () => {
        doMount();
        wrapper.vm.loadDetails = jest.fn();
        await wrapper.vm.loadSurvey();
        expect(wrapper.vm.loadDetails).toHaveBeenCalled();
      });
      it('calls initialize', async () => {
        doMount();
        wrapper.vm.initialize = jest.fn();
        await wrapper.vm.loadSurvey();
        expect(wrapper.vm.initialize).toHaveBeenCalled();
      });
    });

    describe('loadDetails', () => {
      it('fetches from correct store', async () => {
        doMount();
        await wrapper.setProps({ eventId: '044fcd68-3d70-4a3a-b5c8-22da9e01730f' });
        await wrapper.vm.loadDetails();
        expect(assessmentFormStore.fetch).toHaveBeenCalledWith({ id: wrapper.vm.assessment.id });
        expect(wrapper.vm.assessmentTemplate).toEqual(new AssessmentFormEntity(assessmentFormStore.fetch()));
      });

      it('fetches the program if one is associated', async () => {
        doMount();
        await wrapper.vm.loadDetails();
        expect(programStore.fetch).toHaveBeenCalledWith(
          { id: wrapper.vm.assessmentTemplate.programId, eventId: wrapper.vm.assessmentTemplate.eventId },
        );
      });
    });
  });
});
