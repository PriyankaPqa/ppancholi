<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <div class="manageLists">
      <v-btn width="200" data-test="manage-list" color="primary">
        {{ $t('financialAssistance.manageList') }}
      </v-btn>
    </div>

    <rc-nested-table
      :headers="headers"
      :items="items"
      :labels="labels"
      item-sub-item="subRows"
      show-add-item
      show-add-sub-item
      sortable
      collapsible
      :disable-add-item="isOperating"
      :disable-add-sub-item="disableAddSubItem"
      :add-item.sync="addingItem"
      :edited-item="editedItem"
      data-test="financialAssistanceItems">
      <!-- ITEM -->
      <template #[`item.mainCategory`]="{ item }">
        <span class="rc-body14 fw-bold">
          {{ $m(item.mainCategory.name) }}
        </span>

        <tooltip-financial-assistance-category
          v-if="item.mainCategory.description && $m(item.mainCategory.description)"
          :label="$m(item.mainCategory.description)" />
      </template>

      <template #[`item.buttons`]="{ item, index }">
        <item-buttons :item="item" :index="index" :is-edit="isEdit" :is-table-mode="isTableMode" @fetch-template="fetchTemplate($event)" />
      </template>

      <!-- ADD ITEM -->
      <template #[`add-item.mainCategory`]="{item, index}">
        <add-item-item :item="item" :items="items" :index="index" :financial-assistance-categories="faCategories" />
      </template>

      <template #[`add-item.buttons`]>
        <add-edit-item-buttons mode="add" :failed="failed" />
      </template>

      <!-- EDIT ITEM -->
      <template #[`edit-item.buttons`]>
        <add-edit-item-buttons mode="edit" :failed="failed" />
      </template>

      <!-- SUB ITEM -->
      <template #[`sub-item.subCategory`]="{ item }">
        <span class="rc-body14">
          {{ item.subCategory ? $m(item.subCategory.name) : $t('common.default') }}
        </span>

        <tooltip-financial-assistance-category
          v-if="item.subCategory.description && $m(item.subCategory.description)"
          :label="$m(item.subCategory.description)" />
      </template>

      <template #[`sub-item.maximumAmount`]="{ item }">
        <span class="rc-body14">
          {{ $formatCurrency(item.maximumAmount, true) }}
        </span>
      </template>

      <template #[`sub-item.amountType`]="{ item }">
        <span class="rc-body14">
          {{ $t(`enums.financialAmountModes.${item.amountType}`) }}
        </span>
      </template>

      <template #[`sub-item.documentationRequired`]="{ item }">
        <span class="rc-body14">
          {{ item.documentationRequired ? $t('common.yes') : $t('common.no') }}
        </span>
      </template>

      <template #[`sub-item.frequency`]="{ item }">
        <span class="rc-body14">
          {{ $t(`enums.financialFrequency.${item.frequency}`) }}
        </span>
      </template>

      <template #[`sub-item.buttons`]="{ item, index, parent, parentIndex }">
        <sub-item-buttons
          :item="item"
          :index="index"
          :parent="parent"
          :parent-index="parentIndex"
          :is-edit="isEdit"
          :is-table-mode="isTableMode"
          @fetch-template="fetchTemplate($event)" />
      </template>

      <!-- ADD SUB ITEM -->
      <template #[`add-sub-item.subCategory`]="{ parent, item }">
        <add-sub-item-sub-item ref="TemplateAddSubItemSubItem" :item="item" :parent="parent" :financial-assistance-categories="faCategories" />
      </template>

      <template #add-sub-item.maximumAmount>
        <add-sub-item-maximum />
      </template>

      <template #add-sub-item.amountType>
        <add-sub-item-amount-type />
      </template>

      <template #add-sub-item.documentationRequired>
        <add-sub-item-documentation />
      </template>

      <template #add-sub-item.frequency>
        <add-sub-item-frequency />
      </template>

      <template #[`add-sub-item.buttons`]="{ index }">
        <add-edit-sub-item-buttons
          mode="add"
          :index="index"
          :failed="failed"
          :is-edit="isEdit"
          :is-table-mode="isTableMode"
          @fetch-template="fetchTemplate($event)" />
      </template>

      <!-- EDIT SUB ITEM -->
      <template #[`edit-sub-item.buttons`]>
        <add-edit-sub-item-buttons
          mode="edit"
          :failed="failed"
          :is-edit="isEdit"
          :is-table-mode="isTableMode"
          @fetch-template="fetchTemplate($event)" />
      </template>
    </rc-nested-table>
  </validation-observer>
</template>

<script lang="ts">
import Vue from 'vue';
import { VForm } from '@/types';
import { IFinancialAssistanceTableRow } from '@/entities/financial-assistance';
import { IOptionItem } from '@/entities/optionItem';
import { RcNestedTable } from '@crctech/component-library';
import { INestedTableHeader } from './INestedTableHeader';
import TooltipFinancialAssistanceCategory from './TooltipFinancialAssistanceCategory.vue';
import ItemButtons from './Templates/ItemButtons.vue';
import AddItemItem from './Templates/AddItemItem.vue';
import AddEditItemButtons from './Templates/AddEditItemButtons.vue';
import SubItemButtons from './Templates/SubItemButtons.vue';
import AddSubItemSubItem from './Templates/AddSubItemSubItem.vue';
import AddSubItemMaximum from './Templates/AddSubItemMaximum.vue';
import AddSubItemAmountType from './Templates/AddSubItemAmountType.vue';
import AddSubItemDocumentation from './Templates/AddSubItemDocumentation.vue';
import AddSubItemFrequency from './Templates/AddSubItemFrequency.vue';
import AddEditSubItemButtons from './Templates/AddEditSubItemButtons.vue';

/**
 * A component that uses RcNestedTable to manage a list of financial assistance items/sub-items
 * Useable for Templates and Tables
 * Interfaces with the financial assistance Vuex module
 */
export default Vue.extend({
  name: 'FinancialAssistanceItems',

  components: {
    RcNestedTable,
    TooltipFinancialAssistanceCategory,
    ItemButtons,
    AddItemItem,
    AddEditItemButtons,
    SubItemButtons,
    AddSubItemSubItem,
    AddSubItemMaximum,
    AddSubItemAmountType,
    AddSubItemDocumentation,
    AddSubItemFrequency,
    AddEditSubItemButtons,
  },

  props: {
    isEdit: {
      type: Boolean,
      required: true,
    },

    isTableMode: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      faCategories: [] as IOptionItem[],

      showManageListsDialog: false,
    };
  },

  computed: {
    /**
     * Translated values for the RcNestedTable component
     */
    labels(): Record<string, unknown> {
      return {
        addItem: this.$t('financialAssistance.addItem'),
        addSubItem: this.$t('financialAssistance.addSubItem'),
      };
    },

    /**
     * Get the list of items from Vuex
     */
    items(): Array<IFinancialAssistanceTableRow> {
      return this.$storage.financialAssistance.getters.items();
    },

    /**
     * Tracks whether an item is being added. If true, an item is being added. If a non-negative integer,
     * a sub-item is being added at the parent item matching the index
     */
    addingItem: {
      get(): boolean {
        return this.$storage.financialAssistance.getters.addingItem() as boolean;
      },

      set(value: boolean) {
        this.$storage.financialAssistance.mutations.setAddingItem(value);
      },
    },

    /**
     * Get the item currently being edited from the store
     */
    editedItem(): IFinancialAssistanceTableRow {
      return this.$storage.financialAssistance.getters.editedItem();
    },

    isOperating(): boolean {
      return this.$storage.financialAssistance.getters.isOperating();
    },

    /**
     * Disable the add sub item button if another item is being edited, or the item already has the Default sub item
     */
    disableAddSubItem(): Array<boolean> | boolean {
      if (this.isOperating) return true;
      return this.items.map((item) => item.subRows && item.subRows.length && item.subRows[0].subCategory.id === '-1');
    },

    /**
     * Table header config for the RcNestedTable
     */
    headers(): Array<INestedTableHeader> {
      return [
        {
          text: this.$t('financialAssistance.nestedTable.headers.item') as string,
          value: 'mainCategory',
          cols: 2,
          align: 'left',
        },
        {
          text: this.$t('financialAssistance.nestedTable.headers.subItem') as string,
          value: 'subCategory',
          cols: 2,
          align: 'left',
        },
        {
          text: this.$t('financialAssistance.nestedTable.headers.maximum') as string,
          value: 'maximumAmount',
          cols: 1,
          align: 'left',
        },
        {
          text: this.$t('financialAssistance.nestedTable.headers.amountType') as string,
          value: 'amountType',
          cols: 2,
          align: 'left',
        },
        {
          text: this.$t('financialAssistance.nestedTable.headers.documentationRequired') as string,
          value: 'documentationRequired',
          cols: 2,
          align: 'left',
        },
        {
          text: this.$t('financialAssistance.nestedTable.headers.frequency') as string,
          value: 'frequency',
          cols: 2,
          align: 'left',
        },
        {
          text: '',
          value: 'buttons',
          cols: 1,
          align: 'right',
        },
      ];
    },
  },

  watch: {
    /**
     * Emit the form-active event to inform the parent component to enable/disable the Save button
     */
    editedItem() {
      const formActive = this.getIsFormActive();
      this.$emit('form-active', formActive);
    },

    /**
     * Emit the form-active event to inform the parent component to enable/disable the Save button
     */
    addingItem() {
      const formActive = this.getIsFormActive();
      this.$emit('form-active', formActive);
    },

    /**
     * When the user closes the manage lists dialog, we need to re-fetch the financial assistance categories
     */
    showManageListsDialog(newValue: boolean) {
      if (newValue === false) {
        this.fetchFinancialAssistanceCategories();
        (this.$refs.form as VForm).reset();
      }
    },
  },

  async mounted() {
    await this.fetchFinancialAssistanceCategories();
  },

  methods: {
    async fetchTemplate() {
      // todo
    },

    /**
     * Fetch the financial assistance categories from the API. These are used for the parent item rows
     */
    async fetchFinancialAssistanceCategories() {
      const res: IOptionItem[] = await this.$storage.financialAssistance.actions.fetchActiveCategories();
      this.faCategories = res;
    },

    /**
     * Show the manage lists dialog
     */
    showManageLists() {
      this.showManageListsDialog = true;
    },

    /**
     * Determine whether an add or edit form is currently active in the RcNestedTable component
     */
    getIsFormActive(): boolean {
      if (typeof this.addingItem === 'boolean') {
        return !!this.editedItem || this.addingItem;
      }

      return !!this.editedItem || this.addingItem > -1;
    },
  },
});
</script>

<style scoped lang="scss">
.manageLists {
  background: var(--v-grey-lighten4);
  padding: 8px 24px;
}
</style>
