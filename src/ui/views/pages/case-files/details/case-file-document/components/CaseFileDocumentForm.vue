<template>
  <v-container>
    <validation-observer ref="form">
      <v-row justify="center">
        <v-col cols="12" xl="8" lg="9" md="11">
          <v-row class="mt-4">
            <v-col sm="12" md="9">
              <v-text-field-with-validation
                v-model="localDocument.name"
                :rules="rules.name"
                :label="$t('caseFile.document.name') + ' *'"
                data-test="document-name" />
            </v-col>

            <v-col sm="12" md="3">
              <div :class="['status', isStatusActive ? 'status_success' : 'grey']">
                <div class="pl-4 white--text">
                  {{ $t('caseFile.document.status') }}
                  <span class="rc-body14 fw-bold white--text text-uppercase" :data-test="`document-status`">
                    {{ $t(`caseFile.document.status.${DocumentStatus[localDocument.documentStatus]}`) }}
                  </span>
                </div>

                <validation-provider>
                  <v-switch
                    v-model="isStatusActive"
                    data-test="document-switch-status"
                    class="pt-0 mt-0"
                    hide-details
                    color="white"
                    flat />
                </validation-provider>
              </div>
            </v-col>
          </v-row>
          <v-row v-if="!isEditMode">
            <v-col cols="12">
              <validation-provider v-slot="{ errors }" ref="file" :rules="rules.file" mode="aggressive">
                <rc-file-upload :allowed-extensions="allowedExtensions" :file="file" :errors="errors" @update:file="onUpdateFile($event)" />
              </validation-provider>
            </v-col>
          </v-row>
          <v-row v-if="isEditMode">
            <v-col cols="12">
              <download-view-document :document="localDocument" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-select-with-validation
                v-model="localDocument.category.optionItemId"
                :items="documentCategories"
                :item-text="(item) => $m(item.name)"
                :item-value="(item) => item.id"
                :rules="rules.documentCategories"
                :label="$t('caseFile.document.category') + ' *'"
                data-test="document-category" />
            </v-col>
          </v-row>

          <v-row>
            <v-col v-if="localDocument.category && categoryIsOther(localDocument.category.optionItemId)" cols="12">
              <v-text-field-with-validation
                v-model="localDocument.category.specifiedOther"
                data-test="category-specified-other"
                autocomplete="nope"
                :label="`${$t('common.pleaseSpecify')} *`"
                :rules="rules.specifiedOther" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-text-area-with-validation
                v-model="localDocument.note"
                :rules="rules.notes"
                :label="$t('caseFile.document.notes')"
                data-test="document-notes" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </validation-observer>

    <rc-dialog
      :title="$t(uploadDialogTitle)"
      :submit-action-label="$t('common.button.next')"
      :cancel-action-label="$t('common.buttons.cancel')"
      :show.sync="showUploadDialog"
      :show-close="false"
      :show-submit="false"
      :persistent="true"
      :max-width="750"
      data-test="upload-dialog"
      @cancel="cancelUpload()">
      <div class="pa-0">
        <template v-if="uploadHasErrors">
          {{ $t(errors[0].code) }}
        </template>
        <template v-else>
          <div class="rc-body14 pb-6">
            {{ $t('common.file.uploading.message') }}
          </div>
          <v-progress-linear v-model="percentCompleted" height="25">
            <strong>{{ Math.ceil(percentCompleted) }}%</strong>
          </v-progress-linear>
        </template>
      </div>
    </rc-dialog>
  </v-container>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import {
  VSelectWithValidation,
  VTextFieldWithValidation,
  VTextAreaWithValidation,
  RcDialog,
} from '@crctech/component-library';
import fileUpload from '@/ui/mixins/fileUpload';
import RcFileUpload from '@/ui/shared-components/RcFileUpload/RcFileUpload.vue';
import { MAX_LENGTH_MD, MAX_LENGTH_XL } from '@/constants/validations';
import { CASE_FILE_DOC_EXTENSIONS } from '@/constants/documentExtensions';
import { CaseFileDocumentEntity, DocumentStatus, ICaseFileDocumentEntity } from '@/entities/case-file-document';
import { IOptionItem } from '@/entities/optionItem';
import DownloadViewDocument from './DownloadViewDocument.vue';

export default mixins(fileUpload).extend({
  name: 'DocumentForm',

  components: {
    VSelectWithValidation,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    RcFileUpload,
    RcDialog,
    DownloadViewDocument,
  },

  props: {
    isEditMode: {
      type: Boolean,
      required: true,
    },

    document: {
      type: CaseFileDocumentEntity,
      required: true,
    },
  },

  data() {
    const localDocument = new CaseFileDocumentEntity(this.document);
    localDocument.documentStatus = localDocument.documentStatus || DocumentStatus.Current;

    return {
      localDocument,
      DocumentStatus,
      allowedExtensions: CASE_FILE_DOC_EXTENSIONS,
    };
  },

  computed: {

    documentCategories(): Array<IOptionItem> {
      return this.$storage.caseFileDocument.getters.categories(true, this.localDocument.category?.optionItemId);
    },

    categoryIsOther(): (id: string) => boolean {
      return (id) => this.documentCategories.find((c) => c.id === id)?.isOther;
    },

    rules(): Record<string, unknown> {
      return {
        name: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        documentCategories: {
          required: true,
        },
        notes: {
          max: MAX_LENGTH_XL,
        },
        file: {
          requiredFile: this.file.size,
        },
        specifiedOther: {
          required: true,
          max: MAX_LENGTH_MD,
        },
      };
    },

    statusColor(): string {
      if (this.localDocument.documentStatus === DocumentStatus.Current) {
        return 'status_success white--text';
      }
      return 'status_green_pale black--text';
    },

    isStatusActive: {
      get(): boolean {
        return this.localDocument.documentStatus === DocumentStatus.Current;
      },

      set(value: boolean) {
        this.localDocument.documentStatus = value ? DocumentStatus.Current : DocumentStatus.Past;
      },
    },

    uploadDialogTitle(): string {
      if (this.uploadHasErrors) {
        return 'common.file.uploading.error.title';
      }
      return 'common.file.uploading.title';
    },
  },

  watch: {
    localDocument: {
      handler(newDocument) {
        if (!newDocument.category || !this.categoryIsOther(newDocument.category.optionItemId)) {
          newDocument.category.specifiedOther = null;
        }
        this.$emit('update:document', newDocument);
      },
      deep: true,
    },

    file: {
      handler(newFile) {
        this.$emit('update:file', newFile);
      },
      deep: true,
    },
  },

  async created() {
    await this.$storage.caseFileDocument.actions.fetchCategories();
  },

  methods: {
    async upload(formData: FormData, url: string) {
      this.showUploadDialog = true;
      const result = await this.uploadForm(formData, url);
      return result as ICaseFileDocumentEntity;
    },
  },
});
</script>

<style scoped>
.status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-right: 4px;
  height: 56px;
  border-radius: 4px;
}
</style>
