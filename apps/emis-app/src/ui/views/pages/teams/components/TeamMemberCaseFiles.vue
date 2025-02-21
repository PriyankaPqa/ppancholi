<template>
  <rc-dialog
    v-if="show"
    :title="$t('teams.member.caseFile.title', { member: member.metadata.displayName })"
    :show="show"
    content-only-scrolling
    content-padding="0"
    fullscreen
    persistent
    :show-submit="false"
    :cancel-action-label="$t('common.buttons.close')"
    @cancel="$emit('dialogClose')"
    @close="$emit('dialogClose')">
    <v-row v-if="loading" class="d-flex align-center justify-start no-gutter flex-column mx-0 my-6">
      <v-col col="12" md="6" class="eventTable mb-2">
        <v-skeleton-loader class="my-6" type="article" />
        <v-skeleton-loader class="my-6" type="article" />
      </v-col>
    </v-row>
    <v-row v-if="!loading && !isEmpty(caseFileGroups)" class="d-flex align-center justify-start no-gutter flex-column no-wrap mx-0 my-6">
      <v-col v-for="group in caseFileGroups" :key="group[0] && group[0].event.id || 0" col="12" md="6" class="eventTable mb-2">
        <div class=" fw-bold rc-heading-5 mb-4 align-left" data-test="team_member_caseFile_event_name">
          {{ group[0] ? $m(group[0].event.name) : '' }}
        </div>
        <v-sheet v-if="group[0]" rounded outlined>
          <v-simple-table class="member_teams_table">
            <thead>
              <tr>
                <th>
                  {{ $t('teams.member.caseFile.caseFileNumber') }}
                </th>
                <th style="width: 70%">
                  {{ $t('teams.member.caseFile.team') }}
                </th>
                <th>
                  {{ $t('teams.member.caseFile.status') }}
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in group"
                :key="item.caseFile.id"
                :class="{ isDisabledRow: !item.canAccessFile }">
                <td>
                  <router-link
                    :data-test="`team_member_caseFile_number_${index}`"
                    :to="getCaseFileRoute(item.caseFile.id)"
                    class="rc-link14 font-weight-bold"
                    :class="{ isDisabled: !item.canAccessFile }">
                    {{ item.caseFile.caseFileNumber }}
                  </router-link>
                </td>
                <td :data-test="`team_member_caseFile_teamName_${index}`">
                  {{ item.teamName }}
                </td>
                <td>
                  <status-chip status-name="CaseFileStatus" :status="item.caseFile.caseFileStatus" :data-test="`team_member_caseFile_status_${index}`" />
                </td>
                <td>
                  <v-btn
                    color="primary"
                    small
                    :disabled="!item.canAssign"
                    :data-test="`team_member_caseFile_reassign_btn_${index}`"
                    @click="openCaseFileAssignDialog(item.caseFile)">
                    {{ $t('teams.member.caseFile.reassign') }}
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row v-if="!loading && isEmpty(caseFileGroups)" class="d-flex align-center justify-start no-gutter flex-column mx-0 my-14">
      <div class="rc-heading-5">
        {{ $t('teams.member.caseFile.noCaseFiles') }}
      </div>
    </v-row>

    <assign-case-file
      v-if="showAssignmentsDialog"
      data-test="assignments-dialog"
      :case-file="selectedCaseFile"
      :show.sync="showAssignmentsDialog" />
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import _isEmpty from 'lodash/isEmpty';
import _groupBy from 'lodash/groupBy';
import routes from '@/constants/routes';
import { RcDialog } from '@libs/component-lib/components';
import { IUserAccountCombined, IUserAccountTeamEvent } from '@libs/entities-lib/user-account';
import { IMultilingual } from '@libs/shared-lib/types';
import {
  CaseFileStatus, ICaseFileSummary,
} from '@libs/entities-lib/case-file';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import AssignCaseFile from '@/ui/views/pages/case-files/details/case-file-activity/components/AssignCaseFile.vue';
import { Dictionary } from 'lodash';
import { UserRoles } from '@libs/entities-lib/user';

interface IMemberCaseFile {
  event: { id: string, name: IMultilingual },
  teamName: string,
  caseFile: ICaseFileSummary,
  canAssign: boolean,
  canAccessFile: boolean,
}

export default Vue.extend({
  name: 'TeamMemberCaseFiles',

  components: {
    RcDialog,
    StatusChip,
    AssignCaseFile,
  },

  props: {
    member: {
      type: Object as () => IUserAccountCombined,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      isEmpty: _isEmpty,
      CaseFileStatus,
      showAssignmentsDialog: false,
      selectedCaseFile: null as ICaseFileSummary,
      fetchedCaseFiles: [] as ICaseFileSummary[],
      loading: false,
    };
  },

  computed: {
    caseFileGroups(): Record<string, IMemberCaseFile[]> {
      if (!this.fetchedCaseFiles?.length) {
        return {};
      }
      const allCaseFiles = this.fetchedCaseFiles;

      const caseFilesByEvent: Dictionary<ICaseFileSummary[]> = _groupBy(allCaseFiles, (cf) => cf?.eventId);
      const mappedCaseFiles = {} as Record<string, IMemberCaseFile[]>;

      // Create the mappedCaseFiles object in the form of { <eventId>: List of case files that belong to that event, mapped to contain the relevant
      // information for the table in this modal (i.e. as IMemberCaseFile)}
      Object.keys(caseFilesByEvent).forEach((key) => {
        if (caseFilesByEvent[key].length) {
          const mappedCaseFilesByEvent = caseFilesByEvent[key].map((cf: ICaseFileSummary): IMemberCaseFile => {
            const memberDataInAssignedTeamMembersList = cf?.assignedTeamMembers.find((item) => item.teamMembersIds.includes(this.member.entity.id));
            if (memberDataInAssignedTeamMembersList) {
              const teamId = memberDataInAssignedTeamMembersList.teamId;
              const team = this.member.metadata.teams.find((t) => t?.teamId === teamId);
              const teamName = team?.name || '';
              const eventName = team?.events.find((e:IUserAccountTeamEvent) => e.id === cf.eventId).name || { translation: {} };

              return {
                event: {
                  id: cf.eventId,
                  name: eventName,
                },
                teamName,
                caseFile: cf,
                canAccessFile: cf.hasAccess,
                canAssign: cf.hasAccess && (cf.caseFileStatus === CaseFileStatus.Open || this.$hasLevel(UserRoles.level6)),
              };
            }
            return null;
          }).filter((e) => e);

          if (mappedCaseFilesByEvent.length) {
            mappedCaseFiles[key] = mappedCaseFilesByEvent;
          }
        }
      });

      return mappedCaseFiles;
    },
  },

  watch: {
    showAssignmentsDialog(newValue, oldValue) {
      if (newValue === false && oldValue === true) {
        this.fetchAllCaseFiles();
      }
    },
  },

  async created() {
    this.loading = true;
    await this.fetchAllCaseFiles();
    this.loading = false;
  },

  methods: {
    async fetchAllCaseFiles() {
      const caseFiles = await this.$services.caseFiles.searchSummaries({ filter: `(contains(AssignedTeamMembersAsString,'${this.member.entity.id}'))` });

      if (caseFiles?.value) {
        this.fetchedCaseFiles = caseFiles.value
          .filter((f: ICaseFileSummary) => f.caseFileStatus === CaseFileStatus.Open || f.caseFileStatus === CaseFileStatus.Inactive);
      }
    },

    getCaseFileRoute(id: string) {
      return {
        name: routes.caseFile.activity.name,
        params: {
          id,
        },
      };
    },

    openCaseFileAssignDialog(caseFile: ICaseFileSummary) {
      this.selectedCaseFile = caseFile;
      this.showAssignmentsDialog = true;
    },
  },

});
</script>

<style scoped lang="scss">

td {
    white-space: nowrap;
}

.eventTable {
  flex: 0;
}

.no-wrap{
  flex-wrap: nowrap;
}

a.rc-link14.isDisabled {
  color: var(--v-grey-darken4) !important;
  pointer-events: none;
}

::v-deep .theme--light.v-data-table > .v-data-table__wrapper >table >tbody> tr.isDisabledRow,
::v-deep .theme--light.v-data-table > .v-data-table__wrapper >table >tbody> tr.isDisabledRow:hover
{
  background-color: var(--v-grey-lighten4) !important;
}

</style>
