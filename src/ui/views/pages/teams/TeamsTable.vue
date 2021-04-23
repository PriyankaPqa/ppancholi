<template>
  <div>
    <rc-data-table
      data-test="teams-table"
      :items="azureSearchItems"
      :table-props="tableProps"
      :count="azureSearchCount"
      :labels="labels"
      :headers="headers"
      :custom-columns="Object.values(customColumns)"
      :options.sync="options"
      @search="search">
      <template #filter>
        <filter-toolbar
          :filter-key="EFilterKey.Teams"
          :count="azureSearchCount"
          :filter-options="filters"
          @update:appliedFilter="onApplyFilter" />
      </template>
      <template v-if="$hasLevel('level5')" #headerLeft>
        <rc-add-button-with-menu :items="menuItems" data-test="create-team-button" @click-item="goToCreateTeam($event)" />
      </template>

      <template #[`item.${customColumns.name}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold"
          :data-test="`team_link_${item.teamId}`"
          :to="getTeamDetailsRoute(item.teamId)">
          {{ item.teamName }}
        </router-link>
      </template>

      <template #[`item.${customColumns.type}`]="{ item }">
        <span data-test="team_type"> {{ $m(item.teamTypeName) }}</span>
      </template>

      <template #[`item.${customColumns.teamMemberCount}`]="{ item }">
        <span data-test="team_members">{{ item.teamMemberCount }}</span>
      </template>

      <template #[`item.${customColumns.eventCount}`]="{ item }">
        <span data-test="team_events">{{ item.eventCount }}</span>
      </template>

      <template #[`item.${customColumns.primaryContact}`]="{ item }">
        <span data-test="team_primary_contact">{{ item.primaryContactDisplayName }}</span>
      </template>

      <template #[`item.${customColumns.status}`]="{ item }">
        <status-chip
          v-if="item.teamStatus"
          data-test="team_status"
          :text="$m(item.teamStatusName)"
          :status="item.teamStatus"
          status-name="ETeamStatus" />
      </template>

      <template #[`item.${customColumns.edit}`]="{ item }">
        <v-btn icon class="mr-2" :data-test="`edit_team_${item.teamId}`" @click="goToEditTeam(item)">
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
import {
  RcDataTable, RcAddButtonWithMenu, IFilterSettings,
} from '@crctech/component-library';
import routes from '@/constants/routes';
import { DataTableHeader } from 'vuetify';
import {
  ETeamType, ETeamStatus, ITeamSearchData,
} from '@/entities/team';
import { EFilterKey } from '@/entities/user';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { IAzureSearchParams } from '@/types';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { EFilterType } from '@crctech/component-library/src/types/FilterTypes';
import helpers from '@/ui/helpers';

export default Vue.extend({
  name: 'TeamsTable',

  components: {
    RcDataTable,
    RcAddButtonWithMenu,
    StatusChip,
    FilterToolbar,
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
      EFilterKey,
      ETeamType,
      ETeamStatus,
      options: {
        page: 1,
        sortBy: ['TeamName'],
        sortDesc: [false],
      },
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

    customColumns(): Record<string, string> {
      return {
        name: 'TeamName',
        type: `TeamTypeName/Translation/${this.$i18n.locale}`,
        eventCount: 'EventCount',
        primaryContact: 'PrimaryContactDisplayName',
        teamMemberCount: 'TeamMemberCount',
        status: `TeamStatusName/Translation/${this.$i18n.locale}`,
        edit: 'edit',
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
          value: this.customColumns.name,
          width: '40%',
        },
        {
          text: this.$t('teams.teamtype') as string,
          value: this.customColumns.type,
          sortable: true,
          width: '10%',
        },
        {
          text: this.$t('teams.table.related_events') as string,
          value: this.customColumns.eventCount,
          sortable: true,
          width: '10%',
        },
        {
          text: this.$t('teams.primary_contact') as string,
          value: this.customColumns.primaryContact,
          sortable: true,
          width: '30%',
        },
        {
          text: this.$t('teams.team_members') as string,
          value: this.customColumns.teamMemberCount,
          sortable: true,
          width: '10%',
        },
        {
          text: this.$t('teams.status') as string,
          value: this.customColumns.status,
          sortable: true,
          width: '10%',
        },
        {
          text: '',
          value: this.customColumns.edit,
          width: '10%',
          sortable: false,
        },
      ];
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: this.$store.state.team.searchLoading,
      };
    },

    filters(): Array<IFilterSettings> {
      return [
        {
          key: 'TeamName',
          type: EFilterType.Text,
          label: this.$t('teams.form.team_name') as string,
        },
        {
          key: 'TeamType',
          type: EFilterType.Select,
          label: this.$t('teams.team_type') as string,
          items: helpers.enumToTranslatedCollection(ETeamType, 'enums.teamType'),
        },
        {
          key: 'TeamStatus',
          type: EFilterType.Select,
          label: this.$t('teams.status') as string,
          items: helpers.enumToTranslatedCollection(ETeamStatus, 'enums.teamStatus'),
        },
      ];
    },
  },

  methods: {
    goToCreateTeam(item: Record<string, string>) {
      const teamType = item.value;
      this.$router.push({ name: routes.teams.create.name, params: { teamType } });
    },

    goToEditTeam(team: ITeamSearchData) {
      const teamType = team.teamType === ETeamType.Standard ? 'standard' : 'adhoc';
      const id = team.teamId;
      this.$router.push({ name: routes.teams.edit.name, params: { teamType, id, from: this.$route.name } });
    },

    async fetchData(params: IAzureSearchParams) {
      const res = await this.$storage.team.actions.searchTeams({
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

    getTeamDetailsRoute(id: string) {
      return {
        name: routes.teams.details.name,
        params: {
          id,
        },
      };
    },
  },
});
</script>
