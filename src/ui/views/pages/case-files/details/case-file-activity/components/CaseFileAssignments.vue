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
import { ICaseFile } from '@/entities/case-file';

import { IAzureSearchResult } from '@/types';
import { ITeam, ITeamSearchData } from '@/entities/team';
import { IUserAccount } from '@/entities/user-account';
import AssignCaseFile from './AssignCaseFile.vue';

export default Vue.extend({
  name: 'CaseFileAssignments',

  components: {
    AssignCaseFile,
  },

  props: {
    caseFile: {
      type: Object as () => ICaseFile,
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
    setAssignmentsInfoFromData({ individuals, teams }: {individuals: IUserAccount[], teams: ITeam[]}) {
      this.assignedTeamInfo = teams[0] ? teams[0].name : '';
      this.assignedIndividualsInfo = this.createAssignedIndividualsInfo([individuals[0], individuals[1]]);
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

      // Filter example:  search.in(UserAccountId, 'ab596336-a90a-4ef0-a645-2f9a87f11c02|dd596336-a90a-4ef0-a645-2f9a87f15421', '|')
      const filter = `search.in(UserAccountId, '${this.caseFile.assignedIndividualIds.slice(0, 2).join('|')}', '|')`;

      const usersResponse = await this.$storage.userAccount.actions.searchUserAccounts({
        filter,
      });

      if (usersResponse && usersResponse.value) {
        const users = usersResponse.value;
        return this.createAssignedIndividualsInfo(users);
      }

      return null;
    },

    createAssignedIndividualsInfo(users:IUserAccount[]): string {
      if (!users.length) return '';
      let name0 = '';
      let name1 = '';
      if (users[0]) { name0 = users[0].displayName; }
      if (users[1]) { name1 = users[1].displayName; }
      const and = users[0] && users[1] ? ` ${this.$t('common.and')} ` : '';
      return name0 + and + name1;
    },
  },

});

</script>
