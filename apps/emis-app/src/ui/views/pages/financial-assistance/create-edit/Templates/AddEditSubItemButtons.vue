<template>
  <div>
    <v-btn
      small
      color="primary"
      :disabled="failed || (mode === 'edit' && pristine)"
      :loading="loading"
      :data-test="saveButtonDataTest"
      @click="onClickSave">
      {{ saveButtonLabel }}
    </v-btn>

    <v-btn icon :data-test="cancelButtonDataTest" :aria-label="$t('common.buttons.close')" :disabled="loading" @click="onCancel">
      <v-icon>
        mdi-close
      </v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { cloneDeep } from 'lodash';
import { VForm } from '@libs/shared-lib/types';
import { IFinancialAssistanceTableSubItem } from '@libs/entities-lib/financial-assistance';
import { useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';
import { IOptionItem } from '@libs/entities-lib/optionItem';

export default Vue.extend({
  name: 'AddEditSubItemButtons',

  props: {
    mode: {
      type: String,
      required: true,
      validator: (value: string) => ['add', 'edit'].indexOf(value) !== -1,
    },

    index: {
      type: Number,
      default: -1,
    },

    failed: {
      type: Boolean,
      required: true,
    },

    pristine: {
      type: Boolean,
      default: true,
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

  computed: {
    loading: {
      get(): boolean {
        return useFinancialAssistanceStore().loading;
      },

      set(value: boolean) {
        useFinancialAssistanceStore().loading = value;
      },
    },

    saveButtonLabel(): TranslateResult {
      if (this.mode === 'edit') {
        return this.isEdit ? this.$t('common.apply') : this.$t('common.save');
      }

      return this.$t('common.add');
    },

    saveButtonDataTest(): string {
      return this.mode === 'add' ? 'financialAssistanceItems__confirmAddSubItemBtn' : 'financialAssistanceItems__confirmEditSubItemBtn';
    },

    cancelButtonDataTest(): string {
      return this.mode === 'add' ? 'financialAssistanceItems__cancelAddSubItemBtn' : 'financialAssistanceItems__cancelEditSubItemBtn';
    },

    categories(): IOptionItem[] {
      return useFinancialAssistancePaymentStore().getFinancialAssistanceCategories(false);
    },
  },

  methods: {
    async onClickSave() {
      if (this.mode === 'add') {
        await this.addSubItem();
      } else {
        await this.saveSubItem();
      }
    },

    /**
     * Handles adding a new sub-item
     */
    async addSubItem() {
      const isValid = await (this.$parent.$parent.$parent.$parent.$refs.form as VForm).validate();

      if (isValid) {
        const newSubItem = useFinancialAssistanceStore().newSubItem;

        if (this.isEdit) {
          await this.addRemotely(newSubItem);
        } else {
          this.addLocally(newSubItem);
        }
      }
    },

    /**
     * When the user clicks save, validate the form and commit the setSubItem mutation to update the sub-item
     */
    async saveSubItem() {
      const isValid = await (this.$parent.$parent.$parent.$parent.$parent.$refs.form as VForm).validate();

      if (isValid) {
        const newSubItem = useFinancialAssistanceStore().newSubItem;
        const editedSubItemIndex = useFinancialAssistanceStore().editedSubItemIndex;
        const editedItemIndex = useFinancialAssistanceStore().editedItemIndex;

        if (this.isEdit) {
          await this.saveRemotely(newSubItem, editedSubItemIndex, editedItemIndex);
        } else {
          this.saveLocally(newSubItem, editedSubItemIndex, editedItemIndex);
        }
      }
    },

    async addRemotely(newSubItem: IFinancialAssistanceTableSubItem) {
      this.loading = true;

      const parentItem = useFinancialAssistanceStore().mainItems[this.index];

      let res;

      try {
        if (parentItem.subItems?.length > 0) {
          res = await useFinancialAssistanceStore().createSubItem({ itemIndex: this.index, subItem: newSubItem });
        } else {
          const item = cloneDeep(parentItem);
          item.subItems = [newSubItem];
          res = await useFinancialAssistanceStore().createItem({ item });
        }

        if (res) {
          await useFinancialAssistanceStore().reloadItems({ categories: this.categories });
          this.$toasted.global.success(this.$t('financialAssistance.toast.table.editTable'));
          this.onCancel();
        }
      } finally {
        this.loading = false;
      }
    },

    addLocally(newSubItem: IFinancialAssistanceTableSubItem) {
      useFinancialAssistanceStore().addSubItem({ subItem: newSubItem, index: this.index });

      this.onCancel();
    },

    async saveRemotely(newSubItem: IFinancialAssistanceTableSubItem, editedSubItemIndex: number, editedItemIndex: number) {
      this.loading = true;

      const res = await useFinancialAssistanceStore().editSubItem({ itemIndex: editedItemIndex, subItemIndex: editedSubItemIndex, subItem: newSubItem });

      if (res) {
        await useFinancialAssistanceStore().reloadItems({ categories: this.categories });
        this.$toasted.global.success(this.$t('financialAssistance.toast.table.editTable'));
        this.onCancel();
      }

      this.loading = false;
    },

    saveLocally(newSubItem: IFinancialAssistanceTableSubItem, editedSubItemIndex: number, editedItemIndex: number) {
      useFinancialAssistanceStore().setSubItem({ subItem: newSubItem, index: editedSubItemIndex, parentIndex: editedItemIndex });

      this.onCancel();
    },

    /**
     * Handles cancelling the add sub-item row
     */
    onCancel() {
      useFinancialAssistanceStore().cancelOperation();
      useFinancialAssistanceStore().resetNewSubItem();
    },
  },
});
</script>
