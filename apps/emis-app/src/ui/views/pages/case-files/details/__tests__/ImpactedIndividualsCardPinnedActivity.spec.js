import { createLocalVue, shallowMount } from '@/test/testSetup';
import { CaseFileActivityType, mockCaseFileActivities } from '@libs/entities-lib/case-file';
import Component from '../case-file-impacted-individuals/components/ImpactedIndividualsCardPinnedActivity.vue';

const localVue = createLocalVue();

describe('ImpactedIndividualsCardPinnedActivity.vue', () => {
  let wrapper;

  const doMount = (caseFileActivityType) => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        pinnedActivity: mockCaseFileActivities(caseFileActivityType)[0],
      },
    });
  };

  describe('Computed', () => {
    describe('rationaleActionAndUserInfo', () => {
      it('should return proper data', () => {
        doMount(CaseFileActivityType.ImpactedIndividualReceivingAssistance);
        expect(wrapper.vm.rationaleAndUserInfo).toEqual('impactedIndividuals.pinned_rationale.by Jane Doe (sys admin) common.on May 4, 2021');
      });
    });
  });

  describe('Template', () => {
    describe('impacted_individuals_pinned_activity_action', () => {
      it('should display proper content when activity type is ImpactedIndividualReceivingAssistance', () => {
        doMount(CaseFileActivityType.ImpactedIndividualReceivingAssistance);
        const element = wrapper.findDataTest('impacted_individuals_pinned_activity_action');
        expect(element.text()).toEqual('impactedIndividuals.pinned_rationale.receiving_assistance');
      });

      it('should display proper content when activity type is ImpactedIndividualNoLongerReceivingAssistance', () => {
        doMount(CaseFileActivityType.ImpactedIndividualNoLongerReceivingAssistance);
        const element = wrapper.findDataTest('impacted_individuals_pinned_activity_action');
        expect(element.text()).toEqual('impactedIndividuals.pinned_rationale.no_longer_receiving_assistance');
      });
    });
  });
});
