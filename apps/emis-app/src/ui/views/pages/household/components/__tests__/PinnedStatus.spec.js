import { createLocalVue, shallowMount } from '@/test/testSetup';
import { HouseholdActivityType, mockHouseholdActivities } from '@libs/entities-lib/value-objects/household-activity';
import Component from '../PinnedStatus.vue';

const localVue = createLocalVue();

describe('PinnedStatus.vue', () => {
  let wrapper;
  const doMount = () => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        pinnedHouseholdStatusActivity: mockHouseholdActivities(HouseholdActivityType.StatusChanged)[0],
      },
    });
  };
  beforeEach(() => {
    doMount();
  });

  describe('Template', () => {
    describe('rationale', () => {
      it('should display correct data', () => {
        const element = wrapper.findDataTest('rationale');
        expect(element.text()).toEqual('Test-reopen');
      });
    });
  });

  describe('Computed', () => {
    describe('householdStatusActionAndUserInfo', () => {
      it('should return correct string', async () => {
        expect(wrapper.vm.householdStatusActionAndUserInfo).toEqual('household.status.pinned_information.Open John Smith (sys admin) - Jan 1, 2021');
      });
    });
  });
});
