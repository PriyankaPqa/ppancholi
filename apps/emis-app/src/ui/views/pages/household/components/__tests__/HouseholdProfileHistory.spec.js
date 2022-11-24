import { mockHouseholdEntity } from '@libs/entities-lib/household';
import {
  HouseholdActivity,
  mockHouseholdActivities,
  HouseholdActivityType,
} from '@libs/entities-lib/value-objects/household-activity';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockProvider } from '@/services/provider';

import Component from '../HouseholdProfileHistory.vue';

const localVue = createLocalVue();
const services = mockProvider();
const household = { ...mockHouseholdEntity() };
const householdActivity = mockHouseholdActivities()[0];
const displayedItem = mockHouseholdActivities()[0];
displayedItem.templateData = [{ label: 'foo', value: 'bar' }];
displayedItem.templatePreviousData = [{ label: 'foo1', value: 'bar1' }];
displayedItem.activityName = 'Personal information changed';

jest.mock('@libs/entities-lib/value-objects/household-activity/householdActivity');

describe('HouseholdProfileHistory', () => {
  let wrapper;
  services.households.getHouseholdActivity = jest.fn(() => ([householdActivity]));

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          show: true,
          household,
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
        expect(wrapper.findDataTest('household_history_edited-by').text()).toContain(wrapper.vm.displayedItems[0].user.name);
        expect(wrapper.findDataTest('household_history_edited-by').text()).toContain(wrapper.vm.displayedItems[0].role.name.translation.en);
      });
    });
    describe('date of change', () => {
      it('renders the right date', () => {
        expect(wrapper.findDataTest('household_history_date-of-change').text()).toContain('Jan 1, 2021');
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

  describe('Lifecycle', () => {
    describe('created', () => {
      it(
        'should call  fetchHouseholdHistory action store, call handleMoveActivity with the result, and save the result into activityItems',
        async () => {
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              show: true,
              household,
            },
            mocks: { $services: services },
          });
          wrapper.vm.handleMoveActivity = jest.fn(() => [{ ...householdActivity, timestamp: '2021-11-16T16:20:03.7678072Z' }]);
          jest.clearAllMocks();
          const hook = wrapper.vm.$options.created[0];
          await hook.call(wrapper.vm);

          expect(services.households.getHouseholdActivity).toHaveBeenCalledWith(wrapper.vm.household.id);
          expect(wrapper.vm.handleMoveActivity).toHaveBeenCalledWith([householdActivity]);
          expect(wrapper.vm.activityItems.toString())
            .toEqual([new HouseholdActivity({ ...householdActivity, timestamp: '2021-11-16T16:20:03.7678072Z' })].toString());
        },
      );
    });
  });

  describe('Computed', () => {
    describe('displayedItems', () => {
      it('returns the proper data', async () => {
        const item1 = new HouseholdActivity(mockHouseholdActivities()[0]);
        const item2 = new HouseholdActivity(mockHouseholdActivities()[1]);

        item1.timestamp = '2021-01-01';
        item2.timestamp = '2021-02-10';
        item1.getActivityName = jest.fn(() => HouseholdActivityType[mockHouseholdActivities()[0].activityType]);
        item2.getActivityName = jest.fn(() => HouseholdActivityType[mockHouseholdActivities()[1].activityType]);
        item1.getTemplateData = jest.fn(() => ([{ label: 'foo1', value: 'bar1' }]));
        item2.getTemplateData = jest.fn(() => ([{ label: 'foo2', value: 'bar2' }]));

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            household,
          },
          data() {
            return { activityItems: [item1, item2] };
          },
          mocks: { $services: services },
        });

        expect(wrapper.vm.displayedItems).toEqual([{
          ...item2,
          activityName: HouseholdActivityType[mockHouseholdActivities()[1].activityType],
          templateData: [{ label: 'foo2', value: 'bar2' }],
          templatePreviousData: [{ label: 'foo2', value: 'bar2' }],
        }, {
          ...item1,
          activityName: HouseholdActivityType[mockHouseholdActivities()[0].activityType],
          templateData: [{ label: 'foo1', value: 'bar1' }],
          templatePreviousData: [{ label: 'foo1', value: 'bar1' }],
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
            household,
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
