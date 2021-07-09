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
                      <span class="rc-body14 fw-bold">{{ team.name }} ({{ team.getActiveMemberCount() }})</span>
                    </v-list-item-title>
                    <v-list-item-subtitle>{{ $m(team.teamTypeName) }}</v-list-item-subtitle>
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
          v-model="assignedMembers"
          data-test="individuals-table"
          class="flex-grow-1 scrollable"
          :headers="headers"
          show-select
          hide-default-footer
          must-sort
          item-key="id"
          :options="{sortBy: ['displayName'], sortDesc: [false]}"
          :item-class="(item)=> isSelected(item)? 'row_active': ''"
          :items="displayedMembers"
          :items-per-page="Math.max(allMembers.length, 1)"
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
        <span class="rc-body16 fw-bold pb-4">{{ $t('caseFile.assign.assigned_to') }}</span>

        <v-sheet rounded outlined height="100%" class="pa-4">
          <v-list v-if="assignedTeams.length" data-test="assigned-teams-list">
            <span class="rc-body14 pb-4">
              {{ $t('caseFile.assign.assigned_team') }}
            </span>
            <v-list-item-group>
              <v-list-item
                v-for="team in assignedTeams"
                :key="team.id"
                class="pl-3 assigned-list-item"
                :data-test="`assigned-teams-list-item-${team.id}`">
                <v-list-item-content class="py-1">
                  <span class="rc-body14 fw-bold">{{ team.name }}</span>
                </v-list-item-content>
                <v-list-item-action class="my-1">
                  <v-tooltip bottom>
                    <template #activator="{ on }">
                      <v-btn
                        icon
                        x-small
                        :data-test="`unassign_${team.id}`"
                        @click="removeTeam(team)"
                        v-on="on">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('caseFile.assign.tooltip.unassign') }}</span>
                  </v-tooltip>
                </v-list-item-action>
              </v-list-item>
            </v-list-item-group>
          </v-list>

          <v-list v-if="assignedMembers.length" data-test="assigned-individuals-list">
            <span class="rc-body14 pt-6 pb-3">
              {{ $t('caseFile.assign.assigned_individual') }}
            </span>
            <v-list-item-group>
              <v-list-item
                v-for="member in assignedMembers"
                :key="member.id"
                class="pl-3 assigned-list-item"
                :data-test="`assigned-individuals-list-item-${member.id}`">
                <v-list-item-content class="py-1">
                  <span class="rc-body14 fw-bold">{{ member.displayName }}</span>
                </v-list-item-content>
                <v-list-item-action class="my-1">
                  <v-tooltip bottom>
                    <template #activator="{ on }">
                      <v-btn
                        icon
                        x-small
                        :data-test="`unassign_${member.id}`"
                        @click="removeMember(member)"
                        v-on="on">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('caseFile.assign.tooltip.unassign') }}</span>
                  </v-tooltip>
                </v-list-item-action>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-sheet>
      </v-col>
    </v-row>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog } from '@crctech/component-library';
import { DataTableHeader } from 'vuetify';
import {
  ETeamStatus, ITeam, ITeamMemberData,
} from '@/entities/team';
import { ICaseFileEntity } from '@/entities/case-file';
import helpers from '@/ui/helpers';
import { AccountStatus } from '@/entities/user-account';

interface IIndividual extends ITeamMemberData{
  translatedRoleName: string;
}

export default Vue.extend({
  name: 'AssignCaseFile',

  components: {
    RcDialog,
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
      assignedTeams: [],
      assignedMembers: [] as IIndividual[],
      searchTerm: '',
      allTeams: [] as ITeam[],
      allMembers: [] as IIndividual[],
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

    displayedMembers():IIndividual[] {
      return helpers.filterCollectionByValue(this.allMembers, this.searchTerm || '', true);
    },

  },

  async created() {
    try {
      this.loading = true;

      await this.getTeamsData();
      this.setAllMembers();
      this.setAssignedTeams();
      this.setAssignedMembers();
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
      const teams: ITeam[] = await this.$storage.team.actions.getTeamsAssignable(eventId);
      this.allTeams = teams.filter((t:ITeam) => t.status === ETeamStatus.Active);
    },

    setAllMembers() {
      const allMembers = [] as IIndividual[];

      this.allTeams.forEach((t) => {
        t.teamMembers.forEach((member :ITeamMemberData) => {
          // If team member is active and has not already been added, he is added to the allMembers list
          if (!allMembers.find((m) => m.id === member.id) && member.accountStatus === AccountStatus.Active) {
            allMembers.push({
              ...member,
              translatedRoleName: member.roleName.translation[this.$i18n.locale],
            });
          }
        });
      });

      this.allMembers = allMembers;
    },

    setAssignedMembers() {
      this.caseFile.assignedIndividualIds.forEach((id) => {
        const assignedMember = this.allMembers.find((m:IIndividual) => m.id === id);
        if (assignedMember && assignedMember.accountStatus === AccountStatus.Active) {
          this.assignedMembers.push(assignedMember);
        }
      });
    },

    setAssignedTeams() {
      this.caseFile.assignedTeamIds.forEach((id) => {
        const assignedTeam = this.allTeams.find((t:ITeam) => t.id === id);
        if (assignedTeam) {
          this.assignedTeams.push(assignedTeam);
        }
      });
    },

    isSelected(user: IIndividual): boolean {
      return this.assignedMembers.findIndex((u) => user.id === u.id) !== -1;
    },

    removeMember(member: IIndividual) {
      this.assignedMembers = this.assignedMembers.filter((m) => m.id !== member.id);
    },

    removeTeam(team: {name: string, id: string, type: string}) {
      this.assignedTeams = this.assignedTeams.filter((t) => t.id !== team.id);
    },

    async submit() {
      try {
        const individualsPayload = this.assignedMembers.map((m) => m.id);
        const teamsPayload = this.assignedTeams.map((t) => t.id);
        this.loading = true;
        await this.$storage.caseFile.actions.setCaseFileAssign(
          this.caseFile.id, individualsPayload, teamsPayload,
        );
        const individuals:ITeamMemberData[] = this.assignedMembers.map((m) => {
          // Remove the property translatedRoleName from the members objects
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { translatedRoleName, ...member } = m;
          return member;
        });
        this.$emit('updateAssignmentsInfo', { teams: this.assignedTeams, individuals });
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
