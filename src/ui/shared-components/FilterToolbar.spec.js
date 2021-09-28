import { EFilterOperator, EFilterType } from '@crctech/component-library/src/types/FilterTypes';
import _set from 'lodash/set';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockUserAccountEntity, mockUserFilters, FilterKey } from '@/entities/user-account';
import { mockStorage } from '@/store/storage';
import Component from './FilterToolbar.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('Filter Toolbar', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
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
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Methods', () => {
    describe('onSave', () => {
      it('it calls editFilter in edit mode', async () => {
        const filter = {};
        const edit = true;
        const filterIndex = 1;
        jest.spyOn(wrapper.vm, 'editFilter').mockImplementation(() => null);

        await wrapper.vm.onSave({ filter, edit, filterIndex });
        expect(wrapper.vm.editFilter).toHaveBeenCalledWith(filter, filterIndex);
      });

      it('it calls createFilter otherwise', async () => {
        const filter = {};
        const edit = false;
        const filterIndex = 1;
        jest.spyOn(wrapper.vm, 'createFilter').mockImplementation(() => null);

        await wrapper.vm.onSave({ filter, edit, filterIndex });
        expect(wrapper.vm.createFilter).toHaveBeenCalledWith(filter);
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
        jest.spyOn(wrapper.vm, 'refreshUserFilters').mockImplementation(() => null);
        await wrapper.vm.editFilter(filter, filterIndex);

        expect(wrapper.vm.$storage.userAccount.actions.editFilter).toHaveBeenCalledWith(expectedPayload.oldFilter, expectedPayload.newFilter);
      });

      it('calls refreshUserFilters method', async () => {
        const filter = {};
        const filterIndex = 0;
        jest.spyOn(wrapper.vm, 'refreshUserFilters').mockImplementation(() => null);

        await wrapper.vm.editFilter(filter, filterIndex);

        expect(wrapper.vm.refreshUserFilters).toHaveBeenCalledTimes(1);
      });
    });

    describe('createFilter', () => {
      it('calls addFilter action with proper payload', async () => {
        const filter = {};
        jest.spyOn(wrapper.vm, 'refreshUserFilters').mockImplementation(() => null);

        await wrapper.vm.createFilter(filter);

        expect(wrapper.vm.$storage.userAccount.actions.addFilter).toHaveBeenCalledWith(filter);
      });

      it('calls refreshUserFilters method', async () => {
        const filter = {};
        jest.spyOn(wrapper.vm, 'refreshUserFilters').mockImplementation(() => null);

        await wrapper.vm.createFilter(filter);

        expect(wrapper.vm.refreshUserFilters).toHaveBeenCalledTimes(1);
      });

      it('does not call refreshUserFilters method if create filter failed', async () => {
        const filter = {};
        jest.spyOn(wrapper.vm, 'refreshUserFilters').mockImplementation(() => null);

        wrapper.vm.$storage.userAccount.actions.addFilter = jest.fn(() => null);

        await wrapper.vm.createFilter(filter);

        expect(wrapper.vm.refreshUserFilters).toHaveBeenCalledTimes(0);
      });
    });

    describe('onLoadAll', () => {
      it('calls getter currentUserFiltersByKey', async () => {
        await wrapper.vm.onLoadAll();
        expect(storage.userAccount.getters.currentUserFiltersByKey).toHaveBeenCalledWith(wrapper.vm.filterKey);
      });

      it('assign the result to userFilters', async () => {
        jest.spyOn(storage.userAccount.getters, 'currentUserFiltersByKey').mockImplementation(() => ['filters']);
        await wrapper.vm.onLoadAll();
        expect(wrapper.vm.userFilters).toEqual(['filters']);
      });
    });

    describe('onDelete', () => {
      it('calls deleteFilter action with proper payload', async () => {
        jest.spyOn(wrapper.vm, 'refreshUserFilters').mockImplementation(() => null);
        await wrapper.vm.onDelete(mockUserFilters()[0]);
        expect(wrapper.vm.$storage.userAccount.actions.deleteFilter).toHaveBeenCalledWith(mockUserFilters()[0]);
      });

      it('calls refreshUserFilters method', async () => {
        jest.spyOn(wrapper.vm, 'refreshUserFilters').mockImplementation(() => null);
        await wrapper.vm.onDelete({});
        expect(wrapper.vm.refreshUserFilters).toHaveBeenCalledTimes(1);
      });
    });

    describe('refreshUserFilters', () => {
      it('calls setCurrentUserAccount mutations with proper payload', async () => {
        await wrapper.vm.refreshUserFilters(mockUserAccountEntity());
        expect(storage.userAccount.mutations.setCurrentUserAccount).toHaveBeenCalledWith(mockUserAccountEntity());
      });

      it('calls filtersByKey and sets userFilters', async () => {
        jest.spyOn(storage.userAccount.getters, 'currentUserFiltersByKey').mockImplementation(() => ['filters']);
        await wrapper.vm.refreshUserFilters(mockUserAccountEntity());
        expect(storage.userAccount.getters.currentUserFiltersByKey).toHaveBeenCalledWith(wrapper.vm.filterKey);
        expect(wrapper.vm.userFilters).toEqual(['filters']);
      });
    });

    describe('onApplyFilter', () => {
      it('calls prepareFiltersForOdataQuery to prepare userFilters', () => {
        jest.spyOn(wrapper.vm, 'prepareFiltersForOdataQuery').mockImplementation(() => {});
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
        expect(wrapper.vm.prepareFiltersForOdataQuery).toHaveBeenCalledWith([filters[1]]);
      });

      it('calls translateSearchFilter to prepare userFilters of type "search"', () => {
        jest.spyOn(wrapper.vm, 'prepareSearchFilters').mockImplementation(() => {});
        const filters = [
          {
            type: 'text',
            operator: EFilterOperator.BeginsWith,
            key: 'TeamName',
          },
          {
            type: 'text',
            operator: EFilterOperator.DoesNotContain,
            key: 'UserName',
          },
          {
            type: 'text',
            operator: EFilterOperator.FuzzySearch,
            key: 'UserName',
          },
          {
            type: 'text',
            operator: EFilterOperator.Equal,
            key: 'UserName',
          },
          {
            type: 'select',
            operator: EFilterOperator.Equal,
            key: 'TeamStatus',
          },
        ];
        wrapper.vm.onApplyFilter(filters);
        expect(wrapper.vm.prepareSearchFilters).toHaveBeenCalledWith([filters[0], filters[1], filters[2]]);
      });

      it('emits update:appliedFilter with proper parameter', () => {
        jest.spyOn(wrapper.vm, 'prepareFiltersForOdataQuery').mockImplementation(() => 'preparedFilters');
        jest.spyOn(wrapper.vm, 'translateSearchFilter').mockImplementation(() => 'translateSearchFilter');
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
        expect(wrapper.emitted('update:appliedFilter')[0][0]).toEqual({ preparedFilters: 'preparedFilters', searchFilters: 'translateSearchFilter' });
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

      describe('Equal operator', () => {
        it('builds the proper structure for arrayNotEmpty value', () => {
          const filter = {
            key: 'Prop.Sub',
            operator: EFilterOperator.Equal,
            type: EFilterType.Select,
            value: 'arrayNotEmpty',
          };
          const newFilter = wrapper.vm.translateFilter(filter);
          expect(newFilter).toEqual(_set({}, filter.key, { arrayNotEmpty: filter.value }));
        });

        it('builds the proper structure for arrayEmpty value', () => {
          const filter = {
            key: 'Prop.Sub',
            operator: EFilterOperator.Equal,
            type: EFilterType.MultiSelect,
            value: 'arrayEmpty',
          };
          const newFilter = wrapper.vm.translateFilter(filter);
          expect(newFilter).toEqual(_set({}, filter.key, { arrayEmpty: filter.value }));
        });

        it('builds the proper structure for regular value', () => {
          const filter = {
            key: 'Prop.Sub',
            operator: EFilterOperator.Equal,
            type: EFilterType.Date,
            value: 'today',
          };
          const newFilter = wrapper.vm.translateFilter(filter);
          expect(newFilter).toEqual(_set({}, filter.key, filter.value));
        });
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
        expect(newFilter).toEqual(_set({}, filter.key, { searchIn_az: filter.value }));
      });

      it('builds the proper structure for BeginsWith operator', () => {
        const filter = {
          key: 'Prop.Sub',
          operator: EFilterOperator.BeginsWith,
          type: EFilterType.Text,
          value: 'start',
        };
        const newFilter = wrapper.vm.translateFilter(filter);
        expect(newFilter).toEqual(_set({}, filter.key, { startsWith_az: filter.value }));
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

    describe('translateSearchFilter', () => {
      it('creates the correct string for BeginsWith operator', () => {
        const filter = {
          type: 'text',
          value: 'myValue',
          operator: EFilterOperator.BeginsWith,
          key: 'TeamName',
        };
        const newFilter = wrapper.vm.translateSearchFilter(filter);
        expect(newFilter).toEqual('TeamName:/myValue.*/');
      });

      it('creates the correct string for Contains operator', () => {
        const filter = {
          type: 'text',
          value: 'myValue',
          operator: EFilterOperator.Contains,
          key: 'TeamName',
        };
        const newFilter = wrapper.vm.translateSearchFilter(filter);
        expect(newFilter).toEqual('TeamName: /.*myValue.*/');
      });

      it('creates the correct string for DoesNotContain operator', () => {
        const filter = {
          type: 'text',
          value: 'myValue',
          operator: EFilterOperator.DoesNotContain,
          key: 'TeamName',
        };
        const newFilter = wrapper.vm.translateSearchFilter(filter);
        expect(newFilter).toEqual('TeamName:(/.*/ NOT /.*myValue.*/)');
      });

      it('creates the correct string for Fuzzy Search operator', () => {
        const filter = {
          type: 'text',
          value: 'myValue',
          operator: EFilterOperator.FuzzySearch,
          key: 'TeamName',
        };
        const newFilter = wrapper.vm.translateSearchFilter(filter);
        expect(newFilter).toEqual('TeamName: "myValue~"');
      });

      it('creates the correct string for Equals Search operator', () => {
        const filter = {
          type: 'text',
          value: 'myValue',
          operator: EFilterOperator.Equal,
          key: 'TeamName',
        };
        const newFilter = wrapper.vm.translateSearchFilter(filter);
        expect(newFilter).toEqual('TeamName: "myValue"');
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
        expect(finalFilters).toEqual({
          Number: 2,
          Text: '12345',
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
          expect(error).toEqual(Error('only filter whose type is text can be processed here'));
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
          expect(error).toEqual(Error('filter with type text and operator equal cannot be processed here'));
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
        expect(finalFilters).toEqual('TeamName:/begin.*/ AND UserName:(/.*/ NOT /.*notContain.*/)');
      });
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
        expect(wrapper.vm.filterLabels).toEqual(labels);
      });
    });

    describe('filterOperators', () => {
      test('labels are ok', () => {
        const operators = {
          text: [
            { label: 'genericFilter.operators.Equal', operator: EFilterOperator.Equal },
            { label: 'genericFilter.operators.BeginsWith', operator: EFilterOperator.BeginsWith },
            // { label: 'Ends With', operator: EFilterOperator.EndsWith },
            { label: 'genericFilter.operators.Contains', operator: EFilterOperator.Contains },
            // { label: 'genericFilter.operators.FuzzySearch', operator: EFilterOperator.FuzzySearch },
            // { label: 'Does not contain', operator: EFilterOperator.DoesNotContain },
          ],
          number: [
            { label: 'genericFilter.operators.Equal', operator: EFilterOperator.Equal },
            { label: 'genericFilter.operators.Between', operator: EFilterOperator.Between },
            { label: 'genericFilter.operators.GreaterThan', operator: EFilterOperator.GreaterThan },
            { label: 'genericFilter.operators.LessThan', operator: EFilterOperator.LessThan },
          ],
          select: [{ label: 'genericFilter.operators.Equal', operator: EFilterOperator.Equal }],
          multiselect: [{ label: 'genericFilter.operators.In', operator: EFilterOperator.In }],
          date: [
            { label: 'genericFilter.operators.Equal', operator: EFilterOperator.Equal },
            { label: 'genericFilter.operators.After', operator: EFilterOperator.GreaterThan },
            { label: 'genericFilter.operators.OnOrAfter', operator: EFilterOperator.GreaterEqual },
            { label: 'genericFilter.operators.Before', operator: EFilterOperator.LessThan },
            { label: 'genericFilter.operators.OnOrBefore', operator: EFilterOperator.LessEqual },
            { label: 'genericFilter.operators.Between', operator: EFilterOperator.Between },
          ],
          selectExclude: [
            { label: '', operator: EFilterOperator.NotEqual },
          ],
          multiselectExclude: [
            { label: '', operator: EFilterOperator.NotIn },
          ],
        };
        expect(wrapper.vm.filterOperators).toEqual(operators);
      });
    });
  });
});
