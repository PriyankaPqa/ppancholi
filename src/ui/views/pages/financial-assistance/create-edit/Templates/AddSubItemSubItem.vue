<template>
  <div class="flex-row">
    <v-select-with-validation
      v-model="value"
      data-test="financialAssistanceItems__addSubItemSelect"
      hide-details
      return-object
      dense
      background-color="white"
      :items="getSubItems()"
      :item-text="(item) => $m(item.name)"
      :rules="{ required: true }"
      :label="`${$t('financialAssistance.nestedTable.headers.subItem')}*`" />

    <tooltip-financial-assistance-category
      v-if="value && value.description && $m(value.description)"
      class-name="ml-1"
      :label="$m(value.description)" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { VSelectWithValidation } from '@crctech/component-library';
import { EOptionListItemStatus, IOptionSubItem } from '@/entities/optionItem';
import { IFinancialAssistanceTableRow, IFinancialAssistanceTableSubRow } from '@/entities/financial-assistance';
import TooltipFinancialAssistanceCategory from '../TooltipFinancialAssistanceCategory.vue';

export default Vue.extend({
  name: 'AddSubItemSubItem',

  components: {
    VSelectWithValidation,
    TooltipFinancialAssistanceCategory,
  },

  props: {
    item: {
      type: Object as () => IFinancialAssistanceTableSubRow,
      default: null,
    },

    parent: {
      type: Object as () => IFinancialAssistanceTableRow,
      required: true,
    },

    financialAssistanceCategories: {
      type: Array,
      required: true,
    },
  },

  computed: {
    /**
     * The value prop of the new item
     */
    value: {
      get(): IOptionSubItem {
        return this.$storage.financialAssistance.getters.newSubItem().subCategory;
      },

      set(value: IOptionSubItem) {
        this.$storage.financialAssistance.mutations.setNewSubItemSubItem(value);
      },
    },
  },

  methods: {
    getSubItems(): Array<IOptionSubItem> {
      const subitemsFromBE: IOptionSubItem[] = this.parent.mainCategory.subitems;

      if (!subitemsFromBE?.length) {
        return [
          {
            name: {
              translation: {
                en: 'Default',
                fr: 'Défaut',
              },
            },
            orderRank: 0,
            status: EOptionListItemStatus.Active,
            isOther: false,
            isDefault: true,
            id: '-1',
          },
        ];
      }

      const existingSubItems = this.parent.subRows;

      const unSelected = subitemsFromBE.filter(
        (si) => !existingSubItems.some((sI) => sI.subCategory.id === si.id) && si.status === EOptionListItemStatus.Active,
      );

      if (this.item) {
        return [this.item.subCategory, ...unSelected];
      }

      return unSelected;
    },
  },
});
</script>
