<template>
  <div>
    <v-btn
      icon
      :disabled="isOperating"
      :data-test="`financialAssistanceItems__editSubItemBtn--${parentIndex}--${index}`"
      @click="onEditSubItem">
      <v-icon small>
        mdi-pencil
      </v-icon>
    </v-btn>

    <v-btn
      icon
      :disabled="isOperating"
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
import { IFinancialAssistanceTableItem } from '@/entities/financial-assistance';
import Vue from 'vue';
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
     * Get the list of items from Vuex
     */
    items(): IFinancialAssistanceTableItem[] {
      return this.$storage.financialAssistance.getters.items();
    },

    /**
     * Whether the Add item or Add sub-item form is active
     */
    addingItem(): boolean | number {
      return this.$storage.financialAssistance.getters.addingItem();
    },

    isOperating(): boolean {
      return this.$storage.financialAssistance.getters.isOperating();
    },

    /**
     * Loading state
     */
    loading: {
      get(): boolean {
        return this.$storage.financialAssistance.getters.loading();
      },

      set(value: boolean) {
        this.$storage.financialAssistance.mutations.setLoading(value);
      },
    },

    canDelete(): boolean {
      if (!this.isEdit) return true;

      const validItems = this.items.filter((i) => i.subItems?.length > 0);

      return validItems.length > 1 || this.parent.subItems?.length > 1;
    },
  },

  methods: {
    /**
     * When the user clicks the edit button in a sub-item row
     */
    onEditSubItem() {
      this.$storage.financialAssistance.mutations.setNewSubItemSubItem(this.item.subCategory);
      this.$storage.financialAssistance.mutations.setNewSubItemMaximum(this.item.maximumAmount);
      this.$storage.financialAssistance.mutations.setNewSubItemAmountType(this.item.amountType);
      this.$storage.financialAssistance.mutations.setNewSubItemDocumentationRequired(this.item.documentationRequired);
      this.$storage.financialAssistance.mutations.setNewSubItemFrequency(this.item.frequency);

      this.$storage.financialAssistance.mutations.setEditedItem(this.item);
      this.$storage.financialAssistance.mutations.setEditedItemIndex(this.parentIndex);
      this.$storage.financialAssistance.mutations.setEditedSubItemIndex(this.index);
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
     * When the user confirms the delete sub-item dialog, delete the sub-item from the Vuex store
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

      const res = await this.$storage.financialAssistance.actions.deleteSubItem(this.itemBeingDeletedIndex, this.subItemBeingDeletedIndex);

      this.loading = false;

      if (res) {
        await this.$storage.financialAssistance.actions.reloadItems();
        this.$toasted.global.success(this.$t('financialAssistance.toast.table.editTable'));
      }
    },

    deleteLocally() {
      if (this.parent.subItems.length === 1) {
        this.$storage.financialAssistance.mutations.deleteItem(this.itemBeingDeletedIndex);
      } else {
        this.$storage.financialAssistance.mutations.deleteSubItem(this.subItemBeingDeletedIndex, this.itemBeingDeletedIndex);
      }
    },
  },
});
</script>
