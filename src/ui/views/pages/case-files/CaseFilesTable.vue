<template>
  <rc-data-table
    ref="caseFilesTable"
    data-test="case-files-table"
    :items="azureSearchItems"
    :count="azureSearchCount"
    :show-help="true"
    :help-link="$t(helpLink)"
    :labels="labels"
    :headers="headers"
    :table-props="tableProps"
    :hide-footer="hideFooter"
    :options.sync="options"
    :custom-columns="Object.values(customColumns)"
    @search="search">
    <template #[`item.${customColumns.caseFileNumber}`]="{ item: caseFile }">
      <router-link
        class="rc-link14 font-weight-bold pr-1"
        data-test="caseFileDetail-link"
        :to="getCaseFileRoute(caseFile)">
        {{ caseFile.caseFileNumber }}
      </router-link>

      <v-icon
        v-if="caseFile.isDuplicate"
        :data-test="`caseFilesTable__duplicateIcon--${caseFile.caseFileNumber}`"
        small
        color="secondary">
        $rctech-duplicate
      </v-icon>
    </template>

    <template #[`item.${customColumns.name}`]="{ item: caseFile }">
      <router-link
        v-if="caseFile.household"
        class="rc-link14"
        data-test="beneficiaryName-link"
        :to="getHouseholdProfileRoute(caseFile)">
        {{ getBeneficiaryName(caseFile) }}
      </router-link>
    </template>

    <template #[`item.${customColumns.event}`]="{ item: caseFile }">
      {{ $m(caseFile.event.name) }}
    </template>

    <template #[`item.${customColumns.triage}`]="{ item: caseFile }">
      {{ $m(caseFile.triageName) }}
    </template>

    <template #[`item.${customColumns.status}`]="{ item: caseFile }">
      <status-chip status-name="ECaseFileStatus" :status="caseFile.caseFileStatus" />
    </template>

    <template #[`item.${customColumns.created}`]="{ item: caseFile }">
      {{ getStringDate(caseFile.created, 'll') }}
    </template>
  </rc-data-table>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import {
  RcDataTable,
} from '@crctech/component-library';
import routes from '@/constants/routes';
import { IAzureSearchParams } from '@/types';
import { ICaseFile, ECaseFileStatus } from '@/entities/case-file';
import helpers from '@/ui/helpers';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';

export default Vue.extend({
  name: 'CaseFilesTable',
  components: {
    RcDataTable,
    StatusChip,
  },

  mixins: [TablePaginationSearchMixin],

  props: {
    // showFiltersBar: {
    //   type: Boolean,
    //   default: false,
    // },
    limitResults: {
      type: Number,
      default: 0,
    },
    hideFooter: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      ECaseFileStatus,
      getStringDate: helpers.getStringDate,
      helpLink: 'zendesk.help_link.caseFilesTable',
      options: {
        page: 1,
        sortBy: ['CaseFileCreatedDate'],
        sortDesc: [true],
        ...this.limitResults ? { itemsPerPage: this.limitResults } : {}, // Add the property itemsPerPage only if limitResults is truthy
      },
    };
  },

  computed: {

    customColumns(): Record<string, string> {
      return {
        caseFileNumber: 'CaseFileNumber',
        name: 'Household/PrimaryBeneficiary/IdentitySet/FirstName',
        event: `Event/Name/Translation/${this.$i18n.locale}`,
        triage: `TriageName/Translation/${this.$i18n.locale}`,
        status: `CaseFileStatusName/Translation/${this.$i18n.locale}`,
        created: 'CaseFileCreatedDate',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('caseFileTable.tableHeaders.caseFileNumber') as string,
          sortable: true,
          value: this.customColumns.caseFileNumber,
        },
        {
          text: this.$t('caseFilesTable.tableHeaders.name') as string,
          sortable: true,
          value: this.customColumns.name,
        },
        {
          text: this.$t('caseFilesTable.tableHeaders.event') as string,
          sortable: true,
          value: this.customColumns.event,
        },
        {
          text: this.$t('caseFilesTable.tableHeaders.triage') as string,
          sortable: true,
          value: this.customColumns.triage,
        },
        {
          text: this.$t('caseFilesTable.tableHeaders.status') as string,
          sortable: true,
          value: this.customColumns.status,
        },
        {
          text: this.$t('caseFilesTable.tableHeaders.createdDate') as string,
          sortable: true,
          value: this.customColumns.created,
        },
      ];
    },

    labels(): Record<string, unknown> {
      return {
        header: {
          title: `${this.$t('caseFiles_table.title')} (${this.$data.azureSearchCount})`,
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },

    tableProps(): Record<string, string> {
      return {
        loading: this.$store.state.caseFile.searchLoading,
      };
    },
  },

  methods: {

    async fetchData(params: IAzureSearchParams) {
      const res = await this.$storage.caseFile.actions.searchCaseFiles({
        search: params.search,
        filter: params.filter,
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      });
      return res;
    },

    getBeneficiaryName(caseFile: ICaseFile): string {
      if (!caseFile.household) return '';
      const { firstName, middleName, lastName } = caseFile.household.primaryBeneficiary.identitySet;
      return `${firstName} ${middleName ? `${middleName} ` : ''}${lastName}`;
    },

    getHouseholdProfileRoute(caseFile: ICaseFile) {
      return {
        name: routes.caseFile.householdProfile.name,
        params: {
          id: caseFile.household?.id,
        },
      };
    },

    getCaseFileRoute(caseFile: ICaseFile) {
      return {
        name: routes.caseFile.activity.name,
        params: {
          id: caseFile.id,
        },
      };
    },
  },

});
</script>
