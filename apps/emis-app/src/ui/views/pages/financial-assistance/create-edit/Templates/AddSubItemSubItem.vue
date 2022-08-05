<template>
  <div class="flex-row">
    <v-select-with-validation
      v-if="!item || !item.id"
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
    <div v-else-if="value">
      {{ $m(value.name) }}
    </div>
    <tooltip-financial-assistance-category
      v-if="value && value.description && $m(value.description)"
      class-name="ml-1"
      :label="$m(value.description)" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { VSelectWithValidation } from '@libs/component-lib/components';
import { IOptionSubItem } from '@libs/entities-lib/optionItem';
import { IFinancialAssistanceTableItem, IFinancialAssistanceTableSubItem } from '@libs/entities-lib/financial-assistance';
import { Status } from '@libs/entities-lib/base';
import TooltipFinancialAssistanceCategory from '../TooltipFinancialAssistanceCategory.vue';

export default Vue.extend({
  name: 'AddSubItemSubItem',

  components: {
    VSelectWithValidation,
    TooltipFinancialAssistanceCategory,
  },

  props: {
    item: {
      type: Object as () => IFinancialAssistanceTableSubItem,
      default: null,
    },

    parent: {
      type: Object as () => IFinancialAssistanceTableItem,
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
            tenantId: '',
            created: '',
            timestamp: '',
            createdBy: '',
            lastUpdatedBy: '',
            lastAction: '',
            lastActionCorrelationId: '',
            name: {
              translation: {
                en: 'Default',
                fr: 'Défaut',
              },
            },
            orderRank: 0,
            status: Status.Active,
            isOther: false,
            isDefault: true,
            id: '-1',
          },
        ];
      }

      const existingSubItems = this.parent.subItems;

      const unSelected = subitemsFromBE.filter(
        (si) => !existingSubItems.some((sI) => sI.subCategory.id === si.id) && si.status === Status.Active,
      );

      if (this.item) {
        return [this.item.subCategory, ...unSelected];
      }

      return unSelected;
    },
  },
});
</script>
