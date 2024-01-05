<template>
  <div>
    <v-btn
      icon
      :disabled="isOperating"
      :aria-label="$t('common.edit')"
      :data-test="`financialAssistanceItems__editSubItemBtn--${parentIndex}--${index}`"
      @click="onEditSubItem">
      <v-icon small>
        mdi-pencil
      </v-icon>
    </v-btn>

    <v-btn
      icon
      :disabled="isOperating"
      :aria-label="$t('common.delete')"
      :data-test="`financialAssistanceItems__deleteSubItemBtn--${parentIndex}--${index}`"
      @click="onDeleteSubItem">
      <v-icon small>
        mdi-delete
      </v-icon>
    </v-btn>

    <confirm-before-action
      v-if="showDeleteSubItemDialog"
      data-test="financialAssistanceItems__deleteSubItemDialog"
      :show.sync="showDeleteSubItemDialog"
      :title="$t('common.deletion.title')"
      :messages="$t('financialAssistance.deleteItem.message', { item: itemBeingDeletedName })"
      :loading="loading"
      @submit="onConfirmDeleteSubItem" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IFinancialAssistanceTableItem } from '@libs/entities-lib/financial-assistance';
import { useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';
import ConfirmBeforeAction from '../ConfirmBeforeAction.vue';

export default Vue.extend({
  name: 'SubItemButtons',

  components: {
    ConfirmBeforeAction,
  },

  props: {
    item: {
      type: Object,
      required: true,
    },

    index: {
      type: Number,
      required: true,
    },

    parent: {
      type: Object as () => IFinancialAssistanceTableItem,
      required: true,
    },

    parentIndex: {
      type: Number,
      required: true,
    },

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
      itemBeingDeletedName: '',
      itemBeingDeletedIndex: -1,
      subItemBeingDeletedIndex: -1,
      showDeleteSubItemDialog: false,
    };
  },

  computed: {
    /**
     * Get the list of items from the store
     */
    items(): IFinancialAssistanceTableItem[] {
      return useFinancialAssistanceStore().mainItems;
    },

    /**
     * Whether the Add item or Add sub-item form is active
     */
    addingItem(): boolean | number {
      return useFinancialAssistanceStore().addingItem;
    },

    isOperating(): boolean {
      return useFinancialAssistanceStore().isOperating();
    },

    /**
     * Loading state
     */
    loading: {
      get(): boolean {
        return useFinancialAssistanceStore().loading;
      },

      set(value: boolean) {
        useFinancialAssistanceStore().loading = value;
      },
    },

    canDelete(): boolean {
      if (!this.isEdit) {
        return true;
      }

      const validItems = this.items.filter((i) => i.subItems?.length > 0);

      return validItems.length > 1 || this.parent.subItems?.length > 1;
    },
  },

  methods: {
    /**
     * When the user clicks the edit button in a sub-item row
     */
    onEditSubItem() {
      useFinancialAssistanceStore().$patch((state) => {
        state.newSubItem = {
          ...state.newSubItem,
          subCategory: this.item.subCategory,
          maximumAmount: this.item.maximumAmount,
          amountType: this.item.amountType,
          documentationRequired: this.item.documentationRequired,
          frequency: this.item.frequency,
        };
        state.editedItem = this.item;
        state.editedItemIndex = this.parentIndex;
        state.editedSubItemIndex = this.index;
      });
    },

    /**
     * When the user clicks the delete button for a sub-item, show the dialog and track the indices of the item/sub-item
     */
    onDeleteSubItem() {
      if (!this.canDelete) {
        this.$toasted.global.error(this.$t('financialAssistance.errors.needItemSubItem'));
        return;
      }

      this.itemBeingDeletedName = this.$m(this.item.subCategory.name);
      this.itemBeingDeletedIndex = this.parentIndex;
      this.subItemBeingDeletedIndex = this.index;
      this.showDeleteSubItemDialog = true;
    },

    /**
     * When the user confirms the delete sub-item dialog, delete the sub-item from the store
     */
    async onConfirmDeleteSubItem() {
      if (this.isEdit) {
        await this.deleteRemotely();
      } else {
        this.deleteLocally();
      }

      this.itemBeingDeletedName = '';
      this.itemBeingDeletedIndex = -1;
      this.subItemBeingDeletedIndex = -1;
      this.showDeleteSubItemDialog = false;
    },

    async deleteRemotely() {
      this.loading = true;

      const res = await useFinancialAssistanceStore().deleteSubItem({ itemIndex: this.itemBeingDeletedIndex, subItemIndex: this.subItemBeingDeletedIndex });

      this.loading = false;

      if (res) {
        const categories = useFinancialAssistancePaymentStore().getFinancialAssistanceCategories(false);
        await useFinancialAssistanceStore().reloadItems({ categories });
        this.$toasted.global.success(this.$t('financialAssistance.toast.table.editTable'));
      }
    },

    deleteLocally() {
      if (this.parent.subItems.length === 1) {
        useFinancialAssistanceStore().removeItem({ index: this.itemBeingDeletedIndex });
      } else {
        useFinancialAssistanceStore().removeSubItem({ index: this.subItemBeingDeletedIndex, parentIndex: this.itemBeingDeletedIndex });
      }
    },
  },
});
</script>
