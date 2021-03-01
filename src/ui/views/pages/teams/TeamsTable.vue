<template>
  <div>
    <rc-data-table
      data-test="teams-table"
      :items="azureSearchItems"
      :table-props="tableProps"
      :count="azureSearchCount"
      :labels="labels"
      :headers="headers"
      :sort-by="defaultSortBy"
      :custom-columns="customColumns"
      @search="search">
      <template v-if="$hasLevel('level5')" #headerLeft>
        <rc-add-button-with-menu :items="menuItems" data-test="create-team-button" @click-item="goToCreateTeam($event)" />
      </template>

      <template #item.Name="{ item }">
        <span data-test="team_type">{{ item.name }}</span>
      </template>

      <template #item.type="{ item }">
        <span data-test="team_type">{{ ETeamType[item.teamType] }}</span>
      </template>

      <template #item.members="{ item }">
        <span data-test="team_members">{{ item.teamMembers.length }}</span>
      </template>

      <template #item.events="{ item }">
        <span data-test="team_events">{{ item.eventIds.length }}</span>
      </template>

      <template #item.primaryContact="{ item }">
        <span data-test="team_primary_contact">{{ item.getPrimaryContact().id }}</span>
      </template>

      <template #item.status="{ item }">
        <status-chip data-test="team_status" :status="item.status" status-name="ETeamStatus" />
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { RcDataTable, RcAddButtonWithMenu, ISearchData } from '@crctech/component-library';
import routes from '@/constants/routes';
import { DataTableHeader } from 'vuetify';
import { ETeamType, ETeamStatus } from '@/entities/team';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { IAzureSearchParams } from '@/types';
import TablePaginationSearchMixin from '@/ui/mixins/table-pagination-search';

export default Vue.extend({
  name: 'TeamsTable',

  components: {
    RcDataTable,
    RcAddButtonWithMenu,
    StatusChip,
  },
  mixins: [TablePaginationSearchMixin],

  props: {
    title: {
      type: String,
      default: 'teams.teams',
    },
  },

  data() {
    return {
      ETeamType,
      ETeamStatus,
      defaultSortBy: 'Name',
      customColumns: ['Name', 'type', 'members', 'events', 'primaryContact', 'status'],
    };
  },

  computed: {
    labels(): { header: { title: TranslateResult; searchPlaceholder: TranslateResult } } {
      return {
        header: {
          title: this.$t(this.title),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },

    menuItems(): Array<Record<string, string>> {
      return [{
        text: this.$t('teams.types.create_standard') as string,
        value: 'standard',
        icon: 'mdi-account-multiple',
        dataTest: 'create-standard-team-link',
      }, {
        text: this.$t('teams.types.create_adhoc') as string,
        value: 'adhoc',
        icon: 'mdi-account-multiple-outline',
        dataTest: 'create-adhoc-team-link',
      }];
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('teams.team_name') as string,
          sortable: true,
          value: 'Name',
          width: '40%',
        },
        {
          text: this.$t('teams.teamtype') as string,
          value: 'type',
          sortable: false,
          width: '10%',
        },
        {
          text: this.$t('teams.table.related_events') as string,
          value: 'events',
          sortable: false,
          width: '10%',
        },
        {
          text: this.$t('teams.primary_contact') as string,
          value: 'primaryContact',
          sortable: false,
          width: '30%',
        },
        {
          text: this.$t('teams.team_members') as string,
          value: 'members',
          sortable: false,
          width: '10%',
        },
        {
          text: this.$t('teams.status') as string,
          value: 'status',
          sortable: false,
          width: '10%',
        },
      ];
    },

    tableProps() {
      return {
        loading: this.$store.state.team.searchLoading,
      };
    },
  },

  methods: {
    goToCreateTeam(item: Record<string, string>) {
      const teamType = item.value;
      this.$router.push({ name: routes.teams.create.name, params: { teamType } });
    },

    async fetchData(params: IAzureSearchParams) {
      const res = await this.$storage.team.actions.searchTeams({
        filter: params.filter,
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
      });
      return res;
    },

    getFilterParams(params: ISearchData) {
      return {
        or: [
          {
            Name: { or: [{ contains_az: params.search }, { startsWith_az: params.search }] },
            // add more props to search on if needed
          },
        ],
      };
    },
  },
});
</script>
