<template>
  <rc-filter-toolbar
    v-bind="$attrs"
    :filter-key="filterKey"
    :filter-options="filterOptions"
    :labels="filterLabels"
    :user-filters="userFilters"
    :loading="loading"
    @save:filter="onSave"
    @load:all="onLoadAll"
    @delete:filter="onDelete"
    @update:appliedFilter="onApplyFilter"
    @export="$emit('export')"
    @import="$emit('import')">
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
import {
  IFilterSettings, IFilterData, RcFilterToolbar, IFilterToolbarLabels,
} from '@crctech/component-library';
import { EFilterOperator, EFilterType } from '@crctech/component-library/src/types/FilterTypes';
import { IFilter, IUserAccountData } from '@/entities/user';

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
        tooltipAdd: this.$t('genericFilter.addFilter') as string,
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
        },
        errors: {
          maxLength: this.$t('genericFilter.errors.maxLength') as string,
          maxGreaterThanMin: this.$t('genericFilter.errors.maxGreaterThanMin') as string,
          401: this.$t('genericFilter.errors.401') as string,
          500: this.$t('genericFilter.errors.500') as string,
          NoSelectedFilter: this.$t('genericFilter.errors.noSelectedFilter') as string,
          Error409002CustomFilterDuplicateName: this.$t('genericFilter.errors.duplicateName') as string,
        },
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
      try {
        const userAccount = await this.$services.users.updateFilter(payload);
        this.refreshUserFilters(userAccount);
        this.$toasted.global.success(this.$t('filters.edit.success'));
      } finally {
        this.loading = false;
      }
    },

    async createFilter(filter: IFilter) {
      this.loading = true;
      try {
        const userAccount = await this.$services.users.createFilter(filter);
        this.refreshUserFilters(userAccount);
        this.$toasted.global.success(this.$t('filters.create.success'));
      } finally {
        this.loading = false;
      }
    },

    /**
     * Loading filters from the store
     */
    onLoadAll() {
      this.userFilters = this.$storage.user.getters.filtersByKey(this.filterKey);
    },

    /**
     * Handles deleting a filter
     */
    async onDelete(filter: IFilter) {
      this.loading = true;
      try {
        const userAccount = await this.$services.users.removeFilter({ deleteFilter: filter });
        this.refreshUserFilters(userAccount);
        this.$toasted.global.success(this.$t('filters.create.success'));
      } finally {
        this.loading = false;
      }
    },

    refreshUserFilters(userAccount: IUserAccountData) {
      this.$storage.user.mutations.setFilters(userAccount.filters);
      this.userFilters = this.$storage.user.getters.filtersByKey(this.filterKey);
    },

    /**
     * Emits the event when a filter is applied or removed from the table
     */
    async onApplyFilter(filters: IFilterData[]) {
      const searchFilters = filters.filter((f) => f.type === 'text' && f.operator !== EFilterOperator.Equal);

      const translatedSearchFilters = this.prepareSearchFilters(searchFilters);

      const preparedFilters = this.prepareFiltersForOdataQuery(_difference(filters, searchFilters));

      this.$emit('update:appliedFilter', { preparedFilters, searchFilters: translatedSearchFilters });
    },

    /**
     * Build object to be used by odata-query
     */
    translateFilter(filter: IFilterData) {
      const { key, operator } = filter;
      const { value } = filter;
      const newFilter = {} as Record<string, unknown>;

      switch (operator) {
        case EFilterOperator.Between:
          _set(newFilter, key, { ge: (value as Array<string | number>)[0], le: (value as Array<string | number>)[1] });
          break;
        case EFilterOperator.Equal:
          _set(newFilter, key, value);
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
          _set(newFilter, key, { in: value });
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
      const { value } = filter;

      if (type !== 'text') throw Error('only filter whose type is text can be processed here');
      if (type === 'text' && operator === EFilterOperator.Equal) throw Error('filter with type text and operator equal cannot be processed here');

      switch (operator) {
        case EFilterOperator.BeginsWith: // ex: FirstName:/Jo.*/
          return `${key}:/${value}.*/`;
        case EFilterOperator.Contains: // ex: EventName/Translation/En: "full string contains"
          return `${key}: "${value}"`;
          // return `${key}:/.*${value}.*/`;
        case EFilterOperator.DoesNotContain: // TeamName:(/.*/ NOT /.*name.*/)
          // return `${key}: "!${value}"`;
          return `${key}:(/.*/ NOT /.*${value}.*/)`;
        default:
          return '';
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

      filters.forEach((filter: IFilterData, index: number) => {
        const stringSearch = this.translateSearchFilter(filter);
        if (index === 0) {
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

      filters.forEach((filter: IFilterData) => {
        this.convertToInteger(filter);
        finalFilter = { ...finalFilter, ...this.translateFilter(filter) };
      });
      return finalFilter;
    },
  },
});

</script>
