<template>
  <div>
    <rc-data-table
      data-test="teams-table"
      :items="tableData"
      :count="itemsCount"
      :table-props="tableProps"
      :hide-footer="hideFooter"
      :labels="labels"
      :headers="headers"
      :footer-text="footerText"
      :custom-columns="Object.values(customColumns)"
      :options.sync="options"
      :initial-search="params && params.search"
      @search="search">
      <template #filter>
        <filter-toolbar
          :filter-key="FilterKey.Teams"
          :count="itemsCount"
          :filter-options="filters"
          :initial-filter="filterState"
          :sql-mode="true"
          add-filter-label="team.filter"
          @update:appliedFilter="onApplyFilter" />
      </template>
      <template v-if="$hasLevel(UserRoles.level5)" #headerLeft>
        <rc-add-button-with-menu
          :items="menuItems"
          data-test="create-team-button"
          :aria-label="$t('teams.add_team')"
          :add-button-label="$t('teams.add_team')"
          @click-item="goToCreateTeam($event)" />
      </template>

      <template #[`item.${customColumns.name}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold"
          :data-test="`team_link_${item.entity.id}`"
          :to="getTeamDetailsRoute(item.entity.id)">
          {{ item.entity.name }}
        </router-link>
      </template>

      <template #[`item.${customColumns.type}`]="{ item }">
        <span data-test="team_type">{{ $t(`enums.TeamType.${TeamType[item.entity.teamType]}`) }}</span>
      </template>

      <template #[`item.${customColumns.teamMemberCount}`]="{ item }">
        <span data-test="team_members">{{ item.entity.teamMembers.length }}</span>
      </template>

      <template #[`item.${customColumns.eventCount}`]="{ item }">
        <span data-test="team_events">{{ item.entity.eventIds.length }}</span>
      </template>

      <template #[`item.${customColumns.primaryContact}`]="{ item }">
        <span data-test="team_primary_contact">{{ getPrimaryName(item.entity) }}</span>
      </template>

      <template #[`item.${customColumns.status}`]="{ item }">
        <status-chip
          v-if="item.entity.status"
          data-test="team_status"
          :status="item.entity.status"
          status-name="Status" />
      </template>

      <template #[`item.${customColumns.edit}`]="{ item }">
        <v-btn v-if="$hasLevel(UserRoles.level4)" icon class="mr-2" :aria-label="$t('common.edit')" :data-test="`edit_team_${item.entity.id}`" @click="goToEditTeam(item)">
          <v-icon size="24" color="grey darken-2">
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import _throttle from 'lodash/throttle';
import {
  RcDataTable, RcAddButtonWithMenu,
} from '@libs/component-lib/components';
import { DataTableHeader } from 'vuetify';
import { EFilterType, IFilterSettings } from '@libs/component-lib/types/FilterTypes';
import mixins from 'vue-typed-mixins';
import routes from '@/constants/routes';
import {
  TeamType, ITeamCombined, ITeamEntity, IdParams,
} from '@libs/entities-lib/team';
import { FilterKey } from '@libs/entities-lib/user-account';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { IAzureSearchParams } from '@libs/shared-lib/types';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import helpers from '@/ui/helpers/helpers';
import { Status } from '@libs/entities-lib/base';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { useTeamStore } from '@/pinia/team/team';
import { UserRoles } from '@libs/entities-lib/user';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';

export default mixins(TablePaginationSearchMixin).extend({
  name: 'TeamsTable',

  components: {
    RcDataTable,
    RcAddButtonWithMenu,
    StatusChip,
    FilterToolbar,
  },

  props: {
    isOnHomepage: {
      type: Boolean,
      default: false,
    },
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
      FilterKey,
      TeamType,
      Status,
      UserRoles,
      options: {
        page: 1,
        sortBy: ['Entity/Name'],
        sortDesc: [false],
        ...this.limitResults ? { itemsPerPage: this.limitResults } : {}, // Add the property itemsPerPage only if limitResults is truthy
      },
      combinedTeamStore: new CombinedStoreFactory<ITeamEntity, null, IdParams>(useTeamStore()),
      sqlSearchMode: true,
    };
  },

  computed: {
    tableData(): ITeamCombined[] {
      return this.combinedTeamStore.getByIds(this.searchResultIds, { prependPinnedItems: true, baseDate: this.searchExecutionDate });
    },

    labels(): { header: { title: TranslateResult; searchPlaceholder: TranslateResult } } {
      const title = this.isOnHomepage ? `${this.$t('common.myTeams')} (${this.itemsCount})` : this.$t('teams.teams');
      return {
        header: {
          title,
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },

    customColumns(): Record<string, string> {
      return {
        name: 'Entity/Name',
        type: `Metadata/TeamType/Translation/${this.$i18n.locale}`,
        eventCount: 'Metadata/EventCount',
        primaryContact: 'Metadata/PrimaryContactDisplayName',
        teamMemberCount: 'Metadata/TeamMemberCount',
        status: `Metadata/TeamStatus/Translation/${this.$i18n.locale}`,
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
          text: this.$t('common.edit') as string,
          class: 'rc-transparent-text',
          value: this.customColumns.edit,
          width: '10%',
          sortable: false,
        },
      ];
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: useTeamStore().searchLoading,
        itemClass: (item: ITeamCombined) => (item.pinned ? 'pinned' : ''),
      };
    },

    filters(): Array<IFilterSettings> {
      return [
        {
          key: 'Entity/Name',
          type: EFilterType.Text,
          label: this.$t('teams.form.team_name') as string,
        },
        {
          key: 'Entity/TeamType',
          type: EFilterType.Select,
          label: this.$t('teams.team_type') as string,
          items: helpers.getEnumKeysAndText(TeamType, 'enums.teamType'),
        },
        {
          key: 'Entity/Status',
          type: EFilterType.Select,
          label: this.$t('teams.status') as string,
          items: helpers.getEnumKeysAndText(Status, 'enums.teamStatus'),
        },
      ];
    },
  },

  created() {
    this.saveState = true;
    this.loadState();
  },
  watch: {
    tableData() {
      this.fetchPrimaryUsers();
    },
  },

  methods: {
    fetchPrimaryUsers: _throttle(async function func(this: { tableData: ITeamCombined[] }) {
      useUserAccountMetadataStore().fetchByIds(this.tableData.map((x) => x.entity.teamMembers.find((t) => t.isPrimaryContact)?.id), true);
    }, 100),

    getPrimaryName(item: ITeamEntity) {
      return useUserAccountMetadataStore().getById(item.teamMembers.find((t) => t.isPrimaryContact)?.id)?.displayName;
    },

    goToCreateTeam(item: Record<string, string>) {
      const teamType = item.value;
      this.$router.push({ name: routes.teams.create.name, params: { teamType } });
    },

    goToEditTeam(team: ITeamCombined) {
      const teamType = team.entity.teamType === TeamType.Standard ? 'standard' : 'adhoc';
      this.$router.push({ name: routes.teams.edit.name, params: { teamType, id: team.entity.id, from: this.$route.name } });
    },

    async fetchData(params: IAzureSearchParams) {
      const res = await this.combinedTeamStore.search({
        filter: params.filter,
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      }, null, true, true, { manageableTeamsOnly: true });
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

    getTableName():string {
      return 'teams';
    },
  },
});
</script>
