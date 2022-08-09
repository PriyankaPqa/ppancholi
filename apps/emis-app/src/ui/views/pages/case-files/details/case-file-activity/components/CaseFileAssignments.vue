<template>
  <v-col cols="12" md="6" class="flex-row justify-end">
    <div class="rc-body12 mr-4" data-test="case-file-assigned-info">
      <div v-if="!loading" class="rc-body12 mr-4" data-test="case-file-assigned-info">
        <span v-if="assignedIndividualsInfo" class="fw-bold">{{ assignedIndividualsInfo }}</span>
        <span v-if="assignedTeamInfo && assignedIndividualsInfo" class="px-1">{{ $t('common.and') }}</span>
        <span v-if="assignedTeamInfo" class="fw-bold">{{ assignedTeamInfo }}</span>
        <span v-if="!assignedTeamInfo && !assignedIndividualsInfo ">{{ $t('caseFileDetail.notAssigned') }}</span>
      </div>
    </div>

    <v-btn
      v-if="canAssign"
      color="primary"
      small
      data-test="case-file-assign-btn"
      @click="showAssignmentsDialog = true">
      <v-icon left>
        mdi-plus
      </v-icon>
      {{ $t("caseFileDetail.assignTo") }}
    </v-btn>

    <v-btn
      v-else
      color="primary"
      small
      data-test="case-file-view-assign-btn"
      @click="showViewAssignmentsDialog = true">
      {{ $t("caseFileDetail.viewAssigned") }}
    </v-btn>

    <assign-case-file
      v-if="showAssignmentsDialog"
      data-test="assignments-dialog"
      :case-file="caseFile"
      :show.sync="showAssignmentsDialog"
      @updateAssignmentsInfo="setAssignmentsInfoFromData" />

    <view-assigned
      v-if="showViewAssignmentsDialog"
      :show.sync="showViewAssignmentsDialog"
      data-test="view-assignments-dialog"
      :case-file="caseFile" />
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { ITeamEntity } from '@libs/entities-lib/team';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { IAzureTableSearchResults } from '@libs/shared-lib/types';
import ViewAssigned from './ViewAssigned.vue';
import AssignCaseFile from './AssignCaseFile.vue';

export default Vue.extend({
  name: 'CaseFileAssignments',

  components: {
    AssignCaseFile,
    ViewAssigned,
  },

  props: {
    caseFile: {
      type: Object as () => ICaseFileEntity,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      assignedTeamInfo: '',
      assignedIndividualsInfo: '',
      showAssignmentsDialog: false,
      showViewAssignmentsDialog: false,
      loading: false,
      assignedTeams: [] as ITeamEntity[],
      FeatureKeys,
    };
  },

  computed: {
    canAssign() {
      return this.$hasLevel('level6') || (this.$hasLevel('level3') && !this.readonly);
    },
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
      await this.setAssignmentsInfo();
    } finally {
      this.loading = false;
    }
  },

  methods: {
    /**
     * Set the assignment info by using the data sent back from the assign-case-file dialog after an assignment was done
     */
    setAssignmentsInfoFromData({ individuals, teams }: {individuals: {displayName: string}[], teams: ITeamEntity[]}) {
      this.assignedTeams = teams || [];
      this.assignedTeamInfo = teams[0] ? teams[0].name : '';
      const individualsNames = individuals?.map((i) => (i.displayName));
      if (individualsNames) {
        this.assignedIndividualsInfo = this.createAssignedIndividualsInfo([individualsNames[0], individualsNames[1]]);
      }
    },

    /**
     * Set the assignment info by fetching the details of the team and team member names from their ids
     */
    async setAssignmentsInfo() {
      this.assignedTeamInfo = await this.getAssignedTeamInfo();
      this.assignedIndividualsInfo = await this.getAssignedIndividualsInfo();
    },

    async getAssignedTeamInfo() {
      if (!this.caseFile.assignedTeamIds.length) {
        return null;
      }
      this.assignedTeams = await this.$storage.team.actions.getTeamsAssigned(this.caseFile.id);
      return this.assignedTeams?.[0]?.name;
    },

    async getAssignedIndividualsInfo() {
      if (!this.caseFile.assignedIndividualIds.length) {
        return null;
      }

      const filter = `search.in(Entity/Id, '${this.caseFile.assignedIndividualIds.slice(0, 2).join('|')}', '|')`;

      const individualsData: IAzureTableSearchResults = await this.$storage.userAccount.actions.search({ filter });
      const { ids } = individualsData;

      const userAccounts = this.$storage.userAccount.getters.getByIds(ids);

      if (userAccounts && userAccounts.length > 0) {
        const userNames = userAccounts.map((u) => u.metadata.displayName);
        return this.createAssignedIndividualsInfo(userNames);
      }

      return null;
    },

    createAssignedIndividualsInfo(userNames:string[]): string {
      if (!userNames || !userNames.length) {
        return '';
      }
      const and = userNames[0] && userNames[1] ? ` ${this.$t('common.and')} ` : '';
      return (userNames[0] || '') + and + (userNames[1] || '');
    },
  },

});
</script>
