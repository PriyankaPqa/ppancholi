import { createLocalVue, shallowMount } from '@/test/testSetup';
import Component from './CompleteAssessmentLib.vue';

const localVue = createLocalVue();
describe('CompleteAssessmentLib.vue', () => {
  let wrapper;

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
      });

      wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => ({ titleKey: 'mock title', nextButtonTextKey: 'mock text' }));
    });

    describe('currentTab', () => {
      it('calls $registrationStore', async () => {
        const tab = wrapper.vm.currentTab;
        expect(wrapper.vm.$registrationStore.getCurrentTab).toHaveBeenCalled();
        expect(tab).toEqual({ titleKey: 'mock title', nextButtonTextKey: 'mock text' });
      });
    });

    describe('registrationAssessment', () => {
      it('calls $registrationStore', async () => {
        const registrationAssessment = wrapper.vm.registrationAssessment;
        expect(wrapper.vm.$registrationStore.getAssessmentToComplete).toHaveBeenCalled();
        expect(registrationAssessment).toEqual(wrapper.vm.$registrationStore.getAssessmentToComplete().registrationAssessment);
      });
    });
  });
});
