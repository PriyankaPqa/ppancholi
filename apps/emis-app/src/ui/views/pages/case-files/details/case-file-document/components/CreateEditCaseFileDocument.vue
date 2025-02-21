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

          <v-btn color="primary" data-test="save" :loading="loading" :disabled="failed || loading || (isEditMode && !dirty)" @click.stop="submit">
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
import { useCaseFileDocumentStore } from '@/pinia/case-file-document/case-file-document';
import { format } from 'date-fns';
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

    category(): string {
      if (!this.document?.category?.optionItemId) {
        return null;
      }
      const types = useCaseFileDocumentStore().getCategories(false);
      const type = types.find((t) => t.id === this.document.category.optionItemId);
      if (type.isOther && this.document.category.specifiedOther) {
        return this.document.category.specifiedOther;
      }
      return this.$m(type?.name);
      },
  },

  async created() {
    this.documentLoading = true;

    if (this.isEditMode) {
      try {
        const res = await useCaseFileDocumentStore().fetch({ id: this.documentId, caseFileId: this.id }) as ICaseFileDocumentEntity;
        this.document = new CaseFileDocumentEntity(res);
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
            document = await useCaseFileDocumentStore().updateDocument(this.document);
          } else {
            document = await this.tryUpload();
          }
          if (document) {
            // eslint-disable-next-line max-depth
            if (!this.isEditMode) {
              useCaseFileDocumentStore().addNewlyCreatedId(document);
            }
            useCaseFileDocumentStore().set(document);
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
      const autoNaming = `${this.category} - ${format(new Date(), 'yyyyMMdd-HHmmss')}`;
      formData.set('name', autoNaming);
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
