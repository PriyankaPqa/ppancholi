import { mockStorage } from '@/store/storage/storage.mock';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import Component from './CompleteAssessmentLib.vue';

const localVue = createLocalVue();

const storage = mockStorage();
storage.registration.getters.currentTab = jest.fn(() => ({ titleKey: 'mock title', nextButtonTextKey: 'mock text' }));

describe('CompleteAssessmentLib.vue', () => {
  let wrapper;

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('currentTab', () => {
      it('calls storage', async () => {
        const tab = wrapper.vm.currentTab;
        expect(storage.registration.getters.currentTab).toHaveBeenCalled();
        expect(tab).toEqual(storage.registration.getters.currentTab());
      });
    });

    describe('registrationAssessment', () => {
      it('calls storage', async () => {
        const registrationAssessment = wrapper.vm.registrationAssessment;
        expect(storage.registration.getters.assessmentToComplete).toHaveBeenCalled();
        expect(registrationAssessment).toEqual(storage.registration.getters.assessmentToComplete().registrationAssessment);
      });
    });
  });
});
