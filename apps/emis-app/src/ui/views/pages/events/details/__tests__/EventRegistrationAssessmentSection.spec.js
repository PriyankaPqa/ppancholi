import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockEventEntity } from '@libs/entities-lib/event';
import { mockStorage } from '@/storage';
import { useMockEventStore } from '@/pinia/event/event.mock';

import Component from '../components/EventRegistrationAssessmentSection.vue';

const localVue = createLocalVue();

const mockEvent = mockEventEntity();
const storage = mockStorage();

describe('EventRegistrationAssessmentSection.vue', () => {
  let wrapper;
  const { pinia, eventStore } = useMockEventStore();

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    jest.clearAllMocks();
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        registrationAssessment: mockEvent.registrationAssessments[0],
        eventId: 'eventId',
        index: 0,
      },
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
    await mountWrapper();
  });

  describe('computed', () => {
    describe('assessment', () => {
      it('calls getter', () => {
        jest.clearAllMocks();
        wrapper.vm.registrationAssessment.assessmentId = 'myid';
        const assessment = wrapper.vm.assessment;
        expect(storage.assessmentForm.getters.get).toHaveBeenCalledWith('myid');
        expect(assessment).toEqual(storage.assessmentForm.getters.get().entity);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('calls fetch for assessment', () => {
        expect(storage.assessmentForm.actions.fetch).toHaveBeenCalledWith({ id: wrapper.vm.registrationAssessment.assessmentId });
      });
    });
  });

  describe('Methods', () => {
    describe('deleteRegistrationAssessment', () => {
      it('calls storage action deleteRegistrationAssessment with the right payload', async () => {
        await wrapper.vm.deleteRegistrationAssessment();
        expect(eventStore.deleteRegistrationAssessment).toHaveBeenCalledWith({
          eventId: wrapper.vm.eventId,
          registrationAssessmentId: wrapper.vm.registrationAssessment.id,
        });
      });

      it('does not calls storage action deleteRegistrationAssessment if not confirmed', async () => {
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.deleteRegistrationAssessment();
        expect(eventStore.deleteRegistrationAssessment).not.toHaveBeenCalled();
      });
    });
  });
});
