<template>
  <query-view :specific-datasource="documentListDs" :table-title="$t('caseFile.document.title')" />
</template>
<script lang="ts">
import mixins from 'vue-typed-mixins';
import { UserRoles } from '@libs/entities-lib/user';
import routes from '@/constants/routes';
import { useCaseFileDocumentStore } from '@/pinia/case-file-document/case-file-document';
import caseFileDetail from '../caseFileDetail';
import QueryView from '../../../reporting/QueryView.vue';
import { ExtendedColumn, IDatasourceSettings } from '../../../reporting/datasources';

export default mixins(caseFileDetail).extend({
  name: 'CaseFileDocumentDX',

  components: {
    QueryView,
  },
  data() {
    return {};
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

    documentListDs(): IDatasourceSettings {
      const staticColumn = {
        allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, allowReordering: false, allowSorting: false, allowHiding: false, allowExporting: false,
      } as Partial<ExtendedColumn>;
      const lang = this.$i18n.locale;
      return {
        url: 'case-file/search/documentsV2',
        reportingTopic: null,
        filter: [['entity.caseFileId', '=', this.caseFileId], ['entity.status', '=', 'Active']],
        columns: ([
          // { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
          // { dataField: 'entity.caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
          {
            dataField: 'entity.name',
            caption: this.$t('common.name'),
            dataType: 'string',
            cellTemplate: 'linkto',
            linkPath: this.getDocumentDetailsRoute,
          },
          { dataField: `metadata.documentCategory.translation.${lang}`, dataType: 'string', caption: this.$t('caseFile.document.category') },
          { dataField: 'entity.created', dataType: 'date', caption: this.$t('caseFile.document.dateAdded') },
          {
            dataField: `metadata.documentStatusName.translation.${lang}`,
            dataType: 'string',
            caption: this.$t('caseFile.document.status'),
            cellTemplate: 'statuspill',
            statusName: 'DocumentStatus',
            getStatus: (x: any) => x.entity.documentStatus,
          },
          { ...staticColumn, name: 'preview', cellTemplate: 'button', iconType: 'mdi-file-find', buttonText: this.$t('documentDetails.title'), buttonAction: this.preview },
          { ...staticColumn, name: 'download', cellTemplate: 'button', iconType: 'mdi-download', buttonText: this.$t('common.download'), buttonAction: this.download },
          { ...staticColumn, name: 'edit', cellTemplate: 'button', iconType: 'mdi-pencil', buttonText: this.$t('common.edit'), buttonAction: this.goToEdit },
          { ...staticColumn, name: 'delete', cellTemplate: 'button', iconType: 'mdi-delete', buttonText: this.$t('common.delete'), buttonAction: this.deleteDocument },
        ] as ExtendedColumn[]),
        key: { 'entity.caseFileId': 'Guid', id: 'Guid' },
      };
    },
  },
  async created() {
    // this.saveState = true;
    // this.loadState();
    // await useCaseFileDocumentStore().fetchCategories();
  },
  methods: {
    getDocumentDetailsRoute(x: any) {
      return {
        name: routes.caseFile.documents.details.name,
        params: {
          documentId: x.id?.toString(),
          id: x.entity.caseFileId?.toString(),
        },
      };
    },

    goToEdit(x: any) {
      this.$router.push({
        name: routes.caseFile.documents.edit.name,
        params: {
          documentId: x.id?.toString(),
          id: x.entity.caseFileId?.toString(),
        },
      });
    },

    download(x: any) {
      useCaseFileDocumentStore().downloadDocumentAsUrl({ item: x.entity, saveDownloadedFile: true });
    },

    async preview(x: any) {
      const documentUrl = await useCaseFileDocumentStore().downloadDocumentAsUrl({ item: x.entity, saveDownloadedFile: false });
      window.open(documentUrl);
    },

    async deleteDocument(x: any) {
      const userChoice = await this.$confirm({
        title: this.$t('caseFile.document.confirm.delete.title'),
        messages: this.$t('caseFile.document.confirm.delete.message'),
      });

      if (userChoice) {
        await useCaseFileDocumentStore().deactivate({ id: x.id, caseFileId: this.caseFileId });
      }
    },
  },
});
</script>
