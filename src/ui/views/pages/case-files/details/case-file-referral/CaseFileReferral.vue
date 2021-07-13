<template>
  <div class="pa-4">
    <rc-data-table
      data-test="case-file-referrals-table"
      :items="caseFileReferrals"
      :count="caseFileReferrals.length"
      :show-help="true"
      :help-link="$t('zendesk.help_link.case_referral_list')"
      :labels="labels"
      :headers="headers"
      :options.sync="options"
      :custom-columns="Object.values(customColumns)"
      :hide-footer="true"
      :show-add-button="canEdit"
      @add-button="addCaseReferral"
      @search="search">
      <template #[`item.${customColumns.name}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold pr-1"
          data-test="referralDetail-link"
          :to="getReferralDetailsRoute(item)">
          {{ item.name }}
        </router-link>
      </template>

      <template #[`item.${customColumns.refType}`]="{ item }">
        {{ refType(item) }}
      </template>

      <template #[`item.${customColumns.outcomeStatus}`]="{ item }">
        {{ outcomeStatus(item) }}
      </template>

      <template #[`item.${customColumns.edit}`]="{ item }" v-if="canEdit">
        <v-btn icon :to="getReferralEditRoute(item)" data-test="editReferral-link">
          <v-icon>
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import {
  RcDataTable,
} from '@crctech/component-library';
import * as searchEndpoints from '@/constants/searchEndpoints';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { ICaseFileReferralEntity } from '@/entities/case-file-referral';
import { IAzureSearchParams } from '@/types';
import routes from '@/constants/routes';

export default Vue.extend({
  name: 'CaseFileReferral',

  components: {
    RcDataTable,
  },

  mixins: [TablePaginationSearchMixin],

  data() {
    return {
      caseFileReferralIds: [] as string[],
      options: {
        sortBy: ['Entity/Name'],
        sortDesc: [false],
      },
      filter: {
        'Entity/CaseFileId': this.$route.params.id,
      },
    };
  },

  computed: {
    canEdit(): boolean {
      return this.$hasLevel('level1');
    },

    caseFileReferrals(): ICaseFileReferralEntity[] {
      const referrals = this.$storage.caseFileReferral.getters.getByIds(this.caseFileReferralIds);
      return referrals.map((x) => x.entity);
    },

    refType() {
      return (item: ICaseFileReferralEntity) => {
        if (!item?.type?.optionItemId) return '';
        const opt = this.$storage.caseFileReferral.getters.types(false).find((x) => x.id === item.type.optionItemId);
        return opt ? this.$m(opt.name) : '';
      };
    },

    outcomeStatus() {
      return (item: ICaseFileReferralEntity) => {
        if (!item?.outcomeStatus?.optionItemId) return '';
        const opt = this.$storage.caseFileReferral.getters.outcomeStatuses(false).find((x) => x.id === item.outcomeStatus.optionItemId);
        return opt ? this.$m(opt.name) : '';
      };
    },

    customColumns(): Record<string, string> {
      return {
        name: 'Entity/Name',
        refType: `Metadata/ReferralTypeName/Translation/${this.$i18n.locale}`,
        outcomeStatus: `Metadata/ReferralOutcomeStatusName/Translation/${this.$i18n.locale}`,
        edit: 'edit',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('common.name') as string,
          sortable: true,
          value: this.customColumns.name,
        },
        {
          text: this.$t('caseFile.referral.referralType') as string,
          sortable: true,
          value: this.customColumns.refType,
        },
        {
          text: this.$t('caseFile.referral.outcomeStatus') as string,
          sortable: true,
          value: this.customColumns.outcomeStatus,
        },
        {
          text: '',
          sortable: false,
          value: this.customColumns.edit,
        },
      ];
    },

    labels(): Record<string, unknown> {
      return {
        header: {
          title: this.$t('caseFile.referral.title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },
  },

  async created() {
    await this.$storage.caseFileReferral.actions.fetchTypes();
    await this.$storage.caseFileReferral.actions.fetchOutcomeStatuses();
  },

  methods: {
    async fetchData(searchParams?: IAzureSearchParams) {
      searchParams.top = null;
      searchParams.skip = null;
      searchParams.filter = this.filter;
      const res = await this.$storage.caseFileReferral.actions.search(searchParams, searchEndpoints.CASE_REFERRALS);
      if (res) {
        this.caseFileReferralIds = res.ids;
      }
      return res;
    },

    addCaseReferral() {
      return '#';
      // this.$router.push({
      //   name: routes.caseFile.referrals.create.name,
      // });
    },

    getReferralDetailsRoute(item: ICaseFileReferralEntity) {
      return '#';
      // return {
      //   name: routes.caseFile.referrals.details.name,
      //   params: {
      //     id: item.id,
      //   },
      // };
    },

    getReferralEditRoute(item: ICaseFileReferralEntity) {
      return '#';
      // return {
      //   name: routes.caseFile.referrals.details.name,
      //   params: {
      //     id: item.id,
      //   },
      // };
    },
  },
});
</script>
