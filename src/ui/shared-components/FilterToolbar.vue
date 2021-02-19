<template>
  <rc-filter-toolbar
    v-bind="$attrs"
    :filter-key="filterKey"
    :filter-options="filterOptions"
    :labels="filterLabels"
    :response="response"
    @save:filter="onSave"
    @load:all="onLoadAll"
    @load:filter="onLoadFilter"
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
import {
  IFilterDTO, IFilterSettings, IFilterData, RcFilterToolbar, IFilterToolbarLabels,
} from '@crctech/component-library';
import { EFilterOperator, EFilterType } from '@crctech/component-library/src/types/FilterTypes';

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
      type: String,
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
      response: {},
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
        errorDialogTitle: this.$t('common.title.error') as string,
        errorDialogButton: this.$t('common.buttons.close') as string,
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
    async onSave(filter: IFilterDTO) {
      if (filter.id) {
        // this.response = await this.$services.filterToolbars.save(filter);
      } else {
        // this.response = await this.$services.filterToolbars.create(filter);
      }
    },

    /**
     * Handles fetching the list of filters from the API
     */
    async onLoadAll() {
      // this.response = await this.$services.filterToolbars.getAll(this.filterKey);
    },

    /**
     * Handles loading a filter to populate the form with saved data
     */
    async onLoadFilter(filterId: string) {
      // this.response = await this.$services.filterToolbars.get(filterId);
    },

    /**
     * Handles deleting a filter
     */
    async onDelete(filterId: string) {
      // this.response = await this.$services.filterToolbars.delete(filterId);
    },

    /**
     * Emits the event when a filter is applied or removed from the table
     */
    async onApplyFilter(filters: IFilterData[]) {
      const preparedFilters = this.prepareForOdataQuery(filters);
      this.$emit('update:appliedFilter', preparedFilters);
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
          _set(newFilter, key, { startswith_az: value });
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
     * Prepare filters to be used with https://www.npmjs.com/package/odata-query
     * @param filters
     */
    prepareForOdataQuery(filters: IFilterData []) {
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
