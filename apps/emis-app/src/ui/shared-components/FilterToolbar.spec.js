/* eslint-disable max-len */
import { EFilterOperator, EFilterType } from '@libs/component-lib/types/FilterTypes';
import _set from 'lodash/set';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockUserAccountEntity, mockUserFilters, FilterKey } from '@libs/entities-lib/user-account';
import rcFilterToolbar from '@libs/component-lib/components/molecule/RcFilterToolbar/RcFilterToolbar.vue';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import Component from './FilterToolbar.vue';

const localVue = createLocalVue();
const { pinia, userAccountStore } = useMockUserAccountStore();

describe('Filter Toolbar', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        filterKey: FilterKey.Teams,
        filterOptions: [],
        count: 0,
        titleDialog: 'titleDialog',
      },
      data() {
        return {
          userFilters: mockUserFilters(),
        };
      },
    });
  });

  describe('Template', () => {
    describe('rcFilterToolbar', () => {
      it('should pass props initial-filter', async () => {
        await wrapper.setProps({
          filterState: { filterStateItem: 3 },
        });
        const component = wrapper.findComponent(rcFilterToolbar);
        const props = 'initialFilter';
        expect(component.props(props)).toBe(wrapper.vm.initialFilter);
      });
    });
  });

  describe('Methods', () => {
    describe('onSave', () => {
      it('it calls editFilter in edit mode', async () => {
        const filter = {};
        const edit = true;
        const filterIndex = 1;
        jest.spyOn(wrapper.vm, 'editFilter')
          .mockImplementation(() => null);

        await wrapper.vm.onSave({
          filter,
          edit,
          filterIndex,
        });
        expect(wrapper.vm.editFilter)
          .toHaveBeenCalledWith(filter, filterIndex);
      });

      it('it calls createFilter otherwise', async () => {
        const filter = {};
        const edit = false;
        const filterIndex = 1;
        jest.spyOn(wrapper.vm, 'createFilter')
          .mockImplementation(() => null);

        await wrapper.vm.onSave({
          filter,
          edit,
          filterIndex,
        });
        expect(wrapper.vm.createFilter)
          .toHaveBeenCalledWith(filter);
      });
    });

    describe('editFilter', () => {
      it('calls editFilter action', async () => {
        const filter = {};
        const filterIndex = 0;

        const expectedPayload = {
          oldFilter: mockUserFilters()[filterIndex],
          newFilter: filter,
        };
        jest.spyOn(wrapper.vm, 'refreshUserFilters')
          .mockImplementation(() => null);
        await wrapper.vm.editFilter(filter, filterIndex);

        expect(userAccountStore.editFilter)
          .toHaveBeenCalledWith(expectedPayload);
      });

      it('calls refreshUserFilters method', async () => {
        const filter = {};
        const filterIndex = 0;
        jest.spyOn(wrapper.vm, 'refreshUserFilters')
          .mockImplementation(() => null);

        await wrapper.vm.editFilter(filter, filterIndex);

        expect(wrapper.vm.refreshUserFilters)
          .toHaveBeenCalledTimes(1);
      });

      it('doest not call refreshUserFilters method if edit filter fails', async () => {
        const filter = {};
        const filterIndex = 0;
        jest.spyOn(wrapper.vm, 'refreshUserFilters')
          .mockImplementation(() => null);
        userAccountStore.editFilter = jest.fn(() => null);

        await wrapper.vm.editFilter(filter, filterIndex);

        expect(wrapper.vm.refreshUserFilters)
          .toHaveBeenCalledTimes(0);
      });
    });

    describe('createFilter', () => {
      beforeEach(() => {
        wrapper.vm.$refs.rcFilterToolbar.setEditMode = jest.fn();
      });

      it('calls addFilter action with proper payload', async () => {
        const filter = {};
        jest.spyOn(wrapper.vm, 'refreshUserFilters')
          .mockImplementation(() => null);

        await wrapper.vm.createFilter(filter);

        expect(userAccountStore.addFilter)
          .toHaveBeenCalledWith(filter);
      });

      it('calls refreshUserFilters method', async () => {
        const filter = {};
        jest.spyOn(wrapper.vm, 'refreshUserFilters')
          .mockImplementation(() => null);

        await wrapper.vm.createFilter(filter);

        expect(wrapper.vm.refreshUserFilters)
          .toHaveBeenCalledTimes(1);
      });

      it('does not call refreshUserFilters method if create filter failed', async () => {
        const filter = {};
        jest.spyOn(wrapper.vm, 'refreshUserFilters')
          .mockImplementation(() => null);

        userAccountStore.addFilter = jest.fn(() => null);

        await wrapper.vm.createFilter(filter);

        expect(wrapper.vm.refreshUserFilters)
          .toHaveBeenCalledTimes(0);
      });
    });

    describe('onLoadAll', () => {
      it('calls getter currentUserFiltersByKey', async () => {
        await wrapper.vm.onLoadAll();
        expect(userAccountStore.currentUserFiltersByKey)
          .toHaveBeenCalledWith(wrapper.vm.filterKey);
      });

      it('assign the result to userFilters', async () => {
        userAccountStore.currentUserFiltersByKey = jest.fn(() => ['filters']);
        await wrapper.vm.onLoadAll();
        expect(wrapper.vm.userFilters)
          .toEqual(['filters']);
      });
    });

    describe('onDelete', () => {
      it('calls deleteFilter action with proper payload', async () => {
        jest.spyOn(wrapper.vm, 'refreshUserFilters')
          .mockImplementation(() => null);
        await wrapper.vm.onDelete(mockUserFilters()[0]);
        expect(userAccountStore.deleteFilter)
          .toHaveBeenCalledWith(mockUserFilters()[0]);
      });

      it('calls refreshUserFilters method', async () => {
        jest.spyOn(wrapper.vm, 'refreshUserFilters')
          .mockImplementation(() => null);
        await wrapper.vm.onDelete({});
        expect(wrapper.vm.refreshUserFilters)
          .toHaveBeenCalledTimes(1);
      });
    });

    describe('refreshUserFilters', () => {
      it('calls setCurrentUserAccount mutations with proper payload', () => {
        wrapper.vm.refreshUserFilters(mockUserAccountEntity());
        expect(userAccountStore.currentUserAccount)
          .toStrictEqual(mockUserAccountEntity());
      });

      it('calls filtersByKey and sets userFilters', async () => {
        userAccountStore.currentUserFiltersByKey = jest.fn(() => ['filters']);
        await wrapper.vm.refreshUserFilters(mockUserAccountEntity());
        expect(userAccountStore.currentUserFiltersByKey)
          .toHaveBeenCalledWith(wrapper.vm.filterKey);
        expect(wrapper.vm.userFilters)
          .toEqual(['filters']);
      });
    });

    describe('onApplyFilter', () => {
      it('calls prepareFiltersForOdataQuery to prepare userFilters', async () => {
        jest.spyOn(wrapper.vm, 'prepareFiltersForOdataQuery')
          .mockImplementation(() => {
          });
        const filters = [
          {
            type: 'text',
            operator: EFilterOperator.BeginsWith,
            key: 'TeamName',
          },
          {
            type: 'select',
            operator: EFilterOperator.Equal,
            key: 'TeamStatus',
          },
        ];

        wrapper.vm.onApplyFilter(filters);
        expect(wrapper.vm.prepareFiltersForOdataQuery)
          .toHaveBeenCalledWith(filters);
      });

      it('emits update:appliedFilter with proper parameter', async () => {
        jest.spyOn(wrapper.vm, 'prepareFiltersForOdataQuery')
          .mockImplementation(() => 'preparedFilters');
        jest.spyOn(wrapper.vm, 'translateSearchFilter')
          .mockImplementation(() => 'translateSearchFilter');
        const filters = [
          {
            type: 'text',
            operator: EFilterOperator.BeginsWith,
            key: 'TeamName',
          },
          {
            type: 'select',
            operator: EFilterOperator.Equal,
            key: 'TeamStatus',
          },
        ];

        wrapper.vm.onApplyFilter(filters, { name: 'filterState' });
        expect(wrapper.emitted('update:appliedFilter')[0][0])
          .toEqual({
            preparedFilters: 'preparedFilters',
            searchFilters: '',
          });
        expect(wrapper.emitted('update:appliedFilter')[0][1])
          .toEqual({ name: 'filterState' });
      });
    });

    describe('translateFilterSql', () => {
      // uncomment and make the right test as you've verified operators in sql
      // it('builds the proper structure for between operator', () => {
      //   const filter = {
      //     key: 'Prop.Sub',
      //     operator: EFilterOperator.Between,
      //     type: EFilterType.Date,
      //     value: ['today', 'tomorrow'],
      //   };
      //   const newFilter = wrapper.vm.translateFilterSql(filter);
      //   expect(newFilter)
      //     .toEqual(_set({}, filter.key, {
      //       ge: 'today',
      //       le: 'tomorrow',
      //     }));
      // });

      describe('Equal operator', () => {
        it('should set newFilter with the result of translateEqualFilter', () => {
          const filter = {
            key: 'Prop.Sub',
            operator: EFilterOperator.Equal,
            type: EFilterType.Select,
            value: 'arrayNotEmpty',
          };
          wrapper.vm.translateEqualOperator = jest.fn(() => ({}));
          const newFilter = wrapper.vm.translateFilterSql(filter);
          expect(newFilter)
            .toEqual({});
        });
      });

      // describe('Not equal operator', () => {
      //   it('should build proper filter if the target property is an array', () => {
      //     const filter = {
      //       key: 'Prop.Sub',
      //       keyType: EFilterKeyType.Array,
      //       operator: EFilterOperator.NotEqual,
      //       type: EFilterType.Text,
      //       value: 'today',
      //     };
      //     const newFilter = wrapper.vm.translateFilterSql(filter);
      //     expect(newFilter)
      //       .toEqual(_set(newFilter, filter.key, { notEqualOnArray_az: filter.value }));
      //   });

      //   it('should build proper filter if the target property otherwise', () => {
      //     const filter = {
      //       key: 'Prop.Sub',
      //       keyType: EFilterKeyType.Array,
      //       operator: EFilterOperator.NotEqual,
      //       type: EFilterType.Text,
      //       value: 'today',
      //     };
      //     const newFilter = wrapper.vm.translateFilterSql(filter);
      //     expect(newFilter)
      //       .toEqual(_set(newFilter, `not.${filter.key}`, filter.value));
      //   });
      // });

      // describe('Not In operator', () => {
      //   it('should build proper filter if the target property is an array', () => {
      //     const filter = {
      //       key: 'Prop.Sub',
      //       keyType: EFilterKeyType.Array,
      //       operator: EFilterOperator.NotIn,
      //       type: EFilterType.Text,
      //       value: 'today',
      //     };
      //     const newFilter = wrapper.vm.translateFilterSql(filter);
      //     expect(newFilter)
      //       .toEqual(_set(newFilter, filter.key, { notSearchInOnArray_az: filter.value }));
      //   });

      //   it('should build proper filter if the target property otherwise', () => {
      //     const filter = {
      //       key: 'Prop.Sub',
      //       operator: EFilterOperator.NotIn,
      //       type: EFilterType.Text,
      //       value: 'today',
      //     };
      //     const newFilter = wrapper.vm.translateFilterSql(filter);
      //     expect(newFilter)
      //       .toEqual(_set(newFilter, filter.key, { notSearchIn_az: filter.value }));
      //   });
      // });

      // it('builds the proper structure for GreaterEqual operator', () => {
      //   const filter = {
      //     key: 'Prop.Sub',
      //     operator: EFilterOperator.GreaterEqual,
      //     type: EFilterType.Date,
      //     value: 'today',
      //   };
      //   const newFilter = wrapper.vm.translateFilterSql(filter);
      //   expect(newFilter)
      //     .toEqual(_set({}, filter.key, { ge: filter.value }));
      // });

      // it('builds the proper structure for GreaterThan operator', () => {
      //   const filter = {
      //     key: 'Prop.Sub',
      //     operator: EFilterOperator.GreaterThan,
      //     type: EFilterType.Date,
      //     value: 'today',
      //   };
      //   const newFilter = wrapper.vm.translateFilterSql(filter);
      //   expect(newFilter)
      //     .toEqual(_set({}, filter.key, { gt: filter.value }));
      // });

      // it('builds the proper structure for LessThan operator', () => {
      //   const filter = {
      //     key: 'Prop.Sub',
      //     operator: EFilterOperator.LessThan,
      //     type: EFilterType.Date,
      //     value: 'today',
      //   };
      //   const newFilter = wrapper.vm.translateFilterSql(filter);
      //   expect(newFilter)
      //     .toEqual(_set({}, filter.key, { lt: filter.value }));
      // });

      // it('builds the proper structure for LessEqual operator', () => {
      //   const filter = {
      //     key: 'Prop.Sub',
      //     operator: EFilterOperator.LessEqual,
      //     type: EFilterType.Date,
      //     value: 'today',
      //   };
      //   const newFilter = wrapper.vm.translateFilterSql(filter);
      //   expect(newFilter)
      //     .toEqual(_set({}, filter.key, { le: filter.value }));
      // });

      it('builds the proper structure for In operator (calling translateInOperator)', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.In,
          type: EFilterType.Number,
          value: ['1', '2'],
        };
        wrapper.vm.translateInOperator = jest.fn();

        wrapper.vm.translateFilterSql(filter);

        expect(wrapper.vm.translateInOperator)
          .toHaveBeenCalledWith(filter);
      });

      it('builds the proper structure for BeginsWith operator', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.BeginsWith,
          type: EFilterType.Text,
          value: 'start',
        };
        const newFilter = wrapper.vm.translateFilterSql(filter);
        expect(newFilter)
          .toEqual(_set({}, filter.key, { startswith: filter.value }));
      });

      it('builds the proper structure for Contains operator', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.Contains,
          type: EFilterType.Text,
          value: 'start',
        };
        const newFilter = wrapper.vm.translateFilterSql(filter);
        expect(newFilter)
          .toEqual(_set({}, filter.key, { contains: filter.value }));
      });

      // it('builds the proper structure for DoesNotContain operator', () => {
      //   const filter = {
      //     key: 'Prop.Sub',
      //     operator: EFilterOperator.DoesNotContain,
      //     type: EFilterType.Text,
      //     value: 'start',
      //   };
      //   const newFilter = wrapper.vm.translateFilterSql(filter);
      //   expect(newFilter)
      //     .toEqual(_set({}, `not.${filter.key}`, { contains_az: filter.value }));
      // });
    });

    describe('translateSearchFilter', () => {
      it('creates the correct string for BeginsWith operator', () => {
        const filter = {
          type: 'text',
          value: 'myValue',
          operator: EFilterOperator.BeginsWith,
          key: 'TeamName',
        };
        const newFilter = wrapper.vm.translateSearchFilter(filter);
        expect(newFilter)
          .toEqual(['(TeamName:/myValue.*/ OR TeamName:"\\"myValue\\"")']);
      });

      it('creates the correct string for BeginsWith operator when multiple words', () => {
        const filter = {
          type: 'text',
          value: 'myValue  spaced out',
          operator: EFilterOperator.BeginsWith,
          key: 'TeamName',
        };
        const newFilter = wrapper.vm.translateSearchFilter(filter);
        expect(newFilter)
          .toEqual(['(TeamName:/myValue.*/ OR TeamName:"\\"myValue\\"")', '(TeamName:/spaced.*/ OR TeamName:"\\"spaced\\"")', '(TeamName:/out.*/ OR TeamName:"\\"out\\"")']);
      });

      it('creates the correct string for Contains operator', () => {
        const filter = {
          type: 'text',
          value: 'myValue',
          operator: EFilterOperator.Contains,
          key: 'TeamName',
        };
        const newFilter = wrapper.vm.translateSearchFilter(filter);
        expect(newFilter)
          .toEqual(['(TeamName:/.*myValue.*/ OR TeamName:"\\"myValue\\"")']);
      });

      it('creates the correct string for Contains operator when multiple words', () => {
        const filter = {
          type: 'text',
          value: 'myValue  spaced out',
          operator: EFilterOperator.Contains,
          key: 'TeamName',
        };
        const newFilter = wrapper.vm.translateSearchFilter(filter);
        expect(newFilter)
          .toEqual(['(TeamName:/.*myValue.*/ OR TeamName:"\\"myValue\\"")', '(TeamName:/.*spaced.*/ OR TeamName:"\\"spaced\\"")', '(TeamName:/.*out.*/ OR TeamName:"\\"out\\"")']);
      });

      it('creates the correct string for DoesNotContain operator', () => {
        const filter = {
          type: 'text',
          value: 'myValue',
          operator: EFilterOperator.DoesNotContain,
          key: 'TeamName',
        };
        const newFilter = wrapper.vm.translateSearchFilter(filter);
        expect(newFilter)
          .toEqual(['TeamName:(/.*/ NOT /.*myValue.*/)']);
      });

      it('creates the correct string for Fuzzy Search operator', () => {
        const filter = {
          type: 'text',
          value: 'myValue',
          operator: EFilterOperator.FuzzySearch,
          key: 'TeamName',
        };
        const newFilter = wrapper.vm.translateSearchFilter(filter);
        expect(newFilter)
          .toEqual(['TeamName:"myValue~"']);
      });

      it('creates the correct string for Equals Search operator', () => {
        const filter = {
          type: 'text',
          value: 'myValue',
          operator: EFilterOperator.Equal,
          key: 'TeamName',
        };
        const newFilter = wrapper.vm.translateSearchFilter(filter);
        expect(newFilter)
          .toEqual(['TeamName:"\\"myValue\\""']);
      });
    });

    describe('convertToInteger', () => {
      it('does nothing if filter type is not number', () => {
        const filter = {
          key: 'test',
          operator: EFilterOperator.Equal,
          type: EFilterType.Text,
          value: '12345',
        };
        wrapper.vm.convertToInteger(filter);
        expect(filter.value)
          .toBe('12345');
      });

      it('converts string number to a number if filter type is number', () => {
        const filter = {
          key: 'test',
          type: EFilterType.Number,
          value: '12345',
        };
        wrapper.vm.convertToInteger(filter);
        expect(filter.value)
          .toBe(12345);
      });

      it('converts array of string number to array of number if filter type is number', () => {
        const filter = {
          key: 'test',
          type: EFilterType.Number,
          value: ['12345', '6789'],
        };
        wrapper.vm.convertToInteger(filter);
        expect(filter.value)
          .toEqual([12345, 6789]);
      });
    });

    describe('prepareFiltersForOdataQuery', () => {
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
        const finalFilters = wrapper.vm.prepareFiltersForOdataQuery(filters);
        expect(finalFilters)
          .toEqual({
            Number: 2,
            Text: '12345',
          });
      });

      it('should build correct object for multiselect (or)', () => {
        const filters = [
          {
            key: 'Type',
            type: EFilterType.MultiSelect,
            operator: EFilterOperator.In,
            value: ['1', '2'],
          },
          {
            key: 'Status',
            type: EFilterType.MultiSelect,
            operator: EFilterOperator.In,
            value: ['3', '4'],
          },
        ];
        const finalFilters = wrapper.vm.prepareFiltersForOdataQuery(filters);
        expect(finalFilters)
          .toEqual({
            and: [
              {
                or: [
                  { Type: '1' },
                  { Type: '2' },
                ],
              },
              {
                or: [
                  { Status: '3' },
                  { Status: '4' },
                ],
              },
            ],
          });
      });
    });

    describe('prepareSearchFilters', () => {
      it('throws an error if a filter other than type text is processed', () => {
        const filters = [
          {
            type: 'select',
            operator: EFilterOperator.Equal,
            key: 'TeamStatus',
          },
        ];
        try {
          wrapper.vm.prepareSearchFilters(filters);
        } catch (error) {
          expect(error)
            .toEqual(Error('only filter whose type is text can be processed here'));
        }
      });

      it('throws an error if a filter has type text but operator equals', () => {
        const filters = [
          {
            type: 'text',
            operator: EFilterOperator.Equal,
            key: 'TeamStatus',
          },
        ];
        try {
          wrapper.vm.prepareSearchFilters(filters);
        } catch (error) {
          expect(error)
            .toEqual(Error('filter with type text and operator equal cannot be processed here'));
        }
      });

      it('creates one string for search that aggregate all filters', () => {
        const filters = [
          {
            type: 'text',
            value: 'begin',
            operator: EFilterOperator.BeginsWith,
            key: 'TeamName',
          },
          {
            value: 'notContain',
            type: 'text',
            operator: EFilterOperator.DoesNotContain,
            key: 'UserName',
          },
        ];
        const finalFilters = wrapper.vm.prepareSearchFilters(filters);
        expect(finalFilters)
          .toEqual('(TeamName:/begin.*/ OR TeamName:"\\"begin\\"") AND UserName:(/.*/ NOT /.*notContain.*/)');
      });
    });

    describe('translateEqualOperator', () => {
      it('builds the proper structure for arrayNotEmpty value', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.Equal,
          type: EFilterType.Select,
          value: 'arrayNotEmpty',
        };
        const newFilter = wrapper.vm.translateEqualOperator(filter);
        expect(newFilter)
          .toEqual(_set({}, filter.key, { arrayNotEmpty: filter.value }));
      });

      it('builds the proper structure for arrayEmpty value', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.Equal,
          type: EFilterType.MultiSelect,
          value: 'arrayEmpty',
        };
        const newFilter = wrapper.vm.translateEqualOperator(filter);
        expect(newFilter)
          .toEqual(_set({}, filter.key, { arrayEmpty: filter.value }));
      });

      it('builds the proper structure for stringArrayNotEmpty value', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.Equal,
          type: EFilterType.MultiSelect,
          value: 'stringArrayNotEmpty',
        };
        const newFilter = wrapper.vm.translateEqualOperator(filter);
        expect(newFilter)
          .toEqual(_set({}, `not.${filter.key}`, '[]'));
      });

      it('builds the proper structure for stringArrayEmpty value', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.Equal,
          type: EFilterType.MultiSelect,
          value: 'stringArrayEmpty',
        };
        const newFilter = wrapper.vm.translateEqualOperator(filter);
        expect(newFilter)
          .toEqual(_set({}, filter.key, '[]'));
      });

      it('builds the proper structure when receiving a object as a value', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.Equal,
          type: EFilterType.MultiSelect,
          value: {
            text: 'text',
            value: 0,
          },
        };
        let newFilter = wrapper.vm.translateEqualOperator(filter);
        expect(newFilter)
          .toEqual(_set({}, filter.key, filter.value.value));

        filter.keyType = 'guid';
        newFilter = wrapper.vm.translateEqualOperator(filter);
        expect(newFilter)
          .toEqual(_set({}, filter.key, { value: filter.value.value, type: 'guid' }));
      });

      it('builds the proper structure for regular value', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.Equal,
          type: EFilterType.Date,
          value: 'today',
        };
        let newFilter = wrapper.vm.translateEqualOperator(filter);
        expect(newFilter)
          .toEqual(_set({}, filter.key, filter.value));

        filter.keyType = 'guid';
        newFilter = wrapper.vm.translateEqualOperator(filter);
        expect(newFilter)
          .toEqual(_set({}, filter.key, { value: filter.value, type: 'guid' }));
      });
    });

    describe('translateInOperator', () => {
      it('should build proper structure', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.In,
          type: EFilterType.Number,
          value: ['1', '2'],
        };

        const newFilter = wrapper.vm.translateInOperator(filter);
        const expected = {
          or: [
            { Prop: { Sub: '1' } },
            { Prop: { Sub: '2' } },
          ],
        };

        expect(newFilter).toEqual(expected);
      });
    });

    describe('Computed properties', () => {
      describe('filterLabels', () => {
        test('labels are ok', () => {
          const labels = {
            save: 'common.save',
            cancel: 'common.cancel',
            apply: 'common.apply',
            download: 'common.download',
            filterCopySuffix: 'common.copy',
            yourFilters: 'genericFilter.yourFilters',
            tooltipNew: 'genericFilter.newFilter',
            tooltipAdd: 'genericFilter.addFilter',
            tooltipCopy: 'genericFilter.copyFilter',
            tooltipDelete: 'genericFilter.deleteFilter',
            tooltipCloseFilter: 'genericFilter.clickToClose',
            removeTitle: 'genericFilter.deleteFilter',
            removeBody: 'genericFilter.removeBody',
            removeCancel: 'common.cancel',
            removeConfirm: 'common.confirm',
            importLabel: 'common.import',
            exportLabel: 'common.export',
            exportTitle: 'genericFilter.exportToCsv',
            exportCancel: 'common.cancel',
            exportDownload: 'common.download',
            exportFormat: 'genericFilter.exportFormat',
            exportItems: 'genericFilter.exportItems',
            formFilterName: 'genericFilter.filterName',
            formRequiredField: 'validations.required',
            defaultFilterName: 'genericFilter.defaultFilterName',
            filterSubtitle: 'genericFilter.filterSubtitle',
            dialogTitle: 'titleDialog',
            operators: {
              [EFilterOperator.Between]: 'genericFilter.operators.Between',
              [EFilterOperator.Equal]: 'genericFilter.operators.Equal',
              [EFilterOperator.GreaterEqual]: 'genericFilter.operators.GreaterEqual',
              [EFilterOperator.GreaterThan]: 'genericFilter.operators.GreaterThan',
              [EFilterOperator.LessThan]: 'genericFilter.operators.LessThan',
              [EFilterOperator.LessEqual]: 'genericFilter.operators.LessEqual',
              [EFilterOperator.In]: 'genericFilter.operators.In',
              [EFilterOperator.BeginsWith]: 'genericFilter.operators.BeginsWith',
              [EFilterOperator.EndsWith]: 'genericFilter.operators.EndsWith',
              [EFilterOperator.Contains]: 'genericFilter.operators.Contains',
              [EFilterOperator.DoesNotContain]: 'genericFilter.operators.DoesNotContain',
              [EFilterOperator.FuzzySearch]: 'genericFilter.operators.FuzzySearch',
            },
            errors: {
              // maxLength: 'genericFilter.errors.maxLength',
              // maxGreaterThanMin: 'genericFilter.errors.maxGreaterThanMin',
              // 401: 'genericFilter.errors.401',
              // 500: 'genericFilter.errors.500',
              // NoSelectedFilter: 'genericFilter.errors.noSelectedFilter',
              // Error409002CustomFilterDuplicateName: 'genericFilter.errors.duplicateName',
            },
          };
          expect(wrapper.vm.filterLabels)
            .toEqual(labels);
        });
      });

      describe('filterOperators', () => {
        test('labels are ok', () => {
          const operators = {
            [EFilterType.Text]: [
              {
                label: 'genericFilter.operators.Equal',
                operator: EFilterOperator.Equal,
              },
              {
                label: 'genericFilter.operators.BeginsWith',
                operator: EFilterOperator.BeginsWith,
              },
              // { label: 'Ends With', operator: EFilterOperator.EndsWith },
              {
                label: 'genericFilter.operators.Contains',
                operator: EFilterOperator.Contains,
              },
              // { label: 'genericFilter.operators.FuzzySearch', operator: EFilterOperator.FuzzySearch },
              // { label: 'Does not contain', operator: EFilterOperator.DoesNotContain },
            ],
            [EFilterType.Number]: [
              {
                label: 'genericFilter.operators.Equal',
                operator: EFilterOperator.Equal,
              },
              {
                label: 'genericFilter.operators.Between',
                operator: EFilterOperator.Between,
              },
              {
                label: 'genericFilter.operators.GreaterThan',
                operator: EFilterOperator.GreaterThan,
              },
              {
                label: 'genericFilter.operators.LessThan',
                operator: EFilterOperator.LessThan,
              },
            ],
            [EFilterType.Select]: [{
              label: 'genericFilter.operators.Equal',
              operator: EFilterOperator.Equal,
            }],
            [EFilterType.SelectExclude]: [
              {
                label: '',
                operator: EFilterOperator.NotEqual,
              },
            ],
            [EFilterType.MultiSelect]: [{
              label: 'genericFilter.operators.In',
              operator: EFilterOperator.In,
            }],
            [EFilterType.MultiSelectExclude]: [
              {
                label: '',
                operator: EFilterOperator.NotIn,
              },
            ],
            [EFilterType.Date]: [
              {
                label: 'genericFilter.operators.Equal',
                operator: EFilterOperator.Equal,
              },
              {
                label: 'genericFilter.operators.After',
                operator: EFilterOperator.GreaterThan,
              },
              {
                label: 'genericFilter.operators.OnOrAfter',
                operator: EFilterOperator.GreaterEqual,
              },
              {
                label: 'genericFilter.operators.Before',
                operator: EFilterOperator.LessThan,
              },
              {
                label: 'genericFilter.operators.OnOrBefore',
                operator: EFilterOperator.LessEqual,
              },
              {
                label: 'genericFilter.operators.Between',
                operator: EFilterOperator.Between,
              },
            ],
          };
          expect(wrapper.vm.filterOperators)
            .toEqual(operators);
        });
      });
    });
  });
});
