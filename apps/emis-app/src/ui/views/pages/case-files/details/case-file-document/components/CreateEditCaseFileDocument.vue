<template>
  <validation-observer ref="form" v-slot="{ failed, dirty }" slim>
    <page-template :loading="documentLoading" :show-left-menu="false">
      <rc-page-content
        :title="isEditMode ? $t('document.edit.title') : $t('document.add.title')">
        <document-form ref="documentForm" :document.sync="document" :file.sync="file" :is-edit-mode="isEditMode" />

        <template slot="actions">
          <v-btn data-test="cancel" @click.stop="back()">
            {{ $t('common.cancel') }}
          </v-btn>

          <v-btn color="primary" data-test="save" :loading="loading" :disabled="failed || !dirty" @click.stop="submit">
            {{ submitLabel }}
          </v-btn>
        </template>
      </rc-page-content>
    </page-template>
  </validation-observer>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import { RcPageContent } from '@libs/component-lib/components';
import { VForm } from '@libs/shared-lib/types';
import { CaseFileDocumentEntity, ICaseFileDocumentEntity } from '@libs/entities-lib/case-file-document';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers/helpers';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import mixins from 'vue-typed-mixins';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';
import DocumentForm from './CaseFileDocumentForm.vue';

export default mixins(handleUniqueNameSubmitError).extend({
  name: 'CreateEditDocument',

  components: {
    PageTemplate,
    RcPageContent,
    DocumentForm,
  },

  props: {
    documentId: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      documentLoading: true,
      loading: false,
      error: false,
      document: new CaseFileDocumentEntity(null),
      file: null as File,
    };
  },

  computed: {
    isEditMode(): boolean {
      return this.$route.name === routes.caseFile.documents.edit.name;
    },

    submitLabel(): TranslateResult {
      return this.isEditMode
        ? this.$t('common.save')
        : this.$t('common.buttons.add');
    },
  },

  async created() {
    this.documentLoading = true;

    if (this.isEditMode) {
      try {
        const res = await this.$storage.caseFileDocument.actions.fetch(
          { id: this.documentId, caseFileId: this.id },
          { useMetadataGlobalHandler: false, useEntityGlobalHandler: true },
        );
        this.document = new CaseFileDocumentEntity(res.entity);
      } finally {
        this.documentLoading = false;
      }
    } else {
      this.document = new CaseFileDocumentEntity(null);
      this.document.caseFileId = this.id;
      this.documentLoading = false;
    }
  },

  methods: {
    back(): void {
      this.$router.back();
    },

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();

      if (isValid && (this.isEditMode || this.file)) {
        try {
          this.loading = true;
          let document: ICaseFileDocumentEntity;

          if (this.isEditMode) {
            document = await this.$storage.caseFileDocument.actions.updateDocument(this.document);
          } else {
            document = await this.tryUpload();
          }
          if (document) {
            // eslint-disable-next-line max-depth
            if (!this.isEditMode) {
              this.$storage.caseFileDocument.mutations.addNewlyCreatedId(document);
            }
            this.$storage.caseFileDocument.mutations.setEntity(document);
            this.$toasted.global.success(this.$t(this.isEditMode ? 'document.edit.success' : 'document.create.success'));
            this.isEditMode ? this.back()
              : this.$router.replace({ name: routes.caseFile.documents.details.name, params: { documentId: document.id } });
          }
        } catch (e) {
          this.$appInsights.trackTrace('caseFileDocument submit error', { error: e }, 'CreateEditCaseFileDocument', 'submit');
          this.handleSubmitError(e);
        } finally {
          this.loading = false;
        }
      } else {
        helpers.scrollToFirstError('scrollAnchor');
      }
    },

    async tryUpload(): Promise<ICaseFileDocumentEntity> {
      const userChoice = await this.$confirm({
        title: this.$t('caseFile.document.confirm.preprocessing.title'),
        messages: this.$t('caseFile.document.confirm.preprocessing.message'),
      });

      if (userChoice) {
        return this.uploadNewDocument();
      }
      return null;
    },

    async uploadNewDocument(): Promise<ICaseFileDocumentEntity> {
      const formData = new FormData();
      formData.set('name', this.document.name);
      formData.set('note', this.document.note || '');
      formData.set('categoryId', this.document.category.optionItemId.toString());
      if (this.document.category.specifiedOther) {
        formData.set('categoryOther', this.document.category.specifiedOther);
      }
      formData.set('documentStatus', this.document.documentStatus.toString());
      formData.set('file', this.file);

      return (this.$refs.documentForm as InstanceType<typeof DocumentForm>).upload(formData, `case-file/case-files/${this.id}/documents`);
    },
  },
});
</script>
