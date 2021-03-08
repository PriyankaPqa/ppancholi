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

      <template #item.teamName="{ item }">
        <span data-test="team_type">{{ item.teamName }}</span>
      </template>

      <template #item.teamType="{ item }">
        <span data-test="team_type">{{ ETeamType[item.teamType] }}</span>
      </template>

      <template #item.teamStatus="{ item }">
        <status-chip data-test="team_status" :status="item.teamStatus" status-name="ETeamStatus" />
      </template>

      <template #item.edit="{ item }">
        <v-btn icon height="24" class="mr-2" :data-test="`edit_team_${item.id}`" @click="goToEditTeam(item)">
          <v-icon size="24" color="grey darken-2">
            mdi-pencil
          </v-icon>
        </v-btn>
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
import { ETeamType, ETeamStatus, Team } from '@/entities/team';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { IAzureSearchParams } from '@/types';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';

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
      defaultSortBy: 'teamName',
      customColumns: ['teamName', 'teamType', 'teamStatus', 'edit'],
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
          value: 'teamName',
          width: '40%',
        },
        {
          text: this.$t('teams.teamtype') as string,
          value: 'teamType',
          sortable: false,
          width: '10%',
        },
        {
          text: this.$t('teams.table.related_events') as string,
          value: 'eventCount',
          sortable: true,
          width: '10%',
        },
        {
          text: this.$t('teams.primary_contact') as string,
          value: 'primaryContactDisplayName',
          sortable: true,
          width: '30%',
        },
        {
          text: this.$t('teams.team_members') as string,
          value: 'teamMemberCount',
          sortable: true,
          width: '10%',
        },
        {
          text: this.$t('teams.status') as string,
          value: 'teamStatus',
          sortable: false,
          width: '10%',
        },
        {
          text: '',
          value: 'edit',
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

    goToEditTeam(team: Team) {
      const teamType = team.teamType === ETeamType.Standard ? 'standard' : 'adhoc';
      const { id } = team;
      this.$router.push({ name: routes.teams.edit.name, params: { teamType, id } });
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
            TeamName: { or: [{ contains_az: params.search }, { startsWith_az: params.search }] },
            // add more props to search on if needed
          },
        ],
      };
    },
  },
});
</script>
