import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockEventEntity } from '@libs/entities-lib/event';
import { mockStorage } from '@/storage';
import { mockProvider } from '@/services/provider';
import { MAX_LENGTH_MD, MAX_LENGTH_LG } from '@libs/shared-lib/constants/validations';
import entityUtils from '@libs/entities-lib/utils';
import { EEventSummarySections } from '@/types';
import { useMockEventStore } from '@/pinia/event/event.mock';

import { mockCombinedAssessmentForms } from '@libs/entities-lib/assessment-template';
import Component from '../components/EventRegistrationAssessmentDialog.vue';

const localVue = createLocalVue();

const mockEvent = mockEventEntity();
const services = mockProvider();
const storage = mockStorage();

services.assessmentForms.search = jest.fn(() => ({ value: mockCombinedAssessmentForms() }));

describe('EventRegistrationAssessmentDialog.vue', () => {
  let wrapper;
  const { pinia, eventStore } = useMockEventStore();

  // eslint-disable-next-line max-params
  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', isEditMode = true, additionalOverwrites = {}) => {
    jest.clearAllMocks();
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        event: mockEvent,
        id: mockEvent.registrationAssessments[0].id,
        isEditMode,
      },
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
        $hasRole: (r) => r === hasRole,
        $storage: storage,
        $services: services,
      },
      ...additionalOverwrites,
    });

    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    await mountWrapper();
  });

  describe('computed', () => {
    describe('rules', () => {
      it('returns rules', () => {
        const rules = wrapper.vm.rules;
        expect(rules.assessment.required).toBeTruthy();
        expect(rules.sectionTitle.required).toBeTruthy();
        expect(rules.sectionTitle.max).toBe(MAX_LENGTH_MD);
        expect(rules.details.max).toBe(MAX_LENGTH_LG);
      });
    });

    describe('title', () => {
      it('returns according to edit mode', async () => {
        expect(wrapper.vm.title).toEqual('eventSummary.editRegistrationAssessment');
        await wrapper.setProps({ isEditMode: false });
        expect(wrapper.vm.title).toEqual('eventSummary.addRegistrationAssessment');
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('calls search for assessmentForms', () => {
        const assessments = wrapper.vm.$services.assessmentForms.search().value.map((a) => a.entity);
        assessments.forEach((a) => {
          a.nameWithStatus = 'Assessment Floods 2021 [enums.assessmentPublishStatus.Published]';
        });
        expect(wrapper.vm.$services.assessmentForms.search).toHaveBeenCalledWith({
          filter: { 'Entity/EventId': wrapper.vm.event.id },
          orderBy: `Entity/Name/Translation/${wrapper.vm.$i18n.locale}`,
        });

        expect(wrapper.vm.assessments).toEqual(assessments);
      });

      it('sets data in creation mode', async () => {
        await mountWrapper(false, 6, 'role', false);
        expect(wrapper.vm.sectionTitle).toEqual({
          translation: {
            en: 'eventSummary.registrationAssessment.defaultTitle',
            fr: 'eventSummary.registrationAssessment.defaultTitle',
          },
        });
        expect(wrapper.vm.sectionDetails).toEqual({
          translation: {
            en: 'eventSummary.registrationAssessment.defaultDescription',
            fr: 'eventSummary.registrationAssessment.defaultDescription',
          },
        });
        expect(wrapper.vm.selectedAssessment).toBeFalsy();
      });

      it('sets data in edit mode', () => {
        expect(wrapper.vm.registrationAssessment).toEqual(wrapper.vm.event.registrationAssessments[0]);
        expect(wrapper.vm.sectionTitle).toEqual(wrapper.vm.registrationAssessment.sectionTitle);
        expect(wrapper.vm.sectionDetails).toEqual(wrapper.vm.registrationAssessment.details);
      });
    });
  });

  describe('Methods', () => {
    describe('fillEmptyMultilingualFields', () => {
      it('calls entityUtils.getFilledMultilingualField and assigns the result to title and detail', async () => {
        const spy = jest.spyOn(entityUtils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-name-en' } }));
        await wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.sectionTitle).toEqual({ translation: { en: 'mock-name-en' } });
        expect(wrapper.vm.sectionDetails).toEqual({ translation: { en: 'mock-name-en' } });
        spy.mockRestore();
      });

      describe('clearDescription', () => {
        it('clears sectionDetails', () => {
          expect(wrapper.vm.sectionDetails).not.toEqual({
            translation: {
              en: '',
              fr: '',
            },
          });
          wrapper.vm.clearDescription();
          expect(wrapper.vm.sectionDetails).toEqual({
            translation: {
              en: '',
              fr: '',
            },
          });
        });
      });
    });

    describe('onSubmit', () => {
      beforeEach(async () => {
        await wrapper.setData({ selectedAssessment: { id: 'abc' } });
      });

      it('calls fillEmptyMultilingualFields only if isValid is true', async () => {
        jest.spyOn(wrapper.vm, 'fillEmptyMultilingualFields').mockImplementation(() => {});
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.fillEmptyMultilingualFields).toHaveBeenCalledTimes(1);
      });

      it('does not call fillEmptyMultilingualFields  if isValid is false', async () => {
        jest.spyOn(wrapper.vm, 'fillEmptyMultilingualFields').mockImplementation(() => {});
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.fillEmptyMultilingualFields).toHaveBeenCalledTimes(0);
      });

      it('does not call submitRegistrationAssessment if validate is false', async () => {
        jest.spyOn(wrapper.vm, 'submitRegistrationAssessment').mockImplementation(() => {});
        wrapper.vm.$refs.form.validate = jest.fn(() => false);

        await wrapper.vm.onSubmit();
        expect(wrapper.vm.submitRegistrationAssessment).toHaveBeenCalledTimes(0);
      });

      it('calls submitRegistrationAssessment if validate is true', async () => {
        jest.spyOn(wrapper.vm, 'submitRegistrationAssessment').mockImplementation(() => {});
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.onSubmit();
        expect(wrapper.vm.submitRegistrationAssessment).toHaveBeenCalledTimes(1);
      });
    });

    describe('submitRegistrationAssessment', () => {
      it('calls the storage action updateEventSection with the right payload', async () => {
        await wrapper.setData({ selectedAssessment: { id: 'abc' } });
        await wrapper.vm.submitRegistrationAssessment();

        expect(eventStore.updateEventSection).toHaveBeenCalledWith({
          eventId: wrapper.vm.event.id,
          payload: {
            ...wrapper.vm.registrationAssessment,
            assessmentId: wrapper.vm.selectedAssessment.id,
            sectionTitle: wrapper.vm.sectionTitle,
            details: wrapper.vm.sectionDetails,
          },
          section: EEventSummarySections.RegistrationAssessment,
          action: 'edit',
        });
      });
    });
  });
});
