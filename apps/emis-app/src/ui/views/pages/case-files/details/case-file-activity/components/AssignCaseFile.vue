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
    :loading="loading"
    :init-loading="initLoading"
    @close="close"
    @cancel="close"
    @submit="submit">
    <rc-page-loading v-if="initLoading" />
    <v-row v-else>
      <v-col cols="12" md="4" class="px-6 py-0 my-4 d-flex flex-column border-right ">
        <span class="rc-body16 fw-bold pb-4">{{ $t('caseFile.assign.select_team') }}</span>
        <v-sheet rounded outlined height="100%">
          <v-list-item-group v-model="currentTeam" active-class="team-selected" data-test="all-teams-list">
            <v-list-item
              v-for="team in allTeams"
              :key="team.id"
              class="team-list-item"
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

      <v-col cols="12" md="4" class="px-6 d-flex flex-column">
        <span class="rc-body16 fw-bold pb-4">{{ $t('caseFile.assign.select_individual') }}</span>
        <v-text-field
          v-model="searchTerm"
          class="flex-grow-0"
          dense
          clearable
          outlined
          prepend-inner-icon="mdi-magnify"
          data-test="individual-search-input"
          :placeholder="$t('caseFile.quickUserSearch')" />

        <v-data-table
          :value="assignedIndividuals"
          data-test="individuals-table"
          class="flex-grow-1 scrollable individuals-table"
          :headers="headers"
          hide-default-footer
          must-sort
          :no-data-text="$t('caseFile.assign.no_data_table')"
          item-key="itemKey"
          :options="{ sortBy: ['displayName'], sortDesc: [false] }"
          :item-class="(item)=> item.disabled ? 'disabled' : isUserSelected(item) ? 'disabled row_active' : ''"
          :items="displayedIndividuals"
          :items-per-page="Math.max(allIndividuals.length, 1)"
          @update:sort-by="sortBy = $event"
          @update:sort-desc="sortDesc = $event">
          <template #[`item.displayName`]="{ item }">
            {{ item.displayName }}
          </template>
          <template #[`item.assign`]="{ item }">
            <v-simple-checkbox
              :data-test="`select_${item.id}`"
              :ripple="false"
              :class="{ disabled: isUserSelected(item) }"
              :value="item.disabled ? false : isUserSelected(item)"
              :disabled="item.disabled"
              @input="onSelectIndividuals({ item, value: $event })" />
          </template>
        </v-data-table>
      </v-col>

      <v-col cols="12" md="4" class="px-6 d-flex flex-column">
        <assigned-list
          :assigned-individuals="assignedIndividuals"
          :assigned-teams="assignedTeams"
          @removeTeam="removeTeam"
          @removeIndividual="unAssignIndividual" />
      </v-col>
    </v-row>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { RcDialog, RcPageLoading } from '@libs/component-lib/components';
import { DataTableHeader } from 'vuetify';
import { TeamType, ITeamEntity, ITeamMember } from '@libs/entities-lib/team';
import { ICaseFileEntity, IAssignedTeamMembers } from '@libs/entities-lib/case-file';
import helpers from '@/ui/helpers/helpers';
import { AccountStatus, IUserAccountCombined } from '@libs/entities-lib/user-account';
import { Status } from '@libs/entities-lib/base';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import AssignedList from './AssignedList.vue';

interface TeamWithCount extends ITeamEntity {
  activeMemberCount: number;
}

interface IIndividual extends ITeamMember, IUserAccountCombined {
  translatedRoleName?: string;
  displayName: string;
  teamName: string;
  teamId: string;
  itemKey: string;
  disabled: boolean;
}

export default Vue.extend({
  name: 'AssignCaseFile',

  components: {
    RcDialog,
    AssignedList,
    RcPageLoading,
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
      searchTerm: '',
      allTeams: [] as TeamWithCount[],
      allIndividuals: [] as IIndividual[],
      loading: false,
      initLoading: false,
      currentTeam: null as TeamWithCount,
    };
  },

  computed: {
    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('teams.member_name') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: 'displayName',
        },
        {
          text: this.$t('teams.member_role') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: true,
          value: 'translatedRoleName',
        },
        {
          text: this.$t('caseFile.assign.assign') as string,
          class: 'team_member_header',
          value: 'assign',
        },
      ];
    },

    displayedIndividuals(): IIndividual[] {
      return helpers.filterCollectionByValue(this.currentTeamMembers, this.searchTerm || '', true);
    },

    currentTeamMembers(): IIndividual[] {
      if (this.currentTeam) {
        return this.allIndividuals.filter((i) => i.teamId === this.currentTeam.id);
      }
      return [];
    },

  },

  watch: {
    'currentTeam.id': {
      handler(currentTeamId: string) {
        if (currentTeamId) {
          this.updateDisabledUsers(currentTeamId);
        }
      },
    },
  },

  async created() {
    try {
      this.initLoading = true;
      await this.getTeamsData();
      await this.loadAllUsers();
    } finally {
      this.initLoading = false;
    }

    this.setAllIndividuals();
    this.setAssignedTeams();
    this.setAssignedIndividuals();
    this.saveState();
  },

  methods: {
    close() {
      this.resetState();
      this.$emit('update:show', false);
    },

    async getTeamsData() {
      const { eventId } = this.caseFile;
      const teams: ITeamEntity[] = await this.$storage.team.actions.getTeamsAssignable(eventId);

      this.allTeams = (_cloneDeep(teams.filter((t:ITeamEntity) => t.status === Status.Active)))
        .map((x) => ({ ...x, activeMemberCount: 0 }));
    },

    async loadAllUsers() {
      await this.$storage.userAccount.actions.fetchAllIncludingInactive();
    },

    setAllIndividuals() {
      const allIndividuals = [] as IIndividual[];

      const users = this.$storage.userAccount.getters.getAll();

      this.allTeams.forEach((t) => {
        t.teamMembers.forEach((member :ITeamMember) => {
          const userMember = users.find((u) => u.entity.id === member.id);
          if (userMember?.entity?.accountStatus === AccountStatus.Active) {
            t.activeMemberCount += 1;

            allIndividuals.push({
              ...member,
              ...userMember,
              displayName: userMember.metadata.displayName,
              translatedRoleName: userMember.metadata.roleName.translation[this.$i18n.locale],
              teamName: t.name,
              teamId: t.id,
              itemKey: `${member.id}_team_${t.name}`,
              disabled: false,
            });
          }
        });
      });

      this.allIndividuals = allIndividuals;
    },

    setAssignedIndividuals() {
      this.caseFile.assignedTeamMembers.forEach((assignedIndividuals) => {
        const teamId = assignedIndividuals.teamId;
        const teamName = this.allTeams.find((t) => t.id === teamId)?.name;

        assignedIndividuals.teamMembersIds.forEach((id) => {
          const assignedIndividual = this.allIndividuals.find((m:IIndividual) => m.entity.id === id);
          if (assignedIndividual && assignedIndividual.entity.accountStatus === AccountStatus.Active) {
            this.assignedIndividuals.push({
              ...assignedIndividual,
              teamId,
              teamName,
            });
          }
        });
      });
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

    isUserSelected(user: IIndividual): boolean {
      return this.assignedIndividuals.findIndex((u) => user.id === u.id) !== -1;
    },

    removeIndividual(individual: IIndividual) {
      this.assignedIndividuals = this.assignedIndividuals.filter((i) => i.id !== individual.id);
    },

    removeTeam(team: { name: string, id: string, type: string }) {
      this.assignedTeams = this.assignedTeams.filter((t) => t.id !== team.id);
    },

    prepareTeamMembersPayload(users: IIndividual[]): IAssignedTeamMembers[] {
      const individualsPayload = [] as IAssignedTeamMembers[];

      users.forEach((u) => {
        const team = individualsPayload.find((x) => x.teamId === u.teamId);
        if (!team) {
          individualsPayload.push({ teamId: u.teamId, teamMembersIds: [u.id] });
        } else {
          team.teamMembersIds.push(u.id);
        }
      });

      return individualsPayload;
    },

    async submit() {
      try {
        this.loading = true;

        const assignedTeamsPayload = this.assignedTeams.map((t) => t.id);
        const assignedTeamMembersPayload = this.prepareTeamMembersPayload(this.assignedIndividuals);
        await this.$storage.caseFile.actions.assignCaseFile(this.caseFile.id, assignedTeamMembersPayload, assignedTeamsPayload);
        this.$emit('updateAssignmentsInfo', { teams: this.assignedTeams, individuals: this.assignedIndividuals });
      } finally {
        this.loading = false;
        this.$emit('update:show', false);
      }
    },

    assignTeam(team: TeamWithCount) {
      this.assignedTeams.push(team);
    },

    assignIndividual(item: IIndividual) {
      if (!item.disabled) {
        this.assignedIndividuals.push(item);
        this.allIndividuals
          .filter((i) => i.id === item.id && i.teamId !== this.currentTeam.id)
          .forEach((i) => {
            i.disabled = true;
          });
      }
    },

    unAssignIndividual(item: IIndividual) {
      // Remove the individual from list of assigned
      this.assignedIndividuals = this.assignedIndividuals.filter((i) => i.id !== item.id);

      // Look for the same individual in all teams
      this.allIndividuals
        .filter((individual) => individual.id === item.id)
        .forEach((individual) => {
          individual.disabled = false;
        });
    },

    onSelectIndividuals({ item, value }: { item: IIndividual, value: boolean }) {
      if (value) { // Selected
        this.assignIndividual(item);
      } else { // Unselected
        this.unAssignIndividual(item);
      }
    },

    updateDisabledUsers(currentTeamId: string) {
      this.allIndividuals
        .filter((individual) => individual.teamId === currentTeamId)
        .forEach((individual) => {
          let disabled = false;
          const assignedUser = this.assignedIndividuals.find((i) => i.id === individual.id);
          if (assignedUser) {
            disabled = this.currentTeam.id !== assignedUser.teamId;
          }
          individual.disabled = disabled;
        });
    },

    saveState() {
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
