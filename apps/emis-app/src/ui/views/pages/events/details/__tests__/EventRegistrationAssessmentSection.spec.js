import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockEventEntity } from '@libs/entities-lib/event';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { useMockAssessmentFormStore } from '@/pinia/assessment-form/assessment-form.mock';
import { createTestingPinia } from '@pinia/testing';

import Component from '../components/EventRegistrationAssessmentSection.vue';

const localVue = createLocalVue();
let pinia = createTestingPinia({ stubActions: false });
let assessmentFormStore = useMockAssessmentFormStore(pinia).assessmentFormStore;
let eventStore = useMockEventStore(pinia).eventStore;

const mockEvent = mockEventEntity();

describe('EventRegistrationAssessmentSection.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    jest.clearAllMocks();
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        registrationAssessment: mockEvent.registrationAssessments[0],
        eventId: 'eventId',
        index: 0,
        canEdit: true,
      },
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
        $hasRole: (r) => r === hasRole,

      },
      ...additionalOverwrites,
    });

    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    pinia = createTestingPinia({ stubActions: false });
    assessmentFormStore = useMockAssessmentFormStore(pinia).assessmentFormStore;
    eventStore = useMockEventStore(pinia).eventStore;
    await mountWrapper();
  });

  describe('computed', () => {
    describe('assessment', () => {
      it('calls getter', () => {
        jest.clearAllMocks();
        wrapper.vm.registrationAssessment.assessmentId = 'myid';
        const assessment = wrapper.vm.assessment;
        expect(assessmentFormStore.getById).toHaveBeenCalledWith('myid');
        expect(assessment).toEqual(assessmentFormStore.getById());
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('calls fetch for assessment', () => {
        expect(assessmentFormStore.fetch).toHaveBeenCalledWith({ id: wrapper.vm.registrationAssessment.assessmentId });
      });
    });
  });

  describe('Methods', () => {
    describe('deleteRegistrationAssessment', () => {
      it('calls the store action deleteRegistrationAssessment with the right payload', async () => {
        await wrapper.vm.deleteRegistrationAssessment();
        expect(eventStore.deleteRegistrationAssessment).toHaveBeenCalledWith({
          eventId: wrapper.vm.eventId,
          registrationAssessmentId: wrapper.vm.registrationAssessment.id,
        });
      });

      it('does not calls the store action deleteRegistrationAssessment if not confirmed', async () => {
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.deleteRegistrationAssessment();
        expect(eventStore.deleteRegistrationAssessment).not.toHaveBeenCalled();
      });
    });
  });
});
