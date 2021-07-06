<template>
  <v-col cols="12" md="6" class="flex-row justify-end">
    <div v-if="!loading && $hasLevel('level3')" class=" rc-body12 mr-4" data-test="case-file-assigned-info">
      <span v-if="assignedIndividualsInfo" class="fw-bold">{{ assignedIndividualsInfo }}</span>
      <span v-if="assignedTeamInfo && assignedIndividualsInfo" class="px-1">{{ $t('common.and') }}</span>
      <span v-if="assignedTeamInfo" class="fw-bold">{{ assignedTeamInfo }}</span>
      <span v-if="!assignedTeamInfo && !assignedIndividualsInfo ">{{ $t('caseFileDetail.notAssigned') }}</span>
    </div>

    <v-btn
      v-if="$hasLevel('level3')"
      color="primary"
      small
      data-test="case-file-assign-btn"
      @click="showAssignmentsDialog = true">
      <v-icon left>
        mdi-plus
      </v-icon>
      {{ $t("caseFileDetail.assignTo") }}
    </v-btn>

    <assign-case-file
      v-if="showAssignmentsDialog"
      data-test="assignments-dialog"
      :case-file="caseFile"
      :show.sync="showAssignmentsDialog"
      @updateAssignmentsInfo="setAssignmentsInfoFromData"
      @updateActivities="$emit('updateActivities')" />
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue';
import { ICaseFileEntity } from '@/entities/case-file';

import { IAzureSearchResult } from '@/types';
import { ITeam, ITeamMemberData, ITeamSearchData } from '@/entities/team';
import { IUserAccountCombined } from '@/entities/user-account';
import AssignCaseFile from './AssignCaseFile.vue';

export default Vue.extend({
  name: 'CaseFileAssignments',

  components: {
    AssignCaseFile,
  },

  props: {
    caseFile: {
      type: Object as () => ICaseFileEntity,
      required: true,
    },
  },

  data() {
    return {
      assignedTeamInfo: null,
      assignedIndividualsInfo: null,
      showAssignmentsDialog: false,
      loading: false,
    };
  },

  watch: {
    // Prevent showing the scrollbar of the component when the dialog opens
    showAssignmentsDialog(val) {
      document.querySelector('html').style.overflow = val ? 'hidden' : null;
    },
  },

  async created() {
    try {
      this.loading = true;
      if (this.$hasLevel('level3')) {
        await this.setAssignmentsInfo();
      }
    } finally {
      this.loading = false;
    }
  },

  methods: {
    /**
     * Set the assignment info by using the data sent back from the assign-case-file dialog after an assignment was done
     */
    setAssignmentsInfoFromData({ individuals, teams }: {individuals: ITeamMemberData[], teams: ITeam[]}) {
      this.assignedTeamInfo = teams[0] ? teams[0].name : '';
      const individualsNames = individuals.map((i) => (i.displayName));
      this.assignedIndividualsInfo = this.createAssignedIndividualsInfo([individualsNames[0], individualsNames[1]]);
    },

    /**
     * Set the assignment info by fetching the details of the team and team member names from their ids
     */
    async setAssignmentsInfo() {
      this.assignedTeamInfo = await this.getAssignedTeamInfo();
      this.assignedIndividualsInfo = await this.getAssignedIndividualsInfo();
    },

    async getAssignedTeamInfo() {
      if (!this.caseFile.assignedTeamIds.length) { return null; }

      const id = this.caseFile.assignedTeamIds[0];
      const teamResponse:IAzureSearchResult<ITeamSearchData> = await this.$storage.team.actions.searchTeams({ filter: { TeamId: id } });
      const team: ITeamSearchData = teamResponse?.value?.[0];
      return team?.teamName;
    },

    async getAssignedIndividualsInfo() {
      if (!this.caseFile.assignedIndividualIds.length) { return null; }

      let userAccounts = await this.$storage.userAccount.actions.fetchAll() as IUserAccountCombined[];

      if (userAccounts && userAccounts.length > 0) {
        userAccounts = userAccounts.filter((u) => this.caseFile.assignedIndividualIds.includes(u.entity.id));
        const userNames = userAccounts.map((u) => u.metadata.displayName);
        return this.createAssignedIndividualsInfo(userNames);
      }

      return null;
    },

    createAssignedIndividualsInfo(userNames:string[]): string {
      if (!userNames.length) return '';
      const and = userNames[0] && userNames[1] ? ` ${this.$t('common.and')} ` : '';
      return (userNames[0] || '') + and + (userNames[1] || '');
    },
  },

});
</script>
