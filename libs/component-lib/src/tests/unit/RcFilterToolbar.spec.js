import { EFilterPanelEvents, EFilterOperator, EDateMode } from '@libs/component-lib/types';
import Component from '../../components/molecule/RcFilterToolbar/RcFilterToolbar.vue';
import { createLocalVue, mount } from '../testSetup';

describe('RcFilterToolbar.vue', () => {
  let localVue;
  let wrapper;

  beforeEach(() => {
    localVue = createLocalVue();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        filterKey: 1,
        filterOptions: [],
        count: 0,
      },
    });
  });

  describe('Watch', () => {
    test('convert filter value properly in case of date Equal', async () => {
      const startOfDay = '2021-09-07T04:00:00.000Z';
      const endOfDay = '2021-09-08T03:59:59.999Z';

      wrapper.vm.getStartOfDay = jest.fn(() => startOfDay);
      wrapper.vm.getEndOfDay = jest.fn(() => endOfDay);

      const selectedFilter = {
        filters: [
          {
            key: 'key',
            value: '2021-09-07',
            type: 'date',
            operator: EFilterOperator.Equal,
          },
        ],
      };

      await wrapper.setData({
        selectedFilter,
      });

      expect(wrapper.emitted(EFilterPanelEvents.UpdateAppliedFilter)[0]).toEqual([
        [
          {
            key: 'key',
            value: [startOfDay, endOfDay],
            type: 'date',
            operator: EFilterOperator.Between,
          },
        ],
        selectedFilter,
      ]);
    });

    test('convert filter value properly in case of date Between', async () => {
      const startOfDay = '2021-09-06T04:00:00.000Z';
      const endOfDay = '2021-09-08T03:59:59.999Z';

      wrapper.vm.getStartOfDay = jest.fn(() => startOfDay);
      wrapper.vm.getEndOfDay = jest.fn(() => endOfDay);

      const selectedFilter = {
        filters: [
          {
            key: 'key',
            value: ['2021-09-06', '2021-09-07'],
            type: 'date',
            operator: EFilterOperator.Between,
          },
        ],
      };

      await wrapper.setData({
        selectedFilter,
      });

      expect(wrapper.emitted(EFilterPanelEvents.UpdateAppliedFilter)[0]).toEqual([
        [
          {
            key: 'key',
            value: [startOfDay, endOfDay],
            type: 'date',
            operator: EFilterOperator.Between,
          },
        ],
        selectedFilter,
      ]);
    });

    test('convert filter value properly in case of date LessEqual', async () => {
      const endOfDay = '2021-09-08T03:59:59.999Z';
      wrapper.vm.getEndOfDay = jest.fn(() => endOfDay);

      const selectedFilter = {
        filters: [
          {
            key: 'key',
            value: '2021-09-07',
            type: 'date',
            operator: EFilterOperator.LessEqual,
          },
        ],
      };

      await wrapper.setData({
        selectedFilter,
      });

      expect(wrapper.emitted(EFilterPanelEvents.UpdateAppliedFilter)[0]).toEqual([
        [
          {
            key: 'key',
            value: endOfDay,
            type: 'date',
            operator: EFilterOperator.LessEqual,
          },
        ],
        selectedFilter,
      ]);
    });

    test('convert filter value properly in case of date GreaterEqual', async () => {
      const startOfDay = '2021-09-06T04:00:00.000Z';
      wrapper.vm.getStartOfDay = jest.fn(() => startOfDay);

      const selectedFilter = {
        filters: [
          {
            key: 'key',
            value: '2021-09-06',
            type: 'date',
            operator: EFilterOperator.GreaterEqual,
          },
        ],
      };

      await wrapper.setData({
        selectedFilter,
      });

      expect(wrapper.emitted(EFilterPanelEvents.UpdateAppliedFilter)[0]).toEqual([
        [
          {
            key: 'key',
            value: startOfDay,
            type: 'date',
            operator: EFilterOperator.GreaterEqual,
          },
        ],
        selectedFilter,
      ]);
    });

    test('convert filter value properly in case of date lessThan', async () => {
      const startOfDay = '2021-09-06T04:00:00.000Z';
      wrapper.vm.getStartOfDay = jest.fn(() => startOfDay);

      const selectedFilter = {
        filters: [
          {
            key: 'key',
            value: '2021-09-06',
            type: 'date',
            operator: EFilterOperator.lessThan,
          },
        ],
      };

      await wrapper.setData({
        selectedFilter,
      });

      expect(wrapper.emitted(EFilterPanelEvents.UpdateAppliedFilter)[0]).toEqual([
        [
          {
            key: 'key',
            value: startOfDay,
            type: 'date',
            operator: EFilterOperator.lessThan,
          },
        ],
        selectedFilter,
      ]);
    });
  });

  describe('Methods', () => {
    describe('getStartOfDay', () => {
      describe('ConvertLocalToUtc', () => {
        it('returns a iso string of the start of the day including the time zone', () => {
          const res = wrapper.vm.getStartOfDay('2021-09-07', EDateMode.ConvertLocalToUtc);
          expect(res).toBe(new Date(2021, 8, 7, 0, 0, 0, 0).toISOString());
        });
      });

      describe('Static', () => {
        it('returns a iso string of the start of the day at midnight', () => {
          const res = wrapper.vm.getStartOfDay('2021-09-07', EDateMode.Static);
          expect(res).toBe(new Date(Date.UTC(2021, 8, 7, 0, 0, 0)).toISOString());
        });
      });
    });

    describe('getEndOfDay', () => {
      describe('ConvertLocalToUtc', () => {
        it('returns a iso string of the end of the day including the time zone', () => {
          const res = wrapper.vm.getEndOfDay('2021-09-07', EDateMode.ConvertLocalToUtc);
          expect(res).toBe(new Date(2021, 8, 7, 23, 59, 59, 999).toISOString());
        });
      });

      describe('Static', () => {
        it('returns a iso string of the end of the day at midnight', () => {
          const res = wrapper.vm.getEndOfDay('2021-09-07', EDateMode.Static);
          expect(res).toBe(new Date(Date.UTC(2021, 8, 7, 23, 59, 59, 999)).toISOString());
        });
      });
    });

    describe('parseDate', () => {
      it('parses date string into array of number', () => {
        const value = '2021-09-07';

        const results = wrapper.vm.parseDate(value);
        expect(results[0]).toBe(2021);
        expect(results[1]).toBe(9);
        expect(results[2]).toBe(7);
      });
    });
  });
});
