<template>
  <div>
    <div class="caseNote_rowTitle py-4">
      <v-icon color="secondary">
        mdi-message-text
      </v-icon>
      <span class="rc-title-3 fw-medium ml-4">
        {{ actionTitle }}
      </span>
    </div>

    <validation-observer ref="form" v-slot="{ invalid }" slim>
      <v-form class="full-width">
        <v-row dense>
          <v-col cols="12">
            <v-text-field-with-validation
              v-model="localCaseNote.subject"
              :label="$t('caseNote.subject')"
              :rules="rules.subject"
              data-test="case-note-form-subject" />
          </v-col>
          <v-col cols="12">
            <v-select-with-validation
              :value="currentCategory"
              :item-text="(c) => $m(c.name)"
              return-object
              :items="caseNoteCategories"
              :label="$t('caseNote.category')"
              :rules="rules.category"
              data-test="case-note-form-categories"
              @change="setCategory($event)" />
          </v-col>
          <v-col cols="12">
            <v-text-area-with-validation
              v-model="localCaseNote.description"
              :label="$t('caseNote.description')"
              :rules="rules.description"
              data-test="case-note-form-description" />
          </v-col>
        </v-row>
      </v-form>

      <div class="button-row">
        <v-btn class="mr-3" data-test="case-note-form-cancel" :disabled="isSaving" @click="closeCaseNoteForm()">
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn class="ml-3" color="primary" data-test="case-note-form-save" :loading="isSaving" :disabled="invalid" @click="save">
          {{ isEdit ? $t('common.save') : $t('common.add') }}
        </v-btn>
      </div>
    </validation-observer>

    <rc-confirmation-dialog
      v-if="showConfirmationDialog"
      data-test="case-note-confirmation-dialog"
      :show.sync="showConfirmationDialog"
      :title="$t('common.buttons.confirm')"
      :messages="[$t('caseNote.createDialog.message1'), $t('caseNote.createDialog.message2')]"
      @submit="addCaseNote()"
      @cancel="closeConfirmationDialog()"
      @close="closeConfirmationDialog()" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  VTextFieldWithValidation, VSelectWithValidation, VTextAreaWithValidation, RcConfirmationDialog,
} from '@crctech/component-library';
import _cloneDeep from 'lodash/cloneDeep';
import { IOptionItem } from '@/entities/optionItem';
import { MAX_LENGTH_SM, MAX_LENGTH_XL } from '@/constants/validations';
import { ICaseFileCombined } from '@/entities/case-file';
import { CaseNoteEntity, ICaseNoteEntity } from '@/entities/case-note';

export default Vue.extend({
  name: 'CaseNoteForm',
  components: {
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    VSelectWithValidation,
    RcConfirmationDialog,
  },
  props: {
    caseNote: {
      type: Object as () => ICaseNoteEntity,
      default: null,
    },
    actionTitle: {
      type: String,
      default: '',
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      localCaseNote: null as ICaseNoteEntity,
      showConfirmationDialog: false,
      currentCategory: null as IOptionItem,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        subject: {
          required: true,
          max: MAX_LENGTH_SM,
        },
        category: {
          required: true,
        },
        description: {
          required: true,
          max: MAX_LENGTH_XL,
        },
      };
    },

    isSaving(): boolean {
      return this.$store.state.caseNoteEntities.isSavingCaseNote;
    },

    caseNoteCategories(): IOptionItem[] {
      return this.$storage.caseNote.getters.caseNoteCategories();
    },

    caseFile(): ICaseFileCombined {
      return this.$storage.caseFile.getters.get(this.$route.params.id);
    },
  },

  created() {
    if (this.caseNote !== null) {
      this.localCaseNote = _cloneDeep(this.caseNote);
      this.setInitialCategory();
    } else {
      this.localCaseNote = new CaseNoteEntity();
    }
  },

  methods: {
    setInitialCategory() {
      const currentCategoryId = this.localCaseNote.category.optionItemId;
      if (currentCategoryId) {
        this.currentCategory = this.caseNoteCategories.find((c) => c.id === currentCategoryId);
      }
    },

    setCategory(value: IOptionItem) {
      this.localCaseNote.category = {
        optionItemId: value.id, specifiedOther: null,
      };
    },

    async save() {
      if (this.$hasLevel('level4')) {
        await this.addOrEdit();
      } else {
        this.showConfirmationDialog = true;
      }
    },

    async addOrEdit() {
      this.isEdit ? await this.editCaseNote() : await this.addCaseNote();
    },

    async addCaseNote() {
      this.closeConfirmationDialog();

      const result = await this.$storage.caseNote.actions.addCaseNote(this.caseFile.entity.id, this.localCaseNote);
      if (result) {
        this.$emit('add-case-note-id', result.id);
        this.closeCaseNoteForm();
      }
    },

    async editCaseNote() {
      const result = await this.$storage.caseNote.actions.editCaseNote(this.caseFile.entity.id, this.caseNote.id, this.localCaseNote);
      if (result) {
        this.closeCaseNoteForm();
      }
    },

    closeConfirmationDialog() {
      this.showConfirmationDialog = false;
    },

    closeCaseNoteForm() {
      this.$emit('close-case-note-form');
    },
  },
});
</script>
<style scoped lang="scss">
.button-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  button {
    margin-left: 16px;
  }
}

.caseNote_rowTitle {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
