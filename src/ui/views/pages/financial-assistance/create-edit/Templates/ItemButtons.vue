<template>
  <div>
    <v-btn
      v-if="!item.subRows.length"
      icon
      :disabled="isOperating"
      :data-test="`financialAssistanceItems__editItemBtn--${index}`"
      @click="onEditItem">
      <v-icon small>
        mdi-pencil
      </v-icon>
    </v-btn>

    <v-btn
      v-if="!isEdit || items.length > 1"
      icon
      :disabled="isOperating"
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
import { IFinancialAssistanceTableRow } from '@/entities/financial-assistance';
import Vue from 'vue';
import ConfirmBeforeAction from '../ConfirmBeforeAction.vue';

export default Vue.extend({
  name: 'ItemButtons',

  components: {
    ConfirmBeforeAction,
  },

  props: {
    item: {
      type: Object as () => IFinancialAssistanceTableRow,
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
     * Get the list of items from Vuex
     */
    items(): IFinancialAssistanceTableRow[] {
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
  },

  methods: {
    /**
     * When the user clicks on the edit button for an item
     */
    onEditItem() {
      this.$storage.financialAssistance.mutations.setNewItemItem(this.item.mainCategory);
      this.$storage.financialAssistance.mutations.setEditedItem(this.item);
      this.$storage.financialAssistance.mutations.setEditedItemIndex(this.index);
    },

    /**
     * When the user clicks the delete button for an item, show the dialog and track the index of the item
     */
    onDeleteItem() {
      this.itemBeingDeletedName = this.$m(this.item.mainCategory.name);
      this.itemBeingDeletedIndex = this.index;
      this.showDeleteItemDialog = true;
    },

    /**
     * When the user confirms the dialog, commit the deleteItem mutation to remove the tracked item
     */
    async onConfirmDeleteItem() {
      const item = this.items[this.itemBeingDeletedIndex];

      if (this.isEdit && item.subRows && item.subRows.length) {
        // todo
      } else {
        this.$storage.financialAssistance.mutations.deleteItem(this.itemBeingDeletedIndex);
      }

      this.itemBeingDeletedName = '';
      this.itemBeingDeletedIndex = -1;
      this.showDeleteItemDialog = false;
    },
  },
});
</script>
