<template>
  <div class="pa-4">
    ALL THIS IS TEMPORARY! Just to show that you can create and reload the new data

    <rc-data-table
      data-test="case-file-assessment-table"
      :items="assessments"
      :count="assessments.length"
      :show-add-button="canAdd"
      :labels="labels"
      :headers="headers"
      :footer-text="footerText"
      :table-props="tableProps"
      :options.sync="options"
      :initial-search="params && params.search"
      :custom-columns="Object.values(customColumns)"
      @add-button="addAssessment"
      @search="search">
      <template #[`item.${customColumns.name}`]="{ item }">
        {{ $m(item.form.name) }}
      </template>
    </rc-data-table>

    <add-case-file-assessment
      v-if="showAddPopup"
      data-test="add-cfa"
      :show.sync="showAddPopup"
      :case-file-id="caseFileId"
      :event-id="caseFile.entity.eventId"
      :excluded-ids="oneTimeAssessmentsIds" />
  </div>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify';
import { RcDataTable } from '@libs/component-lib/components';
import mixins from 'vue-typed-mixins';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { IAzureSearchParams } from '@libs/shared-lib/types';
import {
  AssociationType, IAssessmentBaseEntity, AssessmentFrequencyType, IAssessmentResponseCombined,
} from '@libs/entities-lib/assessment-template';
import { Status } from '@libs/entities-lib/base';
import caseFileDetail from '../caseFileDetail';
import AddCaseFileAssessment from './components/AddCaseFileAssessment.vue';

export default mixins(TablePaginationSearchMixin, caseFileDetail).extend({
  name: 'CaseFileAssessment',

  components: {
    RcDataTable,
    AddCaseFileAssessment,
  },

  data() {
    return {
      options: {
        // sortBy: ['Entity/Name'],
        // sortDesc: [false],
      },
      tableProps: {
        itemClass: (item: { response: { pinned: boolean } }) => (item.response.pinned ? 'pinned' : ''),
      },
      showAddPopup: false,
    };
  },

  computed: {
    canAdd(): boolean {
      return this.$hasLevel('level1') && !this.readonly;
    },

    items(): IAssessmentResponseCombined[] {
      const items = this.$storage.assessmentResponse.getters.getByIds(this.searchResultIds,
        {
          onlyActive: true, prependPinnedItems: true, baseDate: this.searchExecutionDate, parentId: { 'association.id': this.caseFileId },
        });
      return items;
    },

    assessments(): { form: IAssessmentBaseEntity, response: IAssessmentResponseCombined, id: string }[] {
      const assessments = this.$storage.assessmentForm.getters.getByIds(this.items?.map((i) => i.entity.assessmentFormId),
        {
          onlyActive: true,
        });
      return this.items.map((r) => ({
        form: assessments.find((i) => r.entity.assessmentFormId === i.entity.id)?.entity || {} as IAssessmentBaseEntity,
        response: r,
        id: r.entity.id,
      }));
    },

    oneTimeAssessmentsIds(): string[] {
      return this.assessments.filter((a) => a.form.frequency === AssessmentFrequencyType.OneTime).map((e) => e.form.id);
    },

    customColumns(): Record<string, string> {
      return {
        name: 'Entity/Name',
      };
    },

    headers(): Array<DataTableHeader> {
      const headers = [
        {
          text: this.$t('common.name') as string,
          value: this.customColumns.name,
        },
      ];

      return headers;
    },

    labels(): Record<string, unknown> {
      return {
        header: {
          // title: `${this.$t('caseFile.document.title')} (${this.caseFileDocumentsMapped.length})`,
          searchPlaceholder: this.$t('common.inputs.quick_search'),
          addButtonLabel: this.$t('document.add.title'),
        },
      };
    },
  },

  async created() {
    this.saveState = true;
    this.loadState();
    this.fetchAssessments();
  },

  watch: {
    items() {
      this.fetchAssessments();
    },
  },

  methods: {
    async fetchAssessments() {
      if (!this.items?.length) {
        return;
      }

      await this.$storage.assessmentForm.actions.search({
        filter: { 'Entity/Status': Status.Active, 'Entity/Id': { searchIn_az: this.items.map((i) => i.entity.assessmentFormId) || [] } },
        top: 999,
        queryType: 'full',
        searchMode: 'all',
      }, null, true);
    },

    async fetchData(params: IAzureSearchParams) {
      const caseFileFilter = {
        'Entity/Association/Id': this.caseFileId,
        'Entity/Association/Type': AssociationType.CaseFile,
      };

      params.filter = caseFileFilter;

      const res = await this.$storage.assessmentResponse.actions.search({
        filter: params.filter,
        top: 999,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      }, null, true);
      return res;
    },

    addAssessment() {
      this.showAddPopup = true;
    },
  },
});
</script>
