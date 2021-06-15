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

    <ValidationObserver ref="form" v-slot="{ invalid }" slim>
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
              v-model="localCaseNote.category"
              :item-text="(c) => $m(c.name)"
              return-object
              :items="caseNoteCategories"
              :label="$t('caseNote.category')"
              :rules="rules.category"
              data-test="case-note-form-categories" />
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
    </ValidationObserver>

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
import { IOptionItem } from '@/entities/optionItem';
import { MAX_LENGTH_SM, MAX_LENGTH_XL } from '@/constants/validations';
import { ICaseFile } from '@/entities/case-file';
import { ICaseNote } from '@/entities/case-file/case-note';
import _cloneDeep from 'lodash/cloneDeep';

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
      type: Object as () => ICaseNote,
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
      localCaseNote: {
        subject: null,
        category: null,
        description: null,
      } as ICaseNote,
      showConfirmationDialog: false,
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
      return this.$store.state.caseFile.isSavingCaseNote;
    },

    caseNoteCategories(): IOptionItem[] {
      return this.$storage.caseFile.getters.caseNoteCategories();
    },

    caseFile(): ICaseFile {
      return this.$storage.caseFile.getters.caseFileById(this.$route.params.id);
    },
  },

  created() {
    if (this.caseNote !== null) {
      this.localCaseNote = _cloneDeep(this.caseNote);
    }
  },

  methods: {
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

      const result = await this.$storage.caseFile.actions.addCaseNote(this.caseFile.id, this.localCaseNote);
      if (result) {
        this.closeCaseNoteForm();
      }
    },

    async editCaseNote() {
      const result = await this.$storage.caseFile.actions.editCaseNote(this.caseFile.id, this.localCaseNote.id, this.localCaseNote);
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
