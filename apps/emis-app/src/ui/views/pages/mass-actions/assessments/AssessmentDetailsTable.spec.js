import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockCombinedMassAction, mockMassActionEntity } from '@libs/entities-lib/mass-action';
import { mockEventEntity } from '@libs/entities-lib/event';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { useMockAssessmentFormStore } from '@/pinia/assessment-form/assessment-form.mock';
import { mockAssessmentFormEntity } from '@libs/entities-lib/assessment-template';

import Component from './AssessmentDetailsTable.vue';

const localVue = createLocalVue();

const { pinia, eventStore } = useMockEventStore();
const { assessmentFormStore } = useMockAssessmentFormStore(pinia);

describe('AssessmentDetailsTable.vue', () => {
  let wrapper;

  const doMount = (shallow, otherData) => {
    const massAction = mockMassActionEntity();
    massAction.details.emailSubject = { translation: { en: 'bonjour hi' } };
    massAction.details.emailAdditionalDescription = { translation: { en: 'hello' } };
    const options = {
      localVue,
      pinia,
      propsData: {
        massAction,
      },
      data() {
        return {
          ...otherData,
        };
      },
    };
    if (shallow === true) {
      wrapper = shallowMount(Component, options);
    } else {
      wrapper = mount(Component, options);
    }
  };

  describe('Computed', () => {
    beforeEach(() => {
      doMount(true, {
        event: mockEventEntity(),
        assessment: mockAssessmentFormEntity(),
      });
    });
    describe('rows', () => {
      it('should return proper rows', () => {
        expect(wrapper.vm.rows).toEqual([
          {
            label: 'massActions.financialAssistance.create.event.label',
            value: mockEventEntity().name.translation.en,
            dataTest: 'event',
            loading: wrapper.vm.eventLoading,
          },
          {
            label: 'massActions.assessment.create.assessment.label',
            value: mockAssessmentFormEntity().name.translation.en,
            dataTest: 'assessment',
            loading: wrapper.vm.assessmentLoading,
          },
          {
            label: 'massActions.assessment.create.emailSubject.label',
            value: 'bonjour hi',
            dataTest: 'emailSubject',
          },
          {
            label: 'massActions.assessment.create.emailText.label',
            html: 'hello',
            dataTest: 'emailAdditionalDescription',
          },
        ]);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      doMount(true);
    });
    describe('fetchEvent', () => {
      it('should fetch the event', async () => {
        const id = mockCombinedMassAction().entity.details.eventId;
        await wrapper.vm.fetchEvent();
        expect(eventStore.fetch).toHaveBeenCalledWith(id);
      });
    });

    describe('fetchAssessment', () => {
      it('should fetch the assessment', async () => {
        const id = mockCombinedMassAction().entity.details.assessmentFormId;
        await wrapper.vm.fetchAssessment();
        expect(assessmentFormStore.fetch).toHaveBeenCalledWith({ id });
      });
    });
  });

  describe('Lifecycle', () => {
    beforeEach(() => {
      doMount(true);
    });
    describe('created', () => {
      it('fetches all data', async () => {
        jest.clearAllMocks();
        wrapper.vm.fetchEvent = jest.fn();
        wrapper.vm.fetchAssessment = jest.fn();

        await wrapper.vm.$options.created[0].call(wrapper.vm);

        expect(wrapper.vm.fetchEvent).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.fetchAssessment).toHaveBeenCalledTimes(1);
      });
    });
  });
});
