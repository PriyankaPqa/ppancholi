<template>
  <div class="pa-4">
    <rc-data-table
      data-test="case-file-documents-table"
      :items="caseFileDocuments"
      :count="caseFileDocuments.length"
      :show-help="true"
      :help-link="$t('zendesk.help_link.case_document_list')"
      :labels="labels"
      :headers="headers"
      :options.sync="options"
      :custom-columns="Object.values(customColumns)"
      :hide-footer="true"
      :show-add-button="canAdd"
      @add-button="addCaseDocument"
      @search="search">
      <template #[`item.${customColumns.name}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold pr-1"
          data-test="documentDetail-link"
          :to="getDocumentDetailsRoute(item.id)">
          {{ item.name }}
        </router-link>
      </template>

      <template #[`item.${customColumns.category}`]="{ item }">
        {{ item.category }}
      </template>

      <template #[`item.${customColumns.created}`]="{ item }">
        {{ item.created }}
      </template>

      <template #[`item.${customColumns.documentStatus}`]="{ item }">
        <status-chip status-name="DocumentStatus" :status="item.documentStatus" />
      </template>

      <template #[`item.${customColumns.preview}`]="{ }">
        <v-btn icon data-test="editDocument-link">
          <v-icon size="24" color="grey darken-2">
            mdi-file-find
          </v-icon>
        </v-btn>
      </template>

      <template #[`item.${customColumns.download}`]="{ }">
        <v-btn icon data-test="editDocument-link">
          <v-icon size="24" color="grey darken-2">
            mdi-download
          </v-icon>
        </v-btn>
      </template>

      <template #[`item.${customColumns.edit}`]="{ item }">
        <v-btn icon data-test="editDocument-link" @click="getDocumentEditRoute(item.id)">
          <v-icon size="24" color="grey darken-2">
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>

      <template #[`item.${customColumns.delete}`]="{ }">
        <v-btn icon data-test="editDocument-link">
          <v-icon size="24" color="grey darken-2">
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import _orderBy from 'lodash/orderBy';
import moment from '@/ui/plugins/moment';
import {
  RcDataTable,
} from '@crctech/component-library';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { ICaseFileDocumentEntity } from '@/entities/case-file-document';
import { IAzureSearchParams } from '@/types';
import StatusChip from '@/ui/shared-components/StatusChip.vue';

// import routes from '@/constants/routes';
import helpers from '@/ui/helpers';

interface caseFileDocumentsMapped {
  name: string;
  id: string;
  category: string;
}

export default Vue.extend({
  name: 'CaseFileDocument',

  components: {
    RcDataTable,
    StatusChip,
  },

  mixins: [TablePaginationSearchMixin],

  data() {
    return {
      options: {
        sortBy: ['name'],
        sortDesc: [false],
      },
      filter: '',
    };
  },

  computed: {
    caseFileId(): string {
      return this.$route.params.id;
    },

    canAdd(): boolean {
      return this.$hasLevel('level1');
    },

    canEdit(): boolean {
      return this.$hasLevel('level1');
    },

    canDelete(): boolean {
      return this.$hasLevel('level6');
    },

    caseFileDocumentsMapped():caseFileDocumentsMapped[] {
      const documentsByCaseFile = this.$storage.caseFileDocument.getters.getByCaseFile(this.caseFileId) || [];
      return documentsByCaseFile.map((d) => ({
        name: d.entity.name,
        id: d.entity.id,
        category: this.getCategory(d.entity),
        documentStatus: d.entity.documentStatus,
        documentStatusName: this.$m(d.metadata.documentStatusName),
        created: moment(d.entity.created).format('ll'),
      }));
    },

    caseFileDocuments(): caseFileDocumentsMapped[] {
      let documents = this.caseFileDocumentsMapped;
      if (this.filter) {
        documents = helpers.filterCollectionByValue(documents, this.filter, false, Object.values(this.customColumns));
      }
      return _orderBy(documents, this.options.sortBy[0], this.options.sortDesc[0] ? 'desc' : 'asc');
    },

    customColumns(): Record<string, string> {
      return {
        name: 'name',
        category: 'category',
        created: 'created',
        documentStatus: 'documentStatus',
        documentStatusName: 'documentStatusName',
        preview: 'preview',
        download: 'download',
        edit: 'edit',
        delete: 'delete',
      };
    },

    headers(): Array<DataTableHeader> {
      const headers = [
        {
          text: this.$t('common.name') as string,
          sortable: true,
          value: this.customColumns.name,
          width: '40%',
        },
        {
          text: this.$t('caseFile.document.category') as string,
          sortable: true,
          value: this.customColumns.category,
        },
        {
          text: this.$t('caseFile.document.dateAdded') as string,
          sortable: true,
          value: this.customColumns.created,
        },
        {
          text: this.$t('caseFile.document.status') as string,
          sortable: true,
          value: this.customColumns.documentStatus,
        },
        {
          text: '',
          sortable: false,
          value: this.customColumns.preview,
          width: '5%',
        },
      ];

      if (this.canEdit) {
        headers.push({
          text: '',
          sortable: false,
          value: this.customColumns.download,
          width: '5%',
        },
        {
          text: '',
          sortable: false,
          value: this.customColumns.edit,
          width: '5%',
        });
      }

      if (this.canDelete) {
        headers.push({
          text: '',
          sortable: false,
          value: this.customColumns.delete,
          width: '5%',
        });
      }

      return headers;
    },

    labels(): Record<string, unknown> {
      return {
        header: {
          title: `${this.$t('caseFile.document.title')} (${this.caseFileDocuments.length})`,
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },
  },

  async created() {
    await this.$storage.caseFileDocument.actions.fetchCategories();
    await this.$storage.caseFileDocument.actions.fetchAll({ caseFileId: this.caseFileId });
  },

  methods: {
    search(searchParams?: IAzureSearchParams) {
      this.filter = searchParams?.search;
    },

    getCategory(item: ICaseFileDocumentEntity): string {
      if (!item?.category?.optionItemId) return '';
      const opt = this.$storage.caseFileDocument.getters.categories(false).find((c) => c.id === item.category.optionItemId);
      return opt ? this.$m(opt.name) : '';
    },

    addCaseDocument() {
      this.$router.push({
        // name: routes.caseFile.documents.add.name,
      });
    },

    getDocumentDetailsRoute(id: string) {
      return {
        // name: routes.caseFile.documents.details.name,
        // params: {
        //   documentId: id,
        // },
      };
    },

    getDocumentEditRoute(id: string) {
      return {
        // name: routes.caseFile.documents.edit.name,
        // params: {
        //   documentId: id,
        // },
      };
    },
  },
});
</script>
