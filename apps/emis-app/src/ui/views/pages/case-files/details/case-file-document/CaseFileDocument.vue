<template>
  <div class="pa-4">
    <rc-data-table
      data-test="case-file-documents-table"
      :items="caseFileDocumentsMapped"
      :count="caseFileDocumentsMapped.length"
      :show-help="false"
      :help-link="$t('zendesk.help_link.case_document_list')"
      :labels="labels"
      :headers="headers"
      :footer-text="footerText"
      :table-props="tableProps"
      :options.sync="options"
      :initial-search="params && params.search"
      :custom-columns="Object.values(customColumns)"
      :hide-footer="true"
      :show-add-button="canAdd"
      @add-button="addCaseDocument"
      @search="search">
      <template #filter>
        <filter-toolbar
          :filter-key="FilterKey.Documents"
          :filter-options="filterOptions"
          :initial-filter="filterState"
          add-filter-label="document.filter"
          :count="caseFileDocumentsMapped.length"
          @update:appliedFilter="onApplyFilter" />
      </template>

      <template #[`item.${customColumns.name}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold pr-1"
          :data-test="`documentDetail-link-${item.id}`"
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

      <template #[`item.${customColumns.documentStatusName}`]="{ item }">
        <status-chip status-name="DocumentStatus" :status="item.documentStatus" />
      </template>

      <template #[`item.${customColumns.preview}`]="{ item }">
        <v-btn
          icon
          data-test="editDocument-link"
          :aria-label="$t('documentDetails.title')"
          @click="preview(item)">
          <v-icon size="24" color="grey darken-2">
            mdi-file-find
          </v-icon>
        </v-btn>
      </template>

      <template #[`item.${customColumns.download}`]="{ item }">
        <v-btn icon data-test="editDocument-link" :aria-label="$t('common.download')" @click="download(item)">
          <v-icon size="24" color="grey darken-2">
            mdi-download
          </v-icon>
        </v-btn>
      </template>

      <template #[`item.${customColumns.edit}`]="{ item }">
        <v-btn icon data-test="editDocument-link" :aria-label="$t('common.edit')" :to="getDocumentEditRoute(item.id)">
          <v-icon size="24" color="grey darken-2">
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>

      <template #[`item.${customColumns.delete}`]="{ item }">
        <v-btn icon data-test="editDocument-link" :aria-label="$t('common.delete')" @click="deleteDocument(item)">
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
import { RcDataTable } from '@libs/component-lib/components';
import mixins from 'vue-typed-mixins';
import { EFilterKeyType, EFilterType, IFilterSettings } from '@libs/component-lib/types';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { DocumentStatus, ICaseFileDocumentEntity } from '@libs/entities-lib/case-file-document';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { FilterKey } from '@libs/entities-lib/user-account';
import { ISearchParams } from '@libs/shared-lib/types';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { useCaseFileDocumentStore } from '@/pinia/case-file-document/case-file-document';
import { UserRoles } from '@libs/entities-lib/user';

import routes from '@/constants/routes';
import helpers from '@/ui/helpers/helpers';
import { format } from 'date-fns';
import caseFileDetail from '../caseFileDetail';

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
      return (this.$hasLevel(UserRoles.level1) || this.$hasRole(UserRoles.contributor3)) && !this.readonly;
    },

    canEdit(): boolean {
      return this.$hasLevel(UserRoles.level1) && !this.readonly;
    },

    canDownload(): boolean {
      return this.$hasLevel(UserRoles.level1) || this.$hasRole(UserRoles.contributor3);
    },

    canDelete(): boolean {
      return this.$hasLevel(UserRoles.level6) && !this.readonly;
    },

    caseFileDocumentsMapped(): caseFileDocumentsMapped[] {
      const documents = useCaseFileDocumentStore().getByIdsWithPinnedItems(
        this.searchResultIds,
        {
          onlyActive: true, baseDate: this.searchExecutionDate, parentId: { caseFileId: this.caseFileId },
        },
      );
      if (!documents) {
        return [];
      }

      return documents.map((d: ICaseFileDocumentEntity) => ({
        name: d?.name || '-',
        id: d?.id,
        category: helpers.getOptionItemNameFromListOption(useCaseFileDocumentStore().getCategories(false), d?.category),
        documentStatus: d?.documentStatus || '-',
        documentStatusName: d?.documentStatus ? this.$t(`enums.DocumentStatus.${DocumentStatus[d.documentStatus]}`) : '-',
        created: d?.created ? format(new Date(d.created), 'PP') : '-',
        entity: d,
        pinned: d.pinned,
      }));
    },

    customColumns(): Record<string, string> {
      return {
        name: 'Entity/Name',
        category: `Metadata/DocumentCategory/Translation/${this.$i18n.locale}`,
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
          text: this.$t('caseFile.document.preview') as string,
          class: 'rc-transparent-text',
          sortable: false,
          value: this.customColumns.preview,
          width: '5%',
        },
      ];

      if (this.canDownload) {
        headers.push({
          text: this.$t('common.download') as string,
          class: 'rc-transparent-text',
          sortable: false,
          value: this.customColumns.download,
          width: '5%',
        });
      }

      if (this.canEdit) {
        headers.push({
          text: this.$t('common.edit') as string,
          class: 'rc-transparent-text',
          sortable: false,
          value: this.customColumns.edit,
          width: '5%',
        });
      }

      if (this.canDelete) {
        headers.push({
          text: this.$t('common.delete') as string,
          class: 'rc-transparent-text',
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
          key: 'Entity/Category/OptionItemId',
          type: EFilterType.MultiSelect,
          keyType: EFilterKeyType.Guid,
          label: this.$t('caseFile.document.category') as string,
          items: useCaseFileDocumentStore()
            .getCategories(false)
            .map((c) => ({ text: this.$m(c.name), value: c.id }))
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
          title: `${this.$t('caseFile.document.title')} (${this.caseFileDocumentsMapped.length})`,
          searchPlaceholder: this.$t('common.inputs.quick_search'),
          addButtonLabel: this.$t('document.add.title'),
        },
      };
    },
  },

  async created() {
    this.saveState = true;
    this.loadState();
    await useCaseFileDocumentStore().fetchCategories();
  },

  methods: {
    async fetchData(params: ISearchParams) {
      const filterParams = Object.keys(params.filter).length > 0 ? params.filter as Record<string, unknown> : {} as Record<string, unknown>;

      const res = await useCaseFileDocumentStore().search({
      params: {
        filter: { 'Entity/CaseFileId': { value: this.caseFileId, type: EFilterKeyType.Guid }, ...filterParams },
        top: 999,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
      },
      includeInactiveItems: true,
    });
      return res;
    },

    addCaseDocument() {
      this.$router.push({
        name: routes.caseFile.documents.add.name,
      });
    },

    async deleteDocument(item: caseFileDocumentsMapped) {
      const userChoice = await this.$confirm({
        title: this.$t('caseFile.document.confirm.delete.title'),
        messages: this.$t('caseFile.document.confirm.delete.message'),
      });

      if (userChoice) {
        await useCaseFileDocumentStore().deactivate({ id: item.id, caseFileId: this.caseFileId });
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
      useCaseFileDocumentStore().downloadDocumentAsUrl({ item: item.entity, saveDownloadedFile: true });
    },

    async preview(item: caseFileDocumentsMapped) {
      const documentUrl = await useCaseFileDocumentStore().downloadDocumentAsUrl({ item: item.entity, saveDownloadedFile: false });
      window.open(documentUrl);
    },
  },
});
</script>
