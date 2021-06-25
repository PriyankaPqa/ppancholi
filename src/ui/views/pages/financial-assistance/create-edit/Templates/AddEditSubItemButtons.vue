<template>
  <div>
    <v-btn
      small
      color="primary"
      :disabled="failed"
      :loading="loading"
      :data-test="saveButtonDataTest"
      @click="onClickSave">
      {{ saveButtonLabel }}
    </v-btn>

    <v-btn
      icon
      :data-test="cancelButtonDataTest"
      :disabled="loading"
      @click="onCancel">
      <v-icon>
        mdi-close
      </v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { VForm } from '@/types';

export default Vue.extend({
  name: 'AddEditSubItemButtons',

  props: {
    mode: {
      type: String,
      required: true,
      validator: (value) => ['add', 'edit'].indexOf(value) !== -1,
    },

    index: {
      type: Number,
      default: -1,
    },

    failed: {
      type: Boolean,
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

  computed: {
    loading: {
      get(): boolean {
        return this.$storage.financialAssistance.getters.loading();
      },

      set(value: boolean) {
        this.$storage.financialAssistance.mutations.setLoading(value);
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
  },

  methods: {
    onClickSave() {
      if (this.mode === 'add') {
        this.onAddSubItem();
      } else {
        this.onSaveEditSubItem();
      }
    },

    /**
     * Handles adding a new sub-item
     */
    async onAddSubItem() {
      const isValid = await (this.$parent.$parent.$parent.$parent.$refs.form as VForm).validate();

      if (isValid) {
        const newSubItem = this.$storage.financialAssistance.getters.newSubItem();

        if (this.isEdit) {
          // todo
        } else {
          this.$storage.financialAssistance.mutations.addSubItem(newSubItem, this.index);
        }

        this.onCancel();
      }
    },

    /**
     * When the user clicks save, validate the form and commit the setSubItem mutation to update the sub-item
     */
    async onSaveEditSubItem() {
      const isValid = await (this.$parent.$parent.$parent.$parent.$parent.$refs.form as VForm).validate();

      if (isValid) {
        const newSubItem = this.$storage.financialAssistance.getters.newSubItem();
        const editedSubItemIndex = this.$storage.financialAssistance.getters.editedSubItemIndex();
        const editedItemIndex = this.$storage.financialAssistance.getters.editedItemIndex();

        if (this.isEdit) {
          // todo
        } else {
          this.$storage.financialAssistance.mutations.setSubItem(newSubItem, editedSubItemIndex, editedItemIndex);
        }

        this.onCancel();
      }
    },

    /**
     * Handles cancelling the add sub-item row
     */
    onCancel() {
      this.$storage.financialAssistance.mutations.cancelOperation();

      this.$storage.financialAssistance.mutations.resetNewSubItem();
    },
  },
});
</script>
