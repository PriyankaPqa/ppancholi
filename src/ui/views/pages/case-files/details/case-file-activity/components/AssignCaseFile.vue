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
    :show-help="true"
    :help-link="$t('zendesk.help_link.assign_case_file')"
    :tooltip-label="$t('common.tooltip_label')"
    :loading="loading"
    @close="close"
    @cancel="close"
    @submit="submit">
    <v-row>
      <v-col cols="12" md="4" class="px-6 py-0 my-4 d-flex flex-column border-right ">
        <span class="rc-body16 fw-bold pb-4">{{ $t('caseFile.assign.select_team') }}</span>
        <v-sheet rounded outlined height="100%">
          <v-list>
            <v-list-item-group
              v-model="assignedTeams"
              two-line
              active-class="team-selected"
              data-test="all-teams-list"
              multiple>
              <v-list-item
                v-for="team in allTeams"
                :key="team.id"
                :ripple="false"
                class="team-list-item"
                :data-test="`team-list-item-${team.id}`"
                :value="team">
                <template #default="{ active }">
                  <v-list-item-action>
                    <v-checkbox :ripple="false" :input-value="active" />
                  </v-list-item-action>

                  <v-list-item-content>
                    <v-list-item-title>
                      <span class="rc-body14 fw-bold">{{ team.name }} ({{ team.activeMemberCount }})</span>
                    </v-list-item-title>
                    <v-list-item-subtitle>{{ $t(`enums.TeamType.${TeamType[team.teamType]}`) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-list-item>
            </v-list-item-group>
          </v-list>
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
          v-model="assignedIndividuals"
          data-test="individuals-table"
          class="flex-grow-1 scrollable"
          :headers="headers"
          show-select
          hide-default-footer
          must-sort
          item-key="id"
          :options="{sortBy: ['displayName'], sortDesc: [false]}"
          :item-class="(item)=> isSelected(item)? 'row_active': ''"
          :items="displayedIndividuals"
          :items-per-page="Math.max(allIndividuals.length, 1)"
          @update:sort-by="sortBy = $event"
          @update:sort-desc="sortDesc = $event">
          <template #[`header.data-table-select`]="{ props, on }">
            <v-simple-checkbox
              :ripple="false"
              :value="props.value || props.indeterminate"
              :indeterminate="props.indeterminate"
              color="primary"
              v-on="on" />
          </template>
        </v-data-table>
      </v-col>

      <v-col cols="12" md="4" class="px-6 d-flex flex-column">
        <assigned-list
          :assigned-individuals="assignedIndividuals"
          :assigned-teams="assignedTeams"
          @removeTeam="removeTeam"
          @removeIndividual="removeIndividual" />
      </v-col>
    </v-row>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { RcDialog } from '@crctech/component-library';
import { DataTableHeader } from 'vuetify';
import { TeamType, ITeamEntity, ITeamMember } from '@/entities/team';
import { ICaseFileEntity } from '@/entities/case-file';
import helpers from '@/ui/helpers';
import { AccountStatus, IUserAccountCombined } from '@/entities/user-account';
import { Status } from '@/entities/base';
import AssignedList from './AssignedList.vue';

interface TeamWithCount extends ITeamEntity {
  activeMemberCount: number;
}

interface IIndividual extends ITeamMember, IUserAccountCombined{
  translatedRoleName?: string;
  displayName: string;
}

export default Vue.extend({
  name: 'AssignCaseFile',

  components: {
    RcDialog,
    AssignedList,
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
      assignedTeams: [] as TeamWithCount[],
      assignedIndividuals: [] as IIndividual[],
      searchTerm: '',
      allTeams: [] as TeamWithCount[],
      allIndividuals: [] as IIndividual[],
      loading: false,
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
      ];
    },

    displayedIndividuals():IIndividual[] {
      return helpers.filterCollectionByValue(this.allIndividuals, this.searchTerm || '', true);
    },

  },

  async created() {
    try {
      this.loading = true;

      await this.getTeamsData();
      this.setAllIndividuals();
      this.setAssignedTeams();
      this.setAssignedIndividuals();
    } finally {
      this.loading = false;
    }
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    async getTeamsData() {
      const { eventId } = this.caseFile;
      const teams: ITeamEntity[] = await this.$storage.team.actions.getTeamsAssignable(eventId);

      this.allTeams = (_cloneDeep(teams.filter((t:ITeamEntity) => t.status === Status.Active)))
        .map((x) => ({ ...x, activeMemberCount: 0 }));
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
            // If team member is active and has not already been added, he is added to the allIndividuals list
            if (!allIndividuals.find((i) => i.id === member.id)) {
              allIndividuals.push({
                ...member,
                ...userMember,
                displayName: userMember.metadata.displayName,
                translatedRoleName: userMember.metadata.roleName.translation[this.$i18n.locale],
              });
            }
          }
        });
      });

      this.allIndividuals = allIndividuals;
    },

    setAssignedIndividuals() {
      this.caseFile.assignedIndividualIds.forEach((id) => {
        const assignedIndividual = this.allIndividuals.find((m:IIndividual) => m.id === id);
        if (assignedIndividual && assignedIndividual.entity.accountStatus === AccountStatus.Active) {
          this.assignedIndividuals.push(assignedIndividual);
        }
      });
    },

    setAssignedTeams() {
      this.caseFile.assignedTeamIds.forEach((id) => {
        const assignedTeam = this.allTeams.find((t:TeamWithCount) => t.id === id);
        if (assignedTeam) {
          this.assignedTeams.push(assignedTeam);
        }
      });
    },

    isSelected(user: IIndividual): boolean {
      return this.assignedIndividuals.findIndex((u) => user.id === u.id) !== -1;
    },

    removeIndividual(individual: IIndividual) {
      this.assignedIndividuals = this.assignedIndividuals.filter((i) => i.id !== individual.id);
    },

    removeTeam(team: {name: string, id: string, type: string}) {
      this.assignedTeams = this.assignedTeams.filter((t) => t.id !== team.id);
    },

    async submit() {
      try {
        const individualsPayload = this.assignedIndividuals.map((i) => i.id);
        const teamsPayload = this.assignedTeams.map((t) => t.id);
        this.loading = true;
        await this.$storage.caseFile.actions.setCaseFileAssign(
          this.caseFile.id, individualsPayload, teamsPayload,
        );
        this.$emit('updateAssignmentsInfo', { teams: this.assignedTeams, individuals: this.assignedIndividuals });
        this.$emit('updateActivities');
      } finally {
        this.loading = false;
        this.$emit('update:show', false);
      }
    },
  },
});

</script>

<style scoped lang='scss'>

.team-list-item {
  border-bottom: 1px solid var(--v-grey-lighten2);
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
