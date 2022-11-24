<template>
  <rc-filter-toolbar
    ref="rcFilterToolbar"
    v-bind="$attrs"
    :filter-key="filterKey"
    :filter-options="filterOptions"
    :filter-operators="filterOperators"
    :labels="filterLabels"
    :user-filters="userFilters"
    :initial-filter="initialFilter"
    :loading="loading"
    @save:filter="onSave"
    @load:all="onLoadAll"
    @delete:filter="onDelete"
    @update:appliedFilter="onApplyFilter"
    @export="$emit('export')"
    @import="$emit('import')"
    @open="$emit('open')"
    @update:autocomplete="$emit('update:autocomplete', $event)"
    @change:autocomplete="$emit('change:autocomplete', $event)"
    @load:filter="$emit('load:filter', $event)">
    <!-- Template for toolbar -->
    <template #toolbarActions>
      <slot name="toolbarActions" />
    </template>
  </rc-filter-toolbar>
</template>

<script lang="ts">
import Vue from 'vue';
import _set from 'lodash/set';
import _difference from 'lodash/difference';
import { RcFilterToolbar } from '@libs/component-lib/components';
import {
  EFilterKeyType, EFilterOperator, EFilterType, IFilterData, IFilterSettings, IFilterToolbarLabels, IFilterTypeOperators,
} from '@libs/component-lib/types';
import { IFilter, IUserAccountEntity } from '@libs/entities-lib/user-account';

// A wrapper around the web-ui filter component to make integration as easy and consistent as possible
// Includes translations for labels as well as handling API requests to create/save/delete filters
export default Vue.extend({
  name: 'FilterToolbar',

  components: {
    RcFilterToolbar,
  },

  props: {
    /**
     * The key of the set of filters to save to the database.
     * Should match the name of the table, eg 'eventBeneficiaries'
     */
    filterKey: {
      type: Number,
      required: true,
    },

    /**
     * The filter options to configure what fields are available in the filter panel
     */
    filterOptions: {
      type: Array as () => Array<IFilterSettings>,
      required: true,
    },

    titleDialog: {
      type: String,
      default: '',
    },

    addFilterLabel: {
      type: String,
      default: null,
    },

    initialFilter: {
      type: Object as () => IFilter,
      default: () => ({}),
    },
  },

  data() {
    return {
      userFilters: [],
      loading: false,
    };
  },

  computed: {
    /**
     * Configure the translated text and labels to be injected into the component
     */
    filterLabels(): IFilterToolbarLabels {
      return {
        save: this.$t('common.save') as string,
        cancel: this.$t('common.cancel') as string,
        apply: this.$t('common.apply') as string,
        download: this.$t('common.download') as string,
        filterCopySuffix: this.$t('common.copy') as string,
        yourFilters: this.$t('genericFilter.yourFilters') as string,
        tooltipNew: this.$t('genericFilter.newFilter') as string,
        tooltipAdd: this.$t(this.addFilterLabel) as string || this.$t('genericFilter.addFilter') as string,
        tooltipCopy: this.$t('genericFilter.copyFilter') as string,
        tooltipDelete: this.$t('genericFilter.deleteFilter') as string,
        tooltipCloseFilter: this.$t('genericFilter.clickToClose') as string,
        removeTitle: this.$t('genericFilter.deleteFilter') as string,
        removeBody: this.$t('genericFilter.removeBody') as string,
        removeCancel: this.$t('common.cancel') as string,
        removeConfirm: this.$t('common.confirm') as string,
        importLabel: this.$t('common.import') as string,
        exportLabel: this.$t('common.export') as string,
        exportTitle: this.$t('genericFilter.exportToCsv') as string,
        exportCancel: this.$t('common.cancel') as string,
        exportDownload: this.$t('common.download') as string,
        exportFormat: this.$t('genericFilter.exportFormat') as string,
        exportItems: this.$t('genericFilter.exportItems') as string,
        formFilterName: this.$t('genericFilter.filterName') as string,
        formRequiredField: this.$t('validations.required') as string,
        defaultFilterName: this.$t('genericFilter.defaultFilterName') as string,
        filterSubtitle: this.$t('genericFilter.filterSubtitle') as string,
        dialogTitle: this.titleDialog,
        operators: {
          [EFilterOperator.Between]: this.$t('genericFilter.operators.Between') as string,
          [EFilterOperator.Equal]: this.$t('genericFilter.operators.Equal') as string,
          [EFilterOperator.GreaterEqual]: this.$t('genericFilter.operators.GreaterEqual') as string,
          [EFilterOperator.GreaterThan]: this.$t('genericFilter.operators.GreaterThan') as string,
          [EFilterOperator.LessThan]: this.$t('genericFilter.operators.LessThan') as string,
          [EFilterOperator.LessEqual]: this.$t('genericFilter.operators.LessEqual') as string,
          [EFilterOperator.In]: this.$t('genericFilter.operators.In') as string,
          [EFilterOperator.BeginsWith]: this.$t('genericFilter.operators.BeginsWith') as string,
          [EFilterOperator.EndsWith]: this.$t('genericFilter.operators.EndsWith') as string,
          [EFilterOperator.Contains]: this.$t('genericFilter.operators.Contains') as string,
          [EFilterOperator.DoesNotContain]: this.$t('genericFilter.operators.DoesNotContain') as string,
          [EFilterOperator.FuzzySearch]: this.$t('genericFilter.operators.FuzzySearch') as string,
        },
        errors: {
        },
      };
    },

    filterOperators(): IFilterTypeOperators {
      return {
        [EFilterType.Text]: [
          { label: this.$t('genericFilter.operators.Equal') as string, operator: EFilterOperator.Equal },
          { label: this.$t('genericFilter.operators.BeginsWith') as string, operator: EFilterOperator.BeginsWith },
          // { label: 'Ends With', operator: EFilterOperator.EndsWith },
          { label: this.$t('genericFilter.operators.Contains') as string, operator: EFilterOperator.Contains },
          // { label: this.$t('genericFilter.operators.FuzzySearch') as string, operator: EFilterOperator.FuzzySearch },
          // { label: 'Does not contain', operator: EFilterOperator.DoesNotContain },
        ],
        [EFilterType.Number]: [
          { label: this.$t('genericFilter.operators.Equal') as string, operator: EFilterOperator.Equal },
          { label: this.$t('genericFilter.operators.Between') as string, operator: EFilterOperator.Between },
          { label: this.$t('genericFilter.operators.GreaterThan') as string, operator: EFilterOperator.GreaterThan },
          { label: this.$t('genericFilter.operators.LessThan') as string, operator: EFilterOperator.LessThan },
        ],
        [EFilterType.Select]: [
          { label: this.$t('genericFilter.operators.Equal') as string, operator: EFilterOperator.Equal },
        ],
        [EFilterType.SelectExclude]: [
          { label: '', operator: EFilterOperator.NotEqual },
        ],
        [EFilterType.MultiSelect]: [
          { label: this.$t('genericFilter.operators.In') as string, operator: EFilterOperator.In },
        ],
        [EFilterType.MultiSelectExclude]: [
          { label: '', operator: EFilterOperator.NotIn },
        ],
        [EFilterType.Date]: [
          { label: this.$t('genericFilter.operators.Equal') as string, operator: EFilterOperator.Equal },
          { label: this.$t('genericFilter.operators.After') as string, operator: EFilterOperator.GreaterThan },
          { label: this.$t('genericFilter.operators.OnOrAfter') as string, operator: EFilterOperator.GreaterEqual },
          { label: this.$t('genericFilter.operators.Before') as string, operator: EFilterOperator.LessThan },
          { label: this.$t('genericFilter.operators.OnOrBefore') as string, operator: EFilterOperator.LessEqual },
          { label: this.$t('genericFilter.operators.Between') as string, operator: EFilterOperator.Between },
        ],
      };
    },
  },

  methods: {
    /**
     * Handles either updating or saving a new filter
     */
    async onSave({ filter, edit, filterIndex }: { filter: IFilter, edit: boolean, filterIndex: number }) {
      this.loading = true;

      if (edit) {
        await this.editFilter(filter, filterIndex);
      } else {
        await this.createFilter(filter);
      }
      this.loading = false;
    },

    async editFilter(filter: IFilter, filterIndex: number) {
      const payload = {
        oldFilter: this.userFilters[filterIndex],
        newFilter: filter,
      };
      this.loading = true;

      const userAccount = await this.$storage.userAccount.actions.editFilter(payload.oldFilter, payload.newFilter);
      if (userAccount) {
        this.refreshUserFilters(userAccount);
        this.$toasted.global.success(this.$t('filters.edit.success'));
      }

      this.loading = false;
    },

    async createFilter(filter: IFilter) {
      this.loading = true;
      try {
        const userAccount = await this.$storage.userAccount.actions.addFilter(filter);
        if (userAccount) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this.$refs.rcFilterToolbar as any).setEditMode(true);
          this.refreshUserFilters(userAccount);
          this.$toasted.global.success(this.$t('filters.create.success'));
        }
      } finally {
        this.loading = false;
      }
    },

    /**
     * Loading filters from the store
     */
    onLoadAll() {
      this.userFilters = this.$storage.userAccount.getters.currentUserFiltersByKey(this.filterKey);
    },

    /**
     * Handles deleting a filter
     */
    async onDelete(filter: IFilter) {
      this.loading = true;
      try {
        const userAccount = await this.$storage.userAccount.actions.deleteFilter(filter);
        this.refreshUserFilters(userAccount);
        this.$toasted.global.success(this.$t('filters.delete.success'));
      } finally {
        this.loading = false;
      }
    },

    refreshUserFilters(userAccount: IUserAccountEntity) {
      this.$storage.userAccount.mutations.setCurrentUserAccount(userAccount);
      this.userFilters = this.$storage.userAccount.getters.currentUserFiltersByKey(this.filterKey);
    },

    /**
     * Emits the event when a filter is applied or removed from the table
     */
    async onApplyFilter(filters: IFilterData[], filterState: IFilter) {
      const searchFilters = filters.filter((f) => f.type === 'text');

      const translatedSearchFilters = this.prepareSearchFilters(searchFilters);
      const preparedFilters = this.prepareFiltersForOdataQuery(_difference(filters, searchFilters));

      this.$emit('update:appliedFilter', { preparedFilters, searchFilters: translatedSearchFilters }, filterState);
    },

    /**
     * Build object to be used by odata-query
     */
    translateFilter(filter: IFilterData) {
      const { key, operator } = filter;
      const { value } = filter;
      let newFilter = {} as Record<string, unknown>;

      switch (operator) {
        case EFilterOperator.Between:
          _set(newFilter, key, { ge: (value as Array<string | number>)[0], le: (value as Array<string | number>)[1] });
          break;
        case EFilterOperator.Equal:
          newFilter = this.translateEqualOperator(filter);
          break;
        case EFilterOperator.NotEqual:
          if (filter.keyType === EFilterKeyType.Array) {
            _set(newFilter, key, { notEqualOnArray_az: value });
          } else {
            _set(newFilter, `not.${key}`, value);
          }
          break;
        case EFilterOperator.GreaterEqual:
          _set(newFilter, key, { ge: value });
          break;
        case EFilterOperator.GreaterThan:
          _set(newFilter, key, { gt: value });
          break;
        case EFilterOperator.LessThan:
          _set(newFilter, key, { lt: value });
          break;
        case EFilterOperator.LessEqual:
          _set(newFilter, key, { le: value });
          break;
        case EFilterOperator.In:
          newFilter = this.translateInOperator(filter);
          break;
        case EFilterOperator.NotIn:
          if (filter.keyType === EFilterKeyType.Array) {
            _set(newFilter, key, { notSearchInOnArray_az: value });
          } else {
            _set(newFilter, key, { notSearchIn_az: value });
          }
          break;
        case EFilterOperator.BeginsWith:
          _set(newFilter, key, { startsWith_az: value });
          break;
        case EFilterOperator.Contains:
          _set(newFilter, key, { contains_az: value });
          break;
        case EFilterOperator.DoesNotContain:
          newFilter.not = {};
          _set(newFilter, `not.${key}`, { contains_az: value });
          break;
        default:
      }

      return newFilter;
    },

    translateSearchFilter(filter: IFilterData) {
      const { key, operator, type } = filter;
      const value = filter.value == null ? '' : filter.value as string;

      if (type !== 'text') {
        throw Error('only filter whose type is text can be processed here');
      }

      switch (operator) {
        case EFilterOperator.BeginsWith: // ex: FirstName:/Jo.*/ + equal
          return value.split(' ').filter((x) => x !== '').map((v) => `(${key}:/${v}.*/ OR ${key}:"\\"${v}\\"")`);
        case EFilterOperator.Contains: // ex: EventName/Translation/En: "full string contains" + equal
          return value.split(' ').filter((x) => x !== '').map((v) => `(${key}:/.*${v}.*/ OR ${key}:"\\"${v}\\"")`);
        case EFilterOperator.DoesNotContain: // TeamName:(/.*/ NOT /.*name.*/)
          return [`${key}:(/.*/ NOT /.*${value}.*/)`];

        case EFilterOperator.FuzzySearch:
          return [`${key}:"${value}~"`];

        case EFilterOperator.Equal: // ex: EventName:"\"forest fire\""
          return [`${key}:"\\"${value}\\""`];
        default:
          return [''];
      }
    },

    /**
     * Convert value string number to real number so it can be used in azure search
     */
    convertToInteger(filter: IFilterData) {
      // Convert "123" to 123
      if (filter.type === EFilterType.Number) {
        if (Array.isArray(filter.value)) {
          filter.value[0] = Number(filter.value[0]);
          filter.value[1] = Number(filter.value[1]);
        } else {
          filter.value = Number(filter.value);
        }
      }
    },

    /**
     * Prepare search filters to be add to the query
     * @param filters
     */
    prepareSearchFilters(filters: IFilterData []) {
      let finalFilter = '';

      const translatedFilters = ([] as string[]).concat(...filters.map((filter) => this.translateSearchFilter(filter)));
      translatedFilters.forEach((stringSearch) => {
        if (finalFilter === '') {
          finalFilter = `${stringSearch}`;
        } else {
          finalFilter += ` AND ${stringSearch}`;
        }
      });

      return finalFilter;
    },

    /**
     * Prepare filters to be used with https://www.npmjs.com/package/odata-query
     * @param filters
     */
    prepareFiltersForOdataQuery(filters: IFilterData []) {
      let finalFilter = {};
      const orFilters = [] as Array<Record<string, unknown>>;

      filters.forEach((filter: IFilterData) => {
        this.convertToInteger(filter);

        const translatedFilter = this.translateFilter(filter);
        // If filters are linked with a OR they need to be merged with a AND
        // Check the test to understand

        if (Object.keys(translatedFilter).includes('or')) {
          orFilters.push(translatedFilter);
        } else {
          finalFilter = { ...finalFilter, ...translatedFilter };
        }
      });

      if (orFilters.length > 0) {
        return { ...finalFilter, ...{ and: orFilters } };
      }
      return finalFilter;
    },

    translateEqualOperator(filter: IFilterData) {
      // To filter on a property not empty
      if (filter.value === 'arrayNotEmpty' && [EFilterType.Select, EFilterType.MultiSelect].includes(filter.type)) {
        return _set({}, filter.key, { arrayNotEmpty: filter.value });
        // To filter on a property which is empty
      } if (filter.value === 'arrayEmpty' && [EFilterType.Select, EFilterType.MultiSelect].includes(filter.type)) {
        return _set({}, filter.key, { arrayEmpty: filter.value });
        // WHen using autocomplete returning an object, we need to extract the real value
      } if (Object.prototype.toString.call(filter.value) === '[object Object]' && Object.prototype.hasOwnProperty.call(filter.value, 'value')) {
        return _set({}, filter.key, (filter.value as { text: string, value: string }).value);
      }
      return _set({}, filter.key, filter.value);
    },

    translateInOperator(filter: IFilterData) {
      // We cannot search.in for empty string
      // So we need to replace by key eq '' or key eq 'test' instead of search.in(key, '"", test', ',')
      // _set(newFilter, key, { searchIn_az: value });

      const values = filter.value as string[];

      const or = values.map((v) => _set({}, filter.key, v));

      return _set({}, 'or', or);
    },
  },
});

</script>
