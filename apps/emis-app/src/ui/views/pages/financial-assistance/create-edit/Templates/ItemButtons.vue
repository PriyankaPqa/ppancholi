<template>
  <div>
    <v-btn
      v-if="!item.subItems.length"
      icon
      :disabled="isOperating"
      :aria-label="$t('common.edit')"
      :data-test="`financialAssistanceItems__editItemBtn--${index}`"
      @click="onEditItem">
      <v-icon small>
        mdi-pencil
      </v-icon>
    </v-btn>

    <v-btn
      icon
      :disabled="isOperating"
      :aria-label="$t('common.delete')"
      :data-test="`financialAssistanceItems__deleteItemBtn--${index}`"
      @click="onDeleteItem">
      <v-icon small>
        mdi-delete
      </v-icon>
    </v-btn>

    <confirm-before-action
      v-if="showDeleteItemDialog"
      data-test="financialAssistanceItems__deleteItemDialog"
      :show.sync="showDeleteItemDialog"
      :title="$t('common.deletion.title')"
      :messages="$t('financialAssistance.deleteItem.message', { item: itemBeingDeletedName })"
      :loading="loading"
      @submit="onConfirmDeleteItem" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IFinancialAssistanceTableItem } from '@libs/entities-lib/financial-assistance';
import { useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';

import ConfirmBeforeAction from '../ConfirmBeforeAction.vue';

export default Vue.extend({
  name: 'ItemButtons',

  components: {
    ConfirmBeforeAction,
  },

  props: {
    item: {
      type: Object as () => IFinancialAssistanceTableItem,
      required: true,
    },

    index: {
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
      showDeleteItemDialog: false,
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

      return validItems.length > 1 || !this.item.subItems?.length;
    },
  },

  methods: {
    /**
     * When the user clicks on the edit button for an item
     */
    onEditItem() {
      useFinancialAssistanceStore().$patch((state) => {
        state.newItem = { ...state.newItem, mainCategory: this.item.mainCategory };
        state.editedItem = this.item;
        state.editedItemIndex = this.index;
      });
    },

    /**
     * When the user clicks the delete button for an item, show the dialog and track the index of the item
     */
    onDeleteItem() {
      if (!this.canDelete) {
        this.$toasted.global.error(this.$t('financialAssistance.errors.needItemSubItem'));
        return;
      }

      this.itemBeingDeletedName = this.$m(this.item.mainCategory.name);
      this.itemBeingDeletedIndex = this.index;
      this.showDeleteItemDialog = true;
    },

    /**
     * When the user confirms the dialog, commit the deleteItem mutation to remove the tracked item
     */
    async onConfirmDeleteItem() {
      const item = this.items[this.itemBeingDeletedIndex];

      if (this.isEdit && item.subItems && item.subItems.length) {
        await this.deleteRemotely();
      } else {
        this.deleteLocally();
      }

      this.itemBeingDeletedName = '';
      this.itemBeingDeletedIndex = -1;
      this.showDeleteItemDialog = false;
    },

    async deleteRemotely() {
      this.loading = true;
      const res = await useFinancialAssistanceStore().deleteItem({ itemIndex: this.itemBeingDeletedIndex });
      this.loading = false;

      if (res) {
        const categories = useFinancialAssistancePaymentStore().getFinancialAssistanceCategories(false);
        await useFinancialAssistanceStore().reloadItems({ categories });
        this.$toasted.global.success(this.$t('financialAssistance.toast.table.editTable'));
      }
    },

    deleteLocally() {
      useFinancialAssistanceStore().removeItem({ index: this.itemBeingDeletedIndex });
    },
  },
});
</script>
