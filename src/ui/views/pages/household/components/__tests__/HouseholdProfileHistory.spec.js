import {
  mockVersionedEntityCombined,
  VersionedEntityCombined,
  mockVersionedEntity,
} from '@crctech/registration-lib/src/entities/value-objects/versioned-entity';
import { mockHouseholdEntity } from '@crctech/registration-lib/src/entities/household';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';

import Component from '../HouseholdProfileHistory.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const household = { ...mockHouseholdEntity() };
const versionedEntity = new VersionedEntityCombined(
  mockVersionedEntityCombined('householdMember', {}, '', 'Created'), mockVersionedEntity('memberMetadata'),
);
versionedEntity.lastActionName = 'Household created';
versionedEntity.templateData = [{ label: 'foo', value: 'bar' }];
versionedEntity.templatePreviousData = [{ label: 'foo1', value: 'bar1' }];

describe('HouseholdProfileHistory', () => {
  let wrapper;
  storage.household.actions.fetchHouseholdHistory = jest.fn(() => ([versionedEntity]));

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          show: true,
          household,
        },
        computed: {
          displayedItems() { return [versionedEntity]; },
        },
        mocks: { $storage: storage },
      });
    });
    describe('edited by', () => {
      it('renders the name and role of the user', () => {
        expect(wrapper.findDataTest('household_history_edited-by').text()).toContain(wrapper.vm.displayedItems[0].userName);
        expect(wrapper.findDataTest('household_history_edited-by').text()).toContain(wrapper.vm.displayedItems[0].roleName.translation.en);
      });
    });
    describe('date of change', () => {
      it('renders the right date', () => {
        expect(wrapper.findDataTest('household_history_date-of-change').text()).toContain('Jan 1, 2021');
      });
    });
    describe('last action', () => {
      it('renders the string', () => {
        expect(wrapper.findDataTest('household_history_last-action').text()).toContain('Household created');
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
      it('should call  fetchHouseholdHistory action store and save the result into historyItems', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            household,
          },
          mocks: { $storage: storage },
        });
        await wrapper.vm.$nextTick();
        expect(storage.household.actions.fetchHouseholdHistory).toHaveBeenCalledWith(wrapper.vm.household);
        expect(wrapper.vm.historyItems).toEqual([versionedEntity]);
      });
    });
  });

  describe('Computed', () => {
    describe('displayedItems', () => {
      it('returns the proper data', async () => {
        const item1 = new VersionedEntityCombined(
          mockVersionedEntityCombined('householdMember', { getTemplateData: jest.fn() }, '', 'Created'),
          mockVersionedEntity('memberMetadata'),
        );
        const item2 = new VersionedEntityCombined(
          mockVersionedEntityCombined('householdMember', { getTemplateData: jest.fn() }, '', 'Created'),
          mockVersionedEntity('memberMetadata'),
        );
        item1.getTemplateData = jest.fn(() => ([{ label: '', value: '' }]));
        item1.getLastActionName = jest.fn(() => 'Household created');
        item2.getTemplateData = jest.fn(() => null);

        storage.household.actions.fetchHouseholdHistory = jest.fn(() => ([item1, item2]));
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            household,
          },
          data() {
            return { historyItems: [item1, item2] };
          },
          mocks: { $storage: storage },
        });

        expect(wrapper.vm.displayedItems).toEqual([{
          ...item1,
          lastActionName: 'Household created',
          templateData: [{ label: '', value: '' }],
          templatePreviousData: [{ label: '', value: '' }],
        }]);
      });
    });
  });
});
