<template>
  <rc-page-content
    :title=" $t('documentDetails.title')">
    <v-row class="justify-center mt-10">
      <v-col cols="12" lg="7">
        <div class="pb-4 d-flex justify-space-between">
          <div class="details-page-title">
            {{ document.name }}
          </div>
          <div>
            <status-chip status-name="DocumentStatus" :status="document.documentStatus" />
            <v-btn v-if="canEdit" icon :aria-label="$t('common.edit')" :to="documentEditRoute" data-test="editDocument-link">
              <v-icon>
                mdi-pencil
              </v-icon>
            </v-btn>
            <v-btn v-if="canDelete" icon :aria-label="$t('common.delete')" data-test="deleteDocument-link" @click="deleteDocument()">
              <v-icon>
                mdi-delete
              </v-icon>
            </v-btn>
          </div>
        </div>
        <div class="pb-4">
          <download-view-document :document="document" />
        </div>
        <v-sheet rounded outlined>
          <v-simple-table>
            <tbody>
              <tr v-for="item in documentData" :key="item.test" :data-test="`document_details_${item.test}`">
                <td class="label fw-bold">
                  {{ $t(item.label) }}
                </td>
                <td class="data">
                  {{ item.data }}
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-sheet>
      </v-col>
    </v-row>
    <template slot="actions">
      <v-btn
        color="primary"
        data-test="document_details_back_btn"
        @click="goToDocuments()">
        {{ $t('documentDetails.back_to_documents') }}
      </v-btn>
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { RcPageContent } from '@libs/component-lib/components';
import routes from '@/constants/routes';
import { CaseFileDocumentEntity, ICaseFileDocumentEntity } from '@libs/entities-lib/case-file-document';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { useCaseFileDocumentStore } from '@/pinia/case-file-document/case-file-document';
import { UserRoles } from '@libs/entities-lib/user';
import { format } from 'date-fns';
import DownloadViewDocument from './DownloadViewDocument.vue';
import caseFileDetail from '../../caseFileDetail';

export default mixins(caseFileDetail).extend({
  name: 'CaseFileDocumentDetails',

  components: {
    RcPageContent,
    DownloadViewDocument,
    StatusChip,
  },

  props: {
    documentId: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      documentLoading: true,
      loading: false,
      error: false,
    };
  },

  computed: {
    canEdit(): boolean {
      return this.$hasLevel(UserRoles.level1) && !this.readonly;
    },

    canDelete(): boolean {
      return this.$hasLevel(UserRoles.level6) && !this.readonly;
    },

    document(): ICaseFileDocumentEntity {
      const document = useCaseFileDocumentStore().getById(this.documentId);
      return document || new CaseFileDocumentEntity();
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

    documentData(): Record<string, string>[] {
      return [
        {
          label: 'caseFile.document.category',
          data: this.category,
          test: 'category',
        },
        {
          label: 'caseFile.document.dateAdded',
          data: format(new Date(this.document.created), 'PP'),
          test: 'method',
        },
        {
          label: 'caseFile.document.notes',
          data: this.document.note,
          test: 'notes',
        },
      ];
    },

    documentEditRoute(): { name: string, params: Record<string, string> } {
      return {
        name: routes.caseFile.documents.edit.name,
        params: {
          documentId: this.documentId,
        },
      };
    },

  },

  async created() {
    await useCaseFileDocumentStore().fetchCategories();
    await useCaseFileDocumentStore().fetch({ caseFileId: this.caseFileId, id: this.documentId }, true);
  },

  methods: {
    goToDocuments() {
      this.$router.push({
        name: routes.caseFile.documents.home.name,
      });
    },

    async deleteDocument() {
      const userChoice = await this.$confirm({
        title: this.$t('caseFile.document.confirm.delete.title'),
        messages: this.$t('caseFile.document.confirm.delete.message'),
      });
      if (userChoice) {
        await useCaseFileDocumentStore().deactivate({ caseFileId: this.caseFileId, id: this.documentId });
        this.goToDocuments();
      }
    },
  },

});
</script>
