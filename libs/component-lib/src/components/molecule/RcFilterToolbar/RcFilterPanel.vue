<template>
  <rc-dialog
    v-if="show"
    :show="show"
    :title="labels.dialogTitle"
    :show-apply="true"
    :content-only-scrolling="true"
    :apply-button-disabled="!formValid"
    :submit-button-disabled="!formValid || !formChanged"
    :apply-action-label="labels.apply"
    :cancel-action-label="labels.cancel"
    :submit-action-label="labels.save"
    persistent
    fullscreen
    :loading="loading"
    @close="onCancel"
    @cancel="onCancel"
    @apply="onApply"
    @submit="onSave">
    <v-row class="pt-4">
      <v-col cols="1.5" />
      <v-col cols="3">
        <rc-filter-list
          v-if="!loading"
          :labels="labels"
          :filters="availableFilters"
          :current-filter-name="currentFilterName"
          v-on="$listeners"
          @load:filter="onLoad"
          @copy:filter="onCopy"
          @new:filter="onNew"
          @delete:filter="onDelete" />
      </v-col>

      <v-divider class="grey-lighten-4 ml-4 mr-8" vertical />

      <v-col cols="6">
        <rc-filter-form
          ref="filterForm"
          :labels="labels"
          :filter-options="filterOptions"
          :filter-operators="filterOperators"
          :form-data.sync="formData"
          @validate="formValid = $event"
          @update:autocomplete="$emit('update:autocomplete', $event)"
          @change:autocomplete="$emit('change:autocomplete', $event)"
          @form-changed="formChanged = $event" />
      </v-col>
      <v-col cols="1.5" />
    </v-row>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import _slice from 'lodash/slice';
import RcDialog from '@libs/component-lib/components/atoms/RcDialog.vue';
import {
  EFilterOperator,
  EFilterPanelEvents,
  EFilterType,
  FilterFormData,
  IFilter,
  IFilterDTO,
  IFilterSettings,
  IFilterToolbarLabels,
  IFilterTypeOperators,
} from '@libs/component-lib/types';
import RcFilterForm from './RcFilterForm.vue';
import RcFilterList from './RcFilterList.vue';

/**
 * A filter toolbar which allows the user to build preset filters used for search queries.
 *
 */
export default Vue.extend({
  name: 'RcFilterPanel',

  components: {
    RcFilterForm,
    RcFilterList,
    RcDialog,
  },

  props: {
    /**
     * Control whether to show panel or not.
     */
    show: {
      type: Boolean,
      default: false,
    },

    /**
     * Contains localizable labels that are used by component.
     */
    labels: {
      type: Object as () => IFilterToolbarLabels,
      default: null,
    },

    filterKey: {
      type: Number,
      required: true,
    },

    /**
     * The array of filters to show in the filter panel.
     * @property {string} key The key of the field to filter on
     * @property {string} type The type of filter. Options are text, number, date, daterange, select, multiselect.
     * @property {string} label The label for the filter input.
     * @property {Array<Record<string, string>>} items The items to render in a select or multiselect.
     */
    filterOptions: {
      type: Array as () => Array<IFilterSettings>,
      required: true,
    },

    /** filter types operators */
    filterOperators: {
      type: Object as () => IFilterTypeOperators,
      required: true,
    },

    /** Once apply filter triggered, a filter marked as selected and will appear on FilterToolbar. */
    selectedFilter: {
      type: Object as () => IFilter,
      default: null,
    },

    userFilters: {
      type: Array as () => Array<IFilterDTO>,
      default: () => [] as Array<IFilterDTO>,
    },

    loading: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      formValid: false,
      formChanged: false,
      availableFilters: [] as Array<IFilterDTO>, // user filters on list component.
      formData: {} as FilterFormData, // filter values on form component.
      showPanelEvent: EFilterPanelEvents.UpdateShow, // control whether to show panel component or not.
      editMode: false,
      filterIndex: -1,
      currentFilterName: '',
    };
  },

  watch: {
    show(newValue) {
      if (newValue === false) {
        this.formValid = false;
        this.formChanged = false;
        this.formData = this.getInitialFormData();
      }
    },

    userFilters(newFilters) {
      this.availableFilters = newFilters;

      // After a new filter has been saved
      this.currentFilterName = this.editMode ? this.formData.name : '';
    },
  },

  mounted() {
    this.formData = this.getInitialFormData();
    this.$emit(EFilterPanelEvents.Load);
  },

  methods: {
    onNew() {
      this.clearForm();
    },

    onCopy() {
      const tmpName = `${this.formData.name} ${this.labels.filterCopySuffix}`;
      // clear the form key fields
      this.formData.name = tmpName;
      this.currentFilterName = tmpName;
      this.editMode = false;
    },

    onCancel() {
      this.$emit(`${this.showPanelEvent}`, false);
    },

    onApply() {
      let counter = 0;
      const filter: IFilter = { name: this.formData.name, filters: [] };
      this.filterOptions.forEach((option) => {
        const filterValue = this.formData.values[option.key];
        if (filterValue.value || filterValue.value === false) {
          filter.filters[counter] = {
            key: option.key,
            keyType: option.keyType,
            dateMode: option.dateMode,
            type: option.type,
            operator: filterValue.operator,
            value: filterValue.value,
          };
          counter += 1;
        }
      });
      this.$emit(EFilterPanelEvents.UpdateSelectedFilter, filter);
      this.$emit(`${this.showPanelEvent}`, false);
    },

    onSave() {
      const filter = {
        name: this.formData.name,
        filterKey: this.filterKey,
        criteria: [] as unknown [][],
      };

      this.filterOptions.forEach((option) => {
        const filterValue = this.formData.values[option.key];
        const hasValue = (filterValue.value || filterValue.value === false)
          ? filterValue.value.toString().length > 0 || (filterValue.value as string[]).length > 0 : false;
        if (filterValue && hasValue) {
          let flItems: Array<string | boolean> = [];
          flItems = flItems.concat(option.key, filterValue.operator, filterValue.value);
          filter.criteria.push(flItems);
        }
      });

      const filterIndex = this.filterIndex === -1 ? 0 : this.filterIndex;

      this.$emit(EFilterPanelEvents.Save, { filter, edit: this.editMode, filterIndex });
    },

    onDelete() {
      this.clearForm();
      this.$emit(EFilterPanelEvents.Load);
    },

    onLoad({ filter, index }: { filter: IFilterDTO; index: number }) {
      this.editMode = true;
      this.filterIndex = index;
      this.formData = this.getFormData(filter);
      this.currentFilterName = this.formData.name;
      this.$emit('load:filter', this.formData);
    },

    clearForm() {
      this.editMode = false;
      this.formData = this.getInitialFormData(); // clear form data
      this.formValid = false;
      this.formChanged = false;
      this.currentFilterName = '';
    },

    getInitialFormData(): FilterFormData {
      return this.getFormData({} as IFilterDTO);
    },

    getFormData(filterDTO: IFilterDTO): FilterFormData {
      const dto = filterDTO;
      let filter: FilterFormData = { name: this.labels.defaultFilterName, values: {} };

      // structure: <key, {operator, value1}> or <key, {operator, [value1, value2...]}>
      const dic: Record<string, { operator: string; value: string | Array<string> }> = {};
      if (dto && dto.criteria) {
        filter = { name: dto.name, values: {} }; // set values

        dto.criteria.forEach((params) => {
          dic[params[0]] = { operator: params[1], value: _slice(params, 2, params.length) };
        });
      }

      for (let index = 0; index < this.filterOptions.length; index += 1) {
        const flOption = this.filterOptions[index];
        const vl = dic[flOption.key];
        let itemValue: string | Array<string>;
        let itemOperator: string = this.filterOperators[flOption.type][0].operator;

        if (vl) {
          itemOperator = vl.operator;
        }

        switch (flOption.type) {
          case EFilterType.MultiSelect:
          case EFilterType.MultiSelectExclude:
            itemValue = vl ? vl.value : [];
            filter.values[flOption.key] = { operator: itemOperator, value: itemValue };
            break;
          case EFilterType.Date:
          case EFilterType.Number:
            if (itemOperator === EFilterOperator.Between) {
              itemValue = vl ? vl.value : [];
              filter.values[flOption.key] = { operator: itemOperator, value: itemValue };
            } else {
              itemValue = vl ? vl.value.toString() : '';
              filter.values[flOption.key] = { operator: itemOperator, value: itemValue };
            }
            break;
          default:
            itemValue = vl && vl.value && vl.value.length ? vl.value[0] : '';
            filter.values[flOption.key] = { operator: itemOperator, value: itemValue };
            break;
        }
      }

      return filter;
    },
  },
});
</script>
