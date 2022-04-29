<template>
  <div class="flex-row">
    <v-select-with-validation
      v-model="value"
      data-test="financialAssistanceItems__addItemSelect"
      hide-details
      return-object
      dense
      background-color="white"
      :items="filteredCategories"
      :item-text="(item) => $m(item.name)"
      :rules="{ required: true }"
      :label="`${$t('financialAssistance.nestedTable.headers.item')}*`" />

    <tooltip-financial-assistance-category
      v-if="value && value.description && $m(value.description)"
      class-name="ml-1"
      :label="$m(value.description)" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { VSelectWithValidation } from '@libs/component-lib/components';
import { IOptionItem } from '@/entities/optionItem';
import { IFinancialAssistanceTableItem } from '@/entities/financial-assistance';
import { Status } from '@libs/core-lib/entities/base';
import TooltipFinancialAssistanceCategory from '../TooltipFinancialAssistanceCategory.vue';

export default Vue.extend({
  name: 'AddItemItem',

  components: {
    VSelectWithValidation,
    TooltipFinancialAssistanceCategory,
  },

  props: {
    financialAssistanceCategories: {
      type: Array as () => IOptionItem[],
      required: true,
    },

    item: {
      type: Object as () => IFinancialAssistanceTableItem,
      default: null,
    },

    items: {
      type: Array as () => IFinancialAssistanceTableItem[],
      required: true,
    },
  },

  computed: {
    /**
     * The item prop of the new item
     */
    value: {
      get(): IOptionItem {
        return this.$storage.financialAssistance.getters.newItem().mainCategory;
      },

      set(value: IOptionItem) {
        this.$storage.financialAssistance.mutations.setNewItemItem(value);
      },
    },

    filteredCategories(): IOptionItem[] {
      const filtered = this.financialAssistanceCategories.filter((c) => {
        if (this.item?.mainCategory?.id === c.id) {
          return true;
        }

        const isSelected = this.items.some((i) => i.mainCategory.id === c.id);
        return !isSelected && c.status === Status.Active;
      });

      return filtered;
    },
  },
});
</script>
