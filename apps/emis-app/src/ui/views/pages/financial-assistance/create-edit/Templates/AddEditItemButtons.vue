<template>
  <div class="flex-row justify-end">
    <v-btn
      small
      color="primary"
      :disabled="failed || (mode === 'edit' && pristine)"
      :data-test="saveButtonDataTest"
      @click="onSave">
      {{ mode === 'add' ? $t('common.buttons.add') : $t('common.buttons.save') }}
    </v-btn>

    <v-btn
      icon
      :data-test="cancelButtonDataTest"
      @click="onCancel">
      <v-icon>
        mdi-close
      </v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { VForm } from '@libs/shared-lib/types';
import { IFinancialAssistanceTableItem } from '@libs/entities-lib/financial-assistance';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';

export default Vue.extend({
  name: 'AddEditItemButtons',

  props: {
    mode: {
      type: String,
      required: true,
      validator: (value: string) => ['add', 'edit'].indexOf(value) !== -1,
    },

    failed: {
      type: Boolean,
      required: true,
    },

    pristine: {
      type: Boolean,
      default: true,
    },
  },

  computed: {
    saveButtonDataTest(): string {
      return this.mode === 'add' ? 'financialAssistanceItems__confirmAddItemBtn' : 'financialAssistanceItems__confirmEditItemBtn';
    },

    cancelButtonDataTest(): string {
      return this.mode === 'add' ? 'financialAssistanceItems__cancelAddItemBtn' : 'financialAssistanceItems__cancelEditItemBtn';
    },
  },

  methods: {
    onSave() {
      if (this.mode === 'add') {
        this.onAddItem();
      } else {
        this.onSaveEditItem();
      }
    },
    /**
     * Event handler for adding a new item
     */
    async onAddItem() {
      const isValid = await (this.$parent.$parent.$parent.$refs.form as VForm).validate();

      if (isValid) {
        const newItem = useFinancialAssistanceStore().newItem;

        useFinancialAssistanceStore().addItem({ item: newItem });

        useFinancialAssistanceStore().addingItem = false;

        useFinancialAssistanceStore().resetNewItem();
      }
    },

    /**
     * When the user clicks the save button after editing an item
     */
    onSaveEditItem() {
      const newItem: IFinancialAssistanceTableItem = useFinancialAssistanceStore().newItem;
      const editedItemIndex = useFinancialAssistanceStore().editedItemIndex;

      useFinancialAssistanceStore().setItemItem({ item: newItem.mainCategory, index: editedItemIndex });

      useFinancialAssistanceStore().cancelOperation();

      useFinancialAssistanceStore().resetNewItem();
    },

    /**
     * Event handler for when the user cancels adding a new item
     */
    onCancel() {
      useFinancialAssistanceStore().cancelOperation();

      useFinancialAssistanceStore().resetNewItem();
    },
  },
});
</script>
