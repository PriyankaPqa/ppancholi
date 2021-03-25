import { createLocalVue, shallowMount } from '@/test/testSetup';
import { EFilterOperator, EFilterType } from '@crctech/component-library/src/types/FilterTypes';
import _set from 'lodash/set';
import Component from './FilterToolbar.vue';

const localVue = createLocalVue();

describe(Component, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        filterKey: '1',
        filterOptions: [],
        count: 0,
        titleDialog: 'titleDialog',
      },
    });
  });

  describe('Methods', () => {
    describe('convertToInteger', () => {
      it('does nothing if filter type is not number', () => {
        const filter = {
          key: 'test',
          operator: EFilterOperator.Equal,
          type: EFilterType.Text,
          value: '12345',
        };
        wrapper.vm.convertToInteger(filter);
        expect(filter.value).toBe('12345');
      });

      it('converts string number to a number if filter type is number', () => {
        const filter = {
          key: 'test',
          type: EFilterType.Number,
          value: '12345',
        };
        wrapper.vm.convertToInteger(filter);
        expect(filter.value).toBe(12345);
      });

      it('converts array of string number to array of number if filter type is number', () => {
        const filter = {
          key: 'test',
          type: EFilterType.Number,
          value: ['12345', '6789'],
        };
        wrapper.vm.convertToInteger(filter);
        expect(filter.value).toEqual([12345, 6789]);
      });
    });

    describe('translateFilter', () => {
      it('builds the proper structure for between operator', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.Between,
          type: EFilterType.Date,
          value: ['today', 'tomorrow'],
        };
        const newFilter = wrapper.vm.translateFilter(filter);
        expect(newFilter).toEqual(_set({}, filter.key, { ge: 'today', le: 'tomorrow' }));
      });

      it('builds the proper structure for equal operator', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.Equal,
          type: EFilterType.Date,
          value: 'today',
        };
        const newFilter = wrapper.vm.translateFilter(filter);
        expect(newFilter).toEqual(_set({}, filter.key, filter.value));
      });

      it('builds the proper structure for GreaterEqual operator', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.GreaterEqual,
          type: EFilterType.Date,
          value: 'today',
        };
        const newFilter = wrapper.vm.translateFilter(filter);
        expect(newFilter).toEqual(_set({}, filter.key, { ge: filter.value }));
      });

      it('builds the proper structure for GreaterThan operator', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.GreaterThan,
          type: EFilterType.Date,
          value: 'today',
        };
        const newFilter = wrapper.vm.translateFilter(filter);
        expect(newFilter).toEqual(_set({}, filter.key, { gt: filter.value }));
      });

      it('builds the proper structure for LessThan operator', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.LessThan,
          type: EFilterType.Date,
          value: 'today',
        };
        const newFilter = wrapper.vm.translateFilter(filter);
        expect(newFilter).toEqual(_set({}, filter.key, { lt: filter.value }));
      });

      it('builds the proper structure for LessEqual operator', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.LessEqual,
          type: EFilterType.Date,
          value: 'today',
        };
        const newFilter = wrapper.vm.translateFilter(filter);
        expect(newFilter).toEqual(_set({}, filter.key, { le: filter.value }));
      });

      it('builds the proper structure for In operator', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.In,
          type: EFilterType.Number,
          value: ['1', '2'],
        };
        const newFilter = wrapper.vm.translateFilter(filter);
        expect(newFilter).toEqual(_set({}, filter.key, { in: filter.value }));
      });

      it('builds the proper structure for BeginsWith operator', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.BeginsWith,
          type: EFilterType.Text,
          value: 'start',
        };
        const newFilter = wrapper.vm.translateFilter(filter);
        expect(newFilter).toEqual(_set({}, filter.key, { startswith_az: filter.value }));
      });

      it('builds the proper structure for Contains operator', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.Contains,
          type: EFilterType.Text,
          value: 'start',
        };
        const newFilter = wrapper.vm.translateFilter(filter);
        expect(newFilter).toEqual(_set({}, filter.key, { contains_az: filter.value }));
      });

      it('builds the proper structure for DoesNotContain operator', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.DoesNotContain,
          type: EFilterType.Text,
          value: 'start',
        };
        const newFilter = wrapper.vm.translateFilter(filter);
        expect(newFilter).toEqual(_set({}, `not.${filter.key}`, { contains_az: filter.value }));
      });
    });

    describe('prepareForOdataQuery', () => {
      it('builds one object with all ready to use filters inside', () => {
        const filters = [
          {
            key: 'Text',
            type: EFilterType.Text,
            operator: EFilterOperator.Equal,
            value: '12345',
          },
          {
            key: 'Number',
            operator: EFilterOperator.Equal,
            type: EFilterType.Number,
            value: '2',
          },
        ];
        const finalFilters = wrapper.vm.prepareForOdataQuery(filters);
        expect(finalFilters).toEqual({
          Number: 2,
          Text: '12345',
        });
      });
    });

    describe('onApplyFilter', () => {
      it('calls prepareForOdataQuery with proper parameter', () => {
        jest.spyOn(wrapper.vm, 'prepareForOdataQuery').mockImplementation(() => {});
        const filters = { filter: 'filter' };
        wrapper.vm.onApplyFilter(filters);
        expect(wrapper.vm.prepareForOdataQuery).toHaveBeenCalledWith(filters);
      });

      it('emits update:appliedFilter with proper parameter', () => {
        jest.spyOn(wrapper.vm, 'prepareForOdataQuery').mockImplementation(() => 'preparedFilters');
        const filters = { filter: 'filter' };
        wrapper.vm.onApplyFilter(filters);
        expect(wrapper.emitted('update:appliedFilter')[0][0]).toBe('preparedFilters');
      });
    });
  });

  // describe('Computed properties', () => {
  // describe('Labels', () => {
  // test('labels are ok', () => {
  //   const labels = {
  //     save: 'common.save',
  //     cancel: 'common.cancel',
  //     apply: 'common.apply',
  //     download: 'common.download',
  //     filterCopySuffix: 'common.copy',
  //     yourFilters: 'genericFilter.yourFilters',
  //     tooltipNew: 'genericFilter.newFilter',
  //     tooltipAdd: 'genericFilter.addFilter',
  //     tooltipCopy: 'genericFilter.copyFilter',
  //     tooltipDelete: 'genericFilter.deleteFilter',
  //     tooltipCloseFilter: 'genericFilter.clickToClose',
  //     removeTitle: 'genericFilter.deleteFilter',
  //     removeBody: 'genericFilter.removeBody',
  //     removeCancel: 'common.cancel',
  //     removeConfirm: 'common.confirm',
  //     importLabel: 'common.import',
  //     exportLabel: 'common.export',
  //     exportTitle: 'genericFilter.exportToCsv',
  //     exportCancel: 'common.cancel',
  //     exportDownload: 'common.download',
  //     exportFormat: 'genericFilter.exportFormat',
  //     exportItems: 'genericFilter.exportItems',
  //     formFilterName: 'genericFilter.filterName',
  //     formRequiredField: 'validations.required',
  //     defaultFilterName: 'genericFilter.defaultFilterName',
  //     filterSubtitle: 'genericFilter.filterSubtitle',
  //     dialogTitle: 'titleDialog',
  //     operators: {
  //       [EFilterOperator.Between]: 'genericFilter.operators.Between',
  //       [EFilterOperator.Equal]: 'genericFilter.operators.Equal',
  //       [EFilterOperator.GreaterEqual]: 'genericFilter.operators.GreaterEqual',
  //       [EFilterOperator.GreaterThan]: 'genericFilter.operators.GreaterThan',
  //       [EFilterOperator.LessThan]: 'genericFilter.operators.LessThan',
  //       [EFilterOperator.LessEqual]: 'genericFilter.operators.LessEqual',
  //       [EFilterOperator.In]: 'genericFilter.operators.In',
  //       [EFilterOperator.BeginsWith]: 'genericFilter.operators.BeginsWith',
  //       [EFilterOperator.EndsWith]: 'genericFilter.operators.EndsWith',
  //       [EFilterOperator.Contains]: 'genericFilter.operators.Contains',
  //       [EFilterOperator.DoesNotContain]: 'genericFilter.operators.DoesNotContain',
  //     },
  //     errors: {
  //       maxLength: 'genericFilter.errors.maxLength',
  //       maxGreaterThanMin: 'genericFilter.errors.maxGreaterThanMin',
  //       401: 'genericFilter.errors.401',
  //       500: 'genericFilter.errors.500',
  //       NoSelectedFilter: 'genericFilter.errors.noSelectedFilter',
  //       Error409002CustomFilterDuplicateName: 'genericFilter.errors.duplicateName',
  //     },
  //   };
  //   expect(wrapper.vm.filterLabels).toEqual(labels);
  // });
  // });
  // });
});
