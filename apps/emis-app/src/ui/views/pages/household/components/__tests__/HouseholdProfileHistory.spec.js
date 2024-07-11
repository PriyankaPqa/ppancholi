import {
  HouseholdActivity,
  mockHouseholdActivities,
  HouseholdActivityType,
} from '@libs/entities-lib/value-objects/household-activity';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockProvider } from '@/services/provider';
import { system } from '@/constants/system';

import Component from '../HouseholdProfileHistory.vue';

const localVue = createLocalVue();
const services = mockProvider();
const householdActivity = mockHouseholdActivities()[0];
const displayedItem = mockHouseholdActivities()[0];
displayedItem.templateData = [{ label: 'foo', value: 'bar' }];
displayedItem.templatePreviousData = [{ label: 'foo1', value: 'bar1' }];
displayedItem.activityName = 'Personal information changed';
displayedItem.userName = 'John Smith';
displayedItem.timestamp = '2023-06-21T14:40:07.1594681Z';

describe('HouseholdProfileHistory', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          show: true,
          activityItemsData: [householdActivity],
        },
        computed: {
          displayedItems() {
            return [displayedItem];
          },
        },
        mocks: { $services: services },
      });
    });
    describe('edited by', () => {
      it('renders the name and role of the user', () => {
        expect(wrapper.findDataTest('household_history_edited-by').text()).toContain(wrapper.vm.displayedItems[0].userName);
        expect(wrapper.findDataTest('household_history_edited-by').text()).toContain(wrapper.vm.displayedItems[0].role.name.translation.en);
      });
    });
    describe('date of change', () => {
      it('renders the right date', () => {
        expect(wrapper.findDataTest('household_history_date-of-change').text()).toContain('Jun 21, 2023');
      });
    });
    describe('last action', () => {
      it('renders the string', () => {
        expect(wrapper.findDataTest('household_history_last-action').text()).toContain(wrapper.vm.displayedItems[0].activityName);
      });
    });

    describe('previous value', () => {
      it('renders the correct data', () => {
        expect(wrapper.findDataTest('household_history_previous-value').text()).toContain('foo1');
        expect(wrapper.findDataTest('household_history_previous-value').text()).toContain('bar1');
      });
    });
    describe('new value', () => {
      it('renders the correct data', () => {
        expect(wrapper.findDataTest('household_history_previous-value').text()).toContain('foo');
        expect(wrapper.findDataTest('household_history_previous-value').text()).toContain('bar');
      });
    });
  });

  describe('Computed', () => {
    describe('displayedItems', () => {
      it('returns the proper data', async () => {
        const item1 = new HouseholdActivity(mockHouseholdActivities()[0]);
        const item2 = new HouseholdActivity(mockHouseholdActivities()[1]);

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            activityItemsData: [item1, item2],
          },
          mocks: { $services: services },
        });

        expect(wrapper.vm.displayedItems).toEqual([{
          ...item2,
          activityName: item2.getActivityName(),
          templateData: item2.getTemplateData(false, wrapper.vm.$i18n),
          templatePreviousData: item2.getTemplateData(true, wrapper.vm.$i18n),
          userName: item2.user.name,
        }, {
          ...item1,
          activityName: item1.getActivityName(),
          templateData: item1.getTemplateData(false, wrapper.vm.$i18n),
          templatePreviousData: item1.getTemplateData(true, wrapper.vm.$i18n),
          userName: item1.user.name,
        }]);

        item1.user.id = system.public_user_id;
        item2.user.id = system.system_user_id;
        expect(wrapper.vm.displayedItems[1].userName).toBe('system.public_user_id');
        expect(wrapper.vm.displayedItems[0].userName).toBe('system.system_user_id');
      });

      it('filters out tempaddress depending on flag', async () => {
        const item1 = new HouseholdActivity(mockHouseholdActivities(HouseholdActivityType.TempAddressEdited)[0]);
        const item2 = new HouseholdActivity(mockHouseholdActivities(HouseholdActivityType.ContactInformationEdited)[0]);

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            activityItemsData: [item1, item2],
          },
          mocks: { $services: services },
        });

        expect(wrapper.vm.displayedItems).toEqual([{
          ...item2,
          activityName: item2.getActivityName(),
          templateData: item2.getTemplateData(false, wrapper.vm.$i18n, true),
          templatePreviousData: item2.getTemplateData(true, wrapper.vm.$i18n, true),
          userName: item2.user.name,
        }, {
          ...item1,
          activityName: item1.getActivityName(),
          templateData: item1.getTemplateData(false, wrapper.vm.$i18n, true),
          templatePreviousData: item1.getTemplateData(true, wrapper.vm.$i18n, true),
          userName: item1.user.name,
        }]);

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            activityItemsData: [item1, item2],
          },
          mocks: { $services: services },
          featureList: [wrapper.vm.$featureKeys.CaseFileIndividual],
        });

        expect(wrapper.vm.displayedItems).toEqual([{
          ...item2,
          activityName: item2.getActivityName(),
          templateData: item2.getTemplateData(false, wrapper.vm.$i18n, true),
          templatePreviousData: item2.getTemplateData(true, wrapper.vm.$i18n, true),
          userName: item2.user.name,
        }]);
      });
    });
  });

  describe('Methods', () => {
    describe('handleMoveActivity', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            activityItemsData: [householdActivity],
          },
          mocks: { $services: services },
        });
      });
      it('splits the activity if it is of moved type', () => {
        const activity = mockHouseholdActivities(HouseholdActivityType.HouseholdMoved);
        const expected = wrapper.vm.handleMoveActivity(activity);

        expect(expected).toEqual([{ ...activity[0], newDetails: null }, { ...activity[0], previousDetails: null }]);
      });

      it('returns the activity when it is not of moved type', () => {
        const activity = mockHouseholdActivities(HouseholdActivityType.HomeAddressEdited);
        const expected = wrapper.vm.handleMoveActivity(activity);

        expect(expected).toEqual(activity);
      });
    });
  });
});
