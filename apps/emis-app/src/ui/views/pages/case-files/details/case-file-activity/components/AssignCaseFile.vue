<template>
  <rc-dialog
    :title="$t('caseFile.assignCaseFile')"
    :submit-action-label="$t('common.buttons.confirm')"
    :cancel-action-label="$t('common.buttons.cancel')"
    :submit-button-disabled="false"
    :show.sync="show"
    content-padding="6"
    content-only-scrolling
    fullscreen
    persistent
    show-close
    :show-help="false"
    :help-link="$t('zendesk.help_link.assign_case_file')"
    :tooltip-label="$t('common.tooltip_label')"
    :loading="submitLoading"
    :init-loading="initLoading"
    @close="close"
    @cancel="close"
    @submit="submit">
    <rc-page-loading v-if="initLoading" />
    <v-row v-else>
      <v-col cols="12" md="3" class="px-6 py-0 my-4 d-flex flex-column border-right ">
        <span class="rc-body16 fw-bold pb-4">{{ $t('caseFile.assign.select_team') }}</span>
        <v-sheet rounded outlined height="100%">
          <v-list-item-group v-model="currentTeam" active-class="team-selected" data-test="all-teams-list" role="list">
            <v-list-item
              v-for="team in allTeams"
              :key="team.id"
              class="team-list-item"
              role="listitem"
              :ripple="false"
              :value="team"
              :data-test="`team-list-item-${team.id}`">
              <v-row class="team-list-item-content py-2">
                <v-col cols="8">
                  <div class="rc-body14 fw-bold primary--text text--darken-1">
                    {{ team.name }} ({{ team.activeMemberCount }})
                  </div>
                  <div class="rc-body12">
                    {{ $t('caseFile.assign.team_type') }} : {{ $t(`enums.TeamType.${TeamType[team.teamType]}`) }}
                  </div>
                </v-col>
                <v-col cols="4">
                  <v-btn color="primary" style="pointer-events: all" :disabled="isTeamAssigned(team)" small @click.stop="assignTeam(team)">
                    {{ isTeamAssigned(team) ? $t('caseFile.assign.assigned') : $t('caseFile.assign.assign') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list-item-group>
        </v-sheet>
      </v-col>

      <v-col cols="12" md="5" class="px-6 my-2 d-flex flex-column border-right">
        <span class="rc-body16 fw-bold pb-4">{{ $t('caseFile.assign.select_individual') }}</span>
        <v-text-field
          :value="searchTerm"
          class="flex-grow-0"
          dense
          clearable
          outlined
          :disabled="!currentTeam"
          prepend-inner-icon="mdi-magnify"
          data-test="individual-search-input"
          :placeholder="$t('caseFile.quickUserSearch')"
          @click:clear="onSearchTermInput('')"
          @input="onSearchTermInput" />

        <rc-data-table
          v-if="currentTeam"
          data-test="individuals-table"
          class="flex-grow-1 scrollable individuals-table"
          :headers="headers"
          hide-header
          :table-props="tableProps"
          :count="itemsCount"
          must-sort
          :options.sync="options"

          :initial-search="params && params.search"
          :custom-columns="Object.values(customColumns)"
          :item-class="(item)=> isUserDisabled(item) ? 'disabled' : isUserSelected(item) ? 'disabled row_active' : ''"
          :has-border="false"
          :items="tableData"
          @search="search">
          <template #[`item.${customColumns.displayName}`]="{ item }">
            {{ item.metadata.displayName }}
          </template>
          <template #[`item.${customColumns.role}`]="{ item }">
            {{ $m(item.metadata.roleName) }}
          </template>
          <template #[`item.${customColumns.assign}`]="{ item }">
            <v-simple-checkbox
              :data-test="`select_${item.entity.id}`"
              :ripple="false"
              :class="{ disabled: isUserSelected(item) }"
              :value="isUserDisabled(item) ? false : isUserSelected(item)"
              :disabled="isUserDisabled(item)"
              @input="onSelectIndividuals({ item, value: $event })" />
          </template>
        </rc-data-table>

        <div v-if="!currentTeam" class="d-flex justify-center">
          {{ $t('caseFile.assign.no_data_table') }}
        </div>
      </v-col>

      <v-col cols="12" md="4" class="px-6 d-flex flex-column">
        <assigned-list
          :assigned-individuals="orderedAssignedMembers"
          :assigned-teams="assignedTeams"
          @removeTeam="removeTeam"
          @removeIndividual="unAssignIndividual" />
      </v-col>
    </v-row>
  </rc-dialog>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import _cloneDeep from 'lodash/cloneDeep';
import _orderBy from 'lodash/orderBy';
import _flatten from 'lodash/flatten';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { RcDialog, RcPageLoading, RcDataTable } from '@libs/component-lib/components';
import { DataTableHeader } from 'vuetify';
import { TeamType, ITeamEntity } from '@libs/entities-lib/team';
import { ICaseFileEntity, IAssignedTeamMembers } from '@libs/entities-lib/case-file';
import {
  AccountStatus, IdParams, IUserAccountCombined, IUserAccountEntity, IUserAccountMetadata,
} from '@libs/entities-lib/user-account';
import { Status } from '@libs/entities-lib/base';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { IAzureSearchParams, IAzureTableSearchResults } from '@libs/shared-lib/types';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';
import { useTeamStore } from '@/pinia/team/team';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import helpers from '@libs/shared-lib/helpers/helpers';
import AssignedList from './AssignedList.vue';

interface TeamWithCount extends ITeamEntity {
  activeMemberCount: number;
}

interface IIndividual extends IUserAccountCombined {
  assignedTeamId: string;
  assignedTeamName: string;
}

export default mixins(TablePaginationSearchMixin).extend({
  name: 'AssignCaseFile',

  components: {
    RcDialog,
    AssignedList,
    RcPageLoading,
    RcDataTable,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    caseFile: {
      type: Object as () => ICaseFileEntity,
      required: true,
    },
  },

  data() {
    return {
      TeamType,
      FeatureKeys,
      assignedTeams: [] as TeamWithCount[],
      backupAssignedTeams: [] as TeamWithCount[],
      assignedIndividuals: [] as IIndividual[],
      backupAssignedIndividuals: [] as IIndividual[],
      allTeams: [] as TeamWithCount[],
      loading: false,
      initLoading: false,
      submitLoading: false,
      currentTeam: null as TeamWithCount,
      options: {
        page: 1,
        sortBy: ['Metadata/DisplayName'],
        sortDesc: [false],
      },
      combinedUserAccountStore: new CombinedStoreFactory<IUserAccountEntity, IUserAccountMetadata, IdParams>(useUserAccountStore(), useUserAccountMetadataStore()),
    };
  },

  computed: {
    customColumns(): Record<string, string> {
      return {
        displayName: 'Metadata/DisplayName',
        role: `Metadata/RoleName/Translation/${this.$i18n.locale}`,
        assign: 'assign',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('teams.member_name') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: this.customColumns.displayName,
        },
        {
          text: this.$t('teams.member_role') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: this.customColumns.role,
        },
        {
          text: this.$t('caseFile.assign.assign') as string,
          class: 'team_member_header',
          sortable: false,
          value: this.customColumns.assign,
        },
      ];
    },

    tableData(): IUserAccountCombined[] {
      return this.combinedUserAccountStore.getByIds(this.searchResultIds);
    },

    orderedAssignedMembers(): IIndividual[] {
      return _orderBy(this.assignedIndividuals, ['assignedTeamName', 'metadata.displayName']);
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: this.loading,
      };
    },
  },

  watch: {
    'currentTeam.id': {
      handler(currentTeamId: string) {
        if (currentTeamId) {
          if (this.params) {
            this.goToFirstPage();
            this.search(this.params);
          }
        }
      },
    },
  },

  async created() {
    try {
      this.initLoading = true;
      await this.getTeamsData();
      await Promise.all([
        this.initialLoadTeamMembers(),
        this.setAssignedIndividuals(),
      ]);
      this.setAssignedTeams();
    } finally {
      this.initLoading = false;
    }
    this.backupState();
  },

  methods: {
    close() {
      this.resetState();
      this.$emit('update:show', false);
    },

    async getTeamsData() {
      const { eventId } = this.caseFile;
      const teams: ITeamEntity[] = await useTeamStore().getTeamsAssignable(eventId);

      this.allTeams = (_cloneDeep(teams.filter((t:ITeamEntity) => t.status === Status.Active)))
        .map((x) => ({ ...x, activeMemberCount: 0 }));
    },

    async initialLoadTeamMembers() {
      const promises = [] as Array<Promise<void>>;
      this.allTeams.forEach(async (team) => {
        promises.push(this.fetchTeamMembersCount(team));
      });

      await Promise.all(promises);
    },

    async fetchTeamMembersCount(team: TeamWithCount) {
      const res = await this.fetchUserAccounts(team.id, {}, true);

      if (res) {
        team.activeMemberCount = res.count;
      }
    },

    async fetchData(params: IAzureSearchParams) {
      return this.fetchUserAccounts(this.currentTeam.id, params);
    },

    async fetchUserAccounts(teamId: string, params: IAzureSearchParams, initialLoad = false): Promise<IAzureTableSearchResults> {
      this.loading = true;
      const filter: { Metadata: unknown, } = {
        Metadata: {
          Teams: {
            any: {
              TeamId: teamId,
            },
          },
        },
      };

      let callParams: IAzureSearchParams = {
        filter,
        top: 1,
        skip: 0,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      };

      if (!initialLoad) {
        const search = this.searchTerm ? `Metadata/DisplayName:/.*${this.searchTerm}.*/ OR Metadata/DisplayName:"\\"${this.searchTerm}\\""` : '';
        callParams = {
          ...callParams,
          filter,
          search,
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
        };
      }

      const res = await this.combinedUserAccountStore.search(callParams);

      this.loading = false;
      return res;
    },

    async setAssignedIndividuals() {
      const assignedUserAccounts = await this.fetchAssignedIndividualsData();

      if (assignedUserAccounts?.length) {
        this.caseFile.assignedTeamMembers.forEach((assignedIndividuals) => {
          const teamId = assignedIndividuals.teamId;
          const teamName = this.allTeams.find((t) => t.id === teamId)?.name || '';

          assignedIndividuals.teamMembersIds.forEach((id) => {
            const assignedIndividual = assignedUserAccounts.find((m:IUserAccountCombined) => m.entity.id === id);
            if (assignedIndividual && assignedIndividual.entity.accountStatus === AccountStatus.Active) {
              this.assignedIndividuals.push({
                ...assignedIndividual,
                assignedTeamId: teamId,
                assignedTeamName: teamName,
              });
            }
          });
        });
      }
    },

    async fetchAssignedIndividualsData(): Promise<IUserAccountCombined[]> {
      const assignedIndividualIds = _flatten(this.caseFile.assignedTeamMembers.map((m) => m.teamMembersIds));

      const fetchedAssignedUserAccountData = await helpers.callSearchInInBatches({
        service: this.combinedUserAccountStore,
        ids: assignedIndividualIds,
        searchInFilter: { Entity: { Id: { searchIn_az: '{ids}' } } },
        otherOptions: { queryType: 'full',
          searchMode: 'all' },
      });

      const ids = (fetchedAssignedUserAccountData as IAzureTableSearchResults)?.ids;
      if (ids) {
        return this.combinedUserAccountStore.getByIds(ids);
      }
      return [];
    },

    setAssignedTeams() {
      this.caseFile.assignedTeamIds.forEach((id) => {
        const assignedTeam = this.allTeams.find((t:TeamWithCount) => t.id === id);
        if (assignedTeam) {
          this.assignTeam(assignedTeam);
        }
      });
    },

    isTeamAssigned(team: TeamWithCount): boolean {
      return this.assignedTeams.findIndex((t) => t.id === team.id) !== -1;
    },

    isUserSelected(user: IUserAccountCombined): boolean {
      const assignedUser = this.assignedIndividuals.find((i) => i.entity.id === user.entity.id);
      if (assignedUser) {
        return assignedUser.assignedTeamId === this.currentTeam.id;
      }
      return false;
    },

    isUserDisabled(user: IUserAccountCombined): boolean {
      const assignedUser = this.assignedIndividuals.find((i) => i.entity.id === user.entity.id);
      if (assignedUser) {
        return assignedUser.assignedTeamId !== this.currentTeam.id;
      }
      return false;
    },

    prepareTeamMembersPayload(users: IIndividual[]): IAssignedTeamMembers[] {
      const individualsPayload = [] as IAssignedTeamMembers[];

      users.forEach((u) => {
        const team = individualsPayload.find((x) => x.teamId === u.assignedTeamId);
        if (!team) {
          individualsPayload.push({ teamId: u.assignedTeamId, teamMembersIds: [u.entity.id] });
        } else {
          team.teamMembersIds.push(u.entity.id);
        }
      });

      return individualsPayload;
    },

    async submit() {
      try {
        this.submitLoading = true;

        const assignedTeamsPayload = this.assignedTeams.map((t) => t.id);
        const assignedTeamMembersPayload = this.prepareTeamMembersPayload(this.assignedIndividuals);
        await useCaseFileStore().assignCaseFile({
          id: this.caseFile.id,
          teamMembers: assignedTeamMembersPayload,
          teams: assignedTeamsPayload,
        });
        this.$emit('updateAssignmentsInfo', { teams: this.assignedTeams, individuals: this.assignedIndividuals });
      } finally {
        this.submitLoading = false;
        this.$emit('update:show', false);
      }
    },

    assignTeam(team: TeamWithCount) {
      this.assignedTeams.push(team);
    },

    removeTeam(team: { name: string, id: string, type: string }) {
      this.assignedTeams = this.assignedTeams.filter((t) => t.id !== team.id);
    },

    assignIndividual(item: IIndividual) {
      if (!this.isUserDisabled(item)) {
        this.assignedIndividuals.push({

          ...item,
          assignedTeamId: this.currentTeam.id,
          assignedTeamName: this.currentTeam.name,
        });
      }
    },

    unAssignIndividual(item: IIndividual) {
      // Remove the individual from list of assigned
      this.assignedIndividuals = this.assignedIndividuals.filter((i) => i.entity.id !== item.entity.id);
    },

    onSelectIndividuals({ item, value }: { item: IIndividual, value: boolean }) {
      if (value) { // Selected
        this.assignIndividual(item);
      } else { // Unselected
        this.unAssignIndividual(item);
      }
    },

    backupState() {
      this.backupAssignedTeams = _cloneDeep(this.assignedTeams);
      this.backupAssignedIndividuals = _cloneDeep(this.assignedIndividuals);
    },

    resetState() {
      this.searchTerm = '';
      this.assignedTeams = _cloneDeep(this.backupAssignedTeams);
      this.assignedIndividuals = _cloneDeep(this.backupAssignedIndividuals);
    },
  },
});

</script>

<style scoped lang='scss'>

.individuals-table ::v-deep .v-data-table__wrapper  {
  & .disabled {
    pointer-events: none;
    color: var(--v-grey-lighten2);
  }

  & .row_active {
    color: black;
  }

  .row_active .disabled .v-icon {
   color: var(--v-grey-lighten2) !important;
  }

}

.team-list-item {
  border-bottom: 1px solid var(--v-grey-lighten2);
}

.team-list-item-content {
  display:flex;
  align-items: center;
  & > div:nth-child(2) {
    justify-content: flex-end;
    display: flex;
  }
}

.assigned-list-item {
 min-height: 36px;
}

.scrollable {
  height: 100px;
  overflow-y: auto;
}

.team-selected {
  background-color: var(--v-primary-lighten2);

  &:before {
    display: none;
  }
}

@media (min-width: $breakpoint-md-min)  {

  .border-right {
    border-right:  1px solid var(--v-grey-lighten2);
  }
}
</style>
