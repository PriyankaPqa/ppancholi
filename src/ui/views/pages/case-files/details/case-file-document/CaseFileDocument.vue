<template>
  <div class="pa-4">
    <rc-data-table
      data-test="case-file-documents-table"
      :items="caseFileDocumentsMapped"
      :count="itemsCount"
      :show-help="false"
      :help-link="$t('zendesk.help_link.case_document_list')"
      :labels="labels"
      :headers="headers"
      :table-props="tableProps"
      :options.sync="options"
      :custom-columns="Object.values(customColumns)"
      :hide-footer="true"
      :show-add-button="canAdd"
      @add-button="addCaseDocument"
      @search="search">
      <template #filter>
        <filter-toolbar
          :filter-key="FilterKey.Documents"
          :filter-options="filterOptions"
          add-filter-label="document.filter"
          :count="itemsCount"
          @update:appliedFilter="onApplyFilter($event)" />
      </template>

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
        {{ item.created.format('ll') }}
      </template>

      <template #[`item.${customColumns.documentStatusName}`]="{ item }">
        <status-chip status-name="DocumentStatus" :status="item.documentStatus" />
      </template>

      <template #[`item.${customColumns.preview}`]="{ item }">
        <v-btn icon data-test="editDocument-link" @click="preview(item)">
          <v-icon size="24" color="grey darken-2">
            mdi-file-find
          </v-icon>
        </v-btn>
      </template>

      <template #[`item.${customColumns.download}`]="{ item }">
        <v-btn icon data-test="editDocument-link" @click="download(item)">
          <v-icon size="24" color="grey darken-2">
            mdi-download
          </v-icon>
        </v-btn>
      </template>

      <template #[`item.${customColumns.edit}`]="{ item }">
        <v-btn icon data-test="editDocument-link" :to="getDocumentEditRoute(item.id)">
          <v-icon size="24" color="grey darken-2">
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>

      <template #[`item.${customColumns.delete}`]="{ item }">
        <v-btn icon data-test="editDocument-link" @click="deleteDocument(item)">
          <v-icon size="24" color="grey darken-2">
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify';
import {
  IFilterSettings,
  RcDataTable,
} from '@crctech/component-library';
import mixins from 'vue-typed-mixins';
import { EFilterType } from '@crctech/component-library/src/types';
import isEmpty from 'lodash/isEmpty';
import moment from '@/ui/plugins/moment';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { DocumentStatus, ICaseFileDocumentEntity, ICaseFileDocumentCombined } from '@/entities/case-file-document';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { FilterKey } from '@/entities/user-account';
import { IAzureSearchParams } from '@/types';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import caseFileDetail from '../caseFileDetail';

import routes from '@/constants/routes';
import helpers from '@/ui/helpers/helpers';

interface caseFileDocumentsMapped {
  name: string;
  id: string;
  category: string;
  entity: ICaseFileDocumentEntity;
  pinned: boolean;
}

export default mixins(TablePaginationSearchMixin, caseFileDetail).extend({
  name: 'CaseFileDocument',

  components: {
    RcDataTable,
    StatusChip,
    FilterToolbar,
  },

  data() {
    return {
      options: {
        sortBy: ['Entity/Name'],
        sortDesc: [false],
      },
      FilterKey,
      tableProps: {
        itemClass: (item: { pinned: boolean }) => (item.pinned ? 'pinned' : ''),
      },
    };
  },

  computed: {
    canAdd(): boolean {
      return (this.$hasLevel('level1') || this.$hasRole('contributor3')) && !this.readonly;
    },

    canEdit(): boolean {
      return this.$hasLevel('level1') && !this.readonly;
    },

    canDownload(): boolean {
      return this.$hasLevel('level1') || this.$hasRole('contributor3');
    },

    canDelete(): boolean {
      return this.$hasLevel('level6') && !this.readonly;
    },

    caseFileDocumentsMapped():caseFileDocumentsMapped[] {
      const documents = this.$storage.caseFileDocument.getters.getByIds(this.searchResultIds,
        { onlyActive: true, prependPinnedItems: true, baseDate: this.searchExecutionDate });
      return documents.map((d: ICaseFileDocumentCombined) => ({
        name: d.entity?.name || '-',
        id: d.entity?.id,
        category: this.$m(d.metadata?.documentCategoryName) || '-',
        documentStatus: d.entity?.documentStatus || '-',
        documentStatusName: this.$m(d.metadata?.documentStatusName) || '-',
        created: moment(d.entity?.created) || '-',
        entity: d.entity,
        pinned: d.pinned,
      }));
    },

    customColumns(): Record<string, string> {
      return {
        name: 'Entity/Name',
        category: `Metadata/DocumentCategoryName/Translation/${this.$i18n.locale}`,
        created: 'Entity/Created',
        documentStatusName: `Metadata/DocumentStatusName/Translation/${this.$i18n.locale}`,
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
          value: this.customColumns.documentStatusName,
        },
        {
          text: '',
          sortable: false,
          value: this.customColumns.preview,
          width: '5%',
        },
      ];

      if (this.canDownload) {
        headers.push({
          text: '',
          sortable: false,
          value: this.customColumns.download,
          width: '5%',
        });
      }

      if (this.canEdit) {
        headers.push({
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

    filterOptions(): Array<IFilterSettings> {
      return [
        {
          key: this.customColumns.name,
          type: EFilterType.Text,
          label: this.$t('common.name') as string,
        },
        {
          key: this.customColumns.category,
          type: EFilterType.MultiSelect,
          label: this.$t('caseFile.document.category') as string,
          items: this.$storage.caseFileDocument.getters
            .categories(false)
            .map((c) => ({ text: this.$m(c.name), value: this.$m(c.name) }))
            .sort((a, b) => a.value.localeCompare(b.value)),
        },
        {
          key: this.customColumns.created,
          type: EFilterType.Date,
          label: this.$t('caseFile.document.dateAdded') as string,
        },
        {
          key: this.customColumns.documentStatusName,
          type: EFilterType.MultiSelect,
          label: this.$t('caseFile.document.status') as string,
          items: helpers.enumToTranslatedCollection(DocumentStatus, 'enums.DocumentStatus', true),
        },
      ];
    },

    labels(): Record<string, unknown> {
      return {
        header: {
          title: `${this.$t('caseFile.document.title')} (${this.itemsCount})`,
          searchPlaceholder: this.$t('common.inputs.quick_search'),
          addButtonLabel: this.$t('document.add.title'),
        },
      };
    },
  },

  async created() {
    await this.$storage.caseFileDocument.actions.fetchCategories();
  },

  methods: {
    async fetchData(params: IAzureSearchParams) {
      const caseFileFilter = {
        'Entity/CaseFileId': this.caseFileId,
      };

      if (isEmpty(params.filter)) {
        params.filter = caseFileFilter;
      } else {
        (params.filter as Record<string, unknown>).and = Object.assign((params.filter as Record<string, unknown>).and, caseFileFilter);
      }

      const res = await this.$storage.caseFileDocument.actions.search({
        search: params.search,
        filter: params.filter,
        top: 999,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      }, null, true);
      return res;
    },

    addCaseDocument() {
      this.$router.push({
        name: routes.caseFile.documents.add.name,
      });
    },

    async deleteDocument(item: caseFileDocumentsMapped) {
      if (await this.$confirm(this.$t('caseFile.document.confirm.delete.title'), this.$t('caseFile.document.confirm.delete.message'))) {
        await this.$storage.caseFileDocument.actions.deactivate({ id: item.id, caseFileId: this.caseFileId });
      }
    },

    getDocumentDetailsRoute(id: string) {
      return {
        name: routes.caseFile.documents.details.name,
        params: {
          documentId: id,
        },
      };
    },

    getDocumentEditRoute(id: string) {
      return {
        name: routes.caseFile.documents.edit.name,
        params: {
          documentId: id,
        },
      };
    },

    download(item: caseFileDocumentsMapped) {
      this.$storage.caseFileDocument.actions.downloadDocumentAsUrl(item.entity, true);
    },

    async preview(item: caseFileDocumentsMapped) {
      const documentUrl = await this.$storage.caseFileDocument.actions.downloadDocumentAsUrl(item.entity, false);
      window.open(documentUrl);
    },
  },
});
</script>
