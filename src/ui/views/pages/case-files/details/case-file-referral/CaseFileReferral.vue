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
          :to="getReferralDetailsRoute(item.id)">
          {{ item.name }}
        </router-link>
      </template>

      <template #[`item.${customColumns.refType}`]="{ item }">
        {{ item.refType }}
      </template>

      <template #[`item.${customColumns.outcomeStatus}`]="{ item }">
        {{ item.outcomeStatus }}
      </template>

      <template v-if="canEdit" #[`item.${customColumns.edit}`]="{ item }">
        <v-btn icon :to="getReferralEditRoute(item.id)" data-test="editReferral-link">
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
import _orderBy from 'lodash/orderBy';
import {
  RcDataTable,
} from '@crctech/component-library';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { ICaseFileReferralEntity } from '@/entities/case-file-referral';
import { IAzureSearchParams } from '@/types';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers';

interface caseFileReferralsMapped {
  name: string;
  id: string;
  refType: string;
  outcomeStatus: string;
}

export default Vue.extend({
  name: 'CaseFileReferral',

  components: {
    RcDataTable,
  },

  mixins: [TablePaginationSearchMixin],

  data() {
    return {
      caseFileId: this.$route.params.id,
      options: {
        sortBy: ['name'],
        sortDesc: [false],
      },
      filter: '',
    };
  },

  computed: {
    canEdit(): boolean {
      return this.$hasLevel('level1');
    },

    caseFileReferralsMapped():caseFileReferralsMapped[] {
      const referralsByCaseFile = this.$storage.caseFileReferral.getters.getByCaseFile(this.caseFileId) || [];
      return referralsByCaseFile.map((x) => ({
        name: x.entity.name,
        id: x.entity.id,
        refType: this.getRefType(x.entity),
        outcomeStatus: this.getOutcomeStatus(x.entity),
      }));
    },

    // computeds are split here in 3 to get caseFileReferrals (caseFileReferralsByCaseFile, caseFileReferralsMapped, caseFileReferrals)
    // so that only what changed gets reevaluated (reordering doesnt go to store for example)
    caseFileReferrals(): caseFileReferralsMapped[] {
      let referrals = this.caseFileReferralsMapped;
      if (this.filter) {
        referrals = helpers.filterCollectionByValue(referrals, this.filter, false, Object.values(this.customColumns));
      }
      return _orderBy(referrals, this.options.sortBy[0], this.options.sortDesc[0] ? 'desc' : 'asc');
    },

    customColumns(): Record<string, string> {
      return {
        name: 'name',
        refType: 'refType',
        outcomeStatus: 'outcomeStatus',
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
    await this.$storage.caseFileReferral.actions.fetchAll({ caseFileId: this.caseFileId });
  },

  methods: {
    search(searchParams?: IAzureSearchParams) {
      this.filter = searchParams?.search;
    },

    getRefType(item: ICaseFileReferralEntity) {
      if (!item?.type?.optionItemId) return '';
      const opt = this.$storage.caseFileReferral.getters.types(false).find((x) => x.id === item.type.optionItemId);
      return opt ? this.$m(opt.name) : '';
    },

    getOutcomeStatus(item: ICaseFileReferralEntity) {
      if (!item?.outcomeStatus?.optionItemId) return '';
      const opt = this.$storage.caseFileReferral.getters.outcomeStatuses(false).find((x) => x.id === item.outcomeStatus.optionItemId);
      return opt ? this.$m(opt.name) : '';
    },

    addCaseReferral() {
      this.$router.push({
        name: routes.caseFile.referrals.add.name,
      });
    },

    getReferralDetailsRoute(id: string) {
      return {
        name: routes.caseFile.referrals.details.name,
        params: {
          referralId: id,
        },
      };
    },

    getReferralEditRoute(id: string) {
      return {
        name: routes.caseFile.referrals.edit.name,
        params: {
          referralId: id,
        },
      };
    },
  },
});
</script>
