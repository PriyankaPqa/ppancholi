<template>
  <div v-if="summary">
    <v-sheet
      rounded
      outlined
      class="mb-4">
      <v-simple-table>
        <tbody>
          <tr>
            <td class="label fw-bold">
              {{ $t('caseFileTable.tableHeaders.status') }}
            </td>
            <td class="data">
              <status-chip status-name="CaseFileStatus" :status="summary.caseFileStatus" />
            </td>
          </tr>
          <tr>
            <td class="label fw-bold">
              {{ $t('caseFileTable.tableHeaders.triage') }}
            </td>
            <td class="data">
              {{ summary.triage }}
            </td>
          </tr>
          <tr>
            <td class="label fw-bold">
              {{ $t('caseFileTable.tableHeaders.caseFileId') }}
            </td>
            <td class="data">
              {{ summary.caseFileNumber }}
            </td>
          </tr>
          <tr>
            <td class="label fw-bold">
              {{ $t('caseFileDetail.impactValidationDialog.title') }}
            </td>
            <td class="data">
              {{ summary.validationOfImpact }}
            </td>
          </tr>
          <tr>
            <td class="label fw-bold">
              {{ $t('caseFileTable.filters.tags') }}
            </td>
            <td class="data">
              <case-file-tags
                :readonly="true"
                :case-file-id="caseFileId"
                :tags="summary.tags" />
            </td>
          </tr>
          <tr>
            <td class="label fw-bold">
              {{ $t('casefile.summary.totalHousehold', { x: householdMembers.length + (primary ? 1: 0) }) }}
            </td>
            <td class="data py-2">
              <div v-if="primary" class="d-flex">
                <v-col cols="3" class="pa-0">
                  {{ $t('casefile.summary.primaryMember') }}
                </v-col>
                <v-col class="pa-0">
                  {{ primary.name }} ({{ primary.birthDate }})
                </v-col>
              </div>
              <div v-if="householdMembers.length" class="d-flex">
                <v-col cols="3" class="pa-0">
                  {{ $t('casefile.summary.members') }}
                </v-col>
                <v-col class="pa-0">
                  <div v-for="member in householdMembers" :key="member.name">
                    {{ member.name }} ({{ member.birthDate }})
                  </div>
                </v-col>
              </div>
            </td>
          </tr>
          <tr>
            <td class="label fw-bold">
              {{ $t('caseFile.assign.assigned_to') }}
            </td>
            <td class="data">
              {{ summary.assignedToUsersAndTeams }}
            </td>
          </tr>
          <tr>
            <td class="label fw-bold">
              {{ $t('casefile.summary.financialAssistance') }}
            </td>
            <td class="data">
              {{ summary.financialTotal != null ? $formatCurrency(summary.financialTotal): '' }}
            </td>
          </tr>
          <tr>
            <td class="label fw-bold">
              {{ $t('casefile.summary.referrals') }}
            </td>
            <td class="data">
              {{ summary.hasReferrals === null ? '' : $t(summary.hasReferrals ? 'common.yes': 'common.no') }}
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-sheet>

    <v-sheet
      v-if="summary.closedArchivedActivity"
      rounded
      outlined>
      <v-simple-table>
        <tbody>
          <tr class="background">
            <td class="label fw-bold">
              {{ summary.closedArchivedActivity.isClosed ? $t('casefile.summary.closedBy') : $t('casefile.summary.archivedBy') }}
            </td>
            <td class="data">
              {{ summary.closedArchivedActivity.name }}
            </td>
          </tr>
          <tr>
            <td class="label fw-bold">
              {{ summary.closedArchivedActivity.isClosed ? $t('casefile.summary.dateClosed') : $t('casefile.summary.dateArchived') }}
            </td>
            <td class="data">
              {{ summary.closedArchivedActivity.date }}
            </td>
          </tr>
          <tr v-if="summary.closedArchivedActivity.isClosed">
            <td class="label fw-bold">
              {{ $t('casefile.summary.reasonClosed') }}
            </td>
            <td class="data">
              {{ summary.closedArchivedActivity.reason }}
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-sheet>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _orderBy from 'lodash/orderBy';
import moment from 'moment';
import { IHouseholdEntity, IHouseholdMemberMetadata, IHouseholdMetadata } from '@libs/entities-lib/household';
import {
  CaseFileActivityType, CaseFileStatus, ICaseFileActivity, ICaseFileEntity, ICaseFileMetadata,
} from '@libs/entities-lib/case-file';
import { IIdMultilingualName } from '@libs/shared-lib/types';
import helpers from '@/ui/helpers/helpers';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { PaymentsSummary } from '@libs/entities-lib/financial-assistance-payment';
import CaseFileTags from './case-file-activity/components/CaseFileTags.vue';

export interface CaseFileSummary {
  closedArchivedActivity: { name: string; date: string; reason: string; isClosed: boolean };
  hasReferrals: boolean;
  financialTotal: number;
  assignedToUsersAndTeams: string;
  tags: IIdMultilingualName[];
  validationOfImpact: string;
  caseFileNumber: string;
  caseFileStatus: CaseFileStatus;
  triage: string;
}

export default Vue.extend({
  name: 'CaseFileSummary',

  components: {
    CaseFileTags,
    StatusChip,
  },

  props: {
    caseFileId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      hasReferrals: null as boolean,
      activities: [] as ICaseFileActivity[],
      caseFile: null as ICaseFileEntity,
      caseFileMetadata: null as ICaseFileMetadata,
      closeActivity: null as ICaseFileActivity,
      faSummary: null as PaymentsSummary,
      primary: null as { name: string, birthDate: string },
      householdMembers: [] as { name: string, birthDate: string }[],
    };
  },

  computed: {
    assignedUserAccounts(): string[] {
      return this.$storage.userAccount.getters.getByIds(this.caseFile?.assignedIndividualIds || []).map((u) => u.metadata?.displayName) || [];
    },

    assignedTeams(): string[] {
      return this.$storage.team.getters.getByIds(this.caseFile?.assignedTeamIds || []).map((u) => u.entity?.name) || [];
    },

    summary(): CaseFileSummary {
      if (!this.caseFile || !this.caseFileMetadata) {
        return null;
      }
      const s = {} as CaseFileSummary;
      s.caseFileStatus = this.caseFile.caseFileStatus;
      s.triage = this.$m(this.caseFileMetadata.triageName);
      s.caseFileNumber = this.caseFile.caseFileNumber;
      s.validationOfImpact = this.$m(this.caseFileMetadata.impactStatusValidationName);
      s.tags = this.caseFileMetadata.tags || [];
      s.assignedToUsersAndTeams = [...this.assignedTeams, ...this.assignedUserAccounts].join(', ');
      s.financialTotal = this.faSummary?.grandTotalAmount;
      s.hasReferrals = this.hasReferrals;
      if (this.closeActivity) {
        s.closedArchivedActivity = {
          name: this.closeActivity.user.name,
          isClosed: this.closeActivity.activityType === CaseFileActivityType.CaseFileStatusClosed,
          date: helpers.getLocalStringDate(this.closeActivity.created, 'Entity.created', 'll'),
          reason: this.closeActivity.activityType === CaseFileActivityType.CaseFileStatusClosed
            ? this.$m((this.closeActivity.details.reason as IIdMultilingualName).name) : null,
        };
      }
      return s;
    },
  },

  async created() {
    this.loadData();
  },

  methods: {
    async loadData() {
      this.caseFile = await this.$services.caseFiles.getSummary(this.caseFileId);
      this.caseFileMetadata = await this.$services.caseFilesMetadata.getSummary(this.caseFileId);
      await Promise.all([
        await this.$storage.team.actions.getTeamsAssigned(this.caseFileId),
        await this.getAssignedIndividualsInfo(this.caseFile.assignedIndividualIds),
        await this.getReferrals(),
        await this.getActivities(),
        await this.getFASummary(),
      ]);

      await this.getHouseholdMembers();
    },

    async getAssignedIndividualsInfo(assignedIndividualIds: string[]) {
      const filter = `search.in(Entity/Id, '${assignedIndividualIds.join('|')}', '|')`;

      await this.$storage.userAccount.actions.search({ filter });
    },

    async getReferrals() {
      await this.$storage.caseFileReferral.actions.fetchAll({ caseFileId: this.caseFileId });
      this.hasReferrals = this.$storage.caseFileReferral.getters.getByCaseFile(this.caseFileId).length > 0;
    },

    async getActivities() {
      this.activities = await this.$storage.caseFile.actions.fetchCaseFileActivities(this.caseFileId);
      this.activities = _orderBy(this.activities, 'created', 'desc');

      this.closeActivity = this.activities.filter((a) => a.activityType === CaseFileActivityType.CaseFileStatusClosed
        || a.activityType === CaseFileActivityType.CaseFileStatusArchived)[0];
    },

    async getFASummary() {
      this.faSummary = await this.$services.financialAssistancePaymentsService.getPaymentSummary(this.caseFileId);
    },

    async getHouseholdMembers() {
      const mapToMember = (m: IHouseholdMemberMetadata) => ({
        name: `${m.firstName} ${m.lastName}`,
        birthDate: helpers.getLocalStringDate(m.dateOfBirth, 'HouseholdMemberMetadata.dateOfBirth', 'll'),
      });
      // if we have a date of archival/close we get the household at that date else we get the current households
      if (!this.closeActivity?.created) {
        const household = this.$storage.household.getters.get(this.caseFile?.householdId);
        this.primary = (household?.metadata?.memberMetadata || [])
          .filter((m) => m.id === household?.entity.primaryBeneficiary).map(mapToMember)[0];
        this.householdMembers = (household?.metadata?.memberMetadata || [])
          .filter((m) => m.id !== household?.entity.primaryBeneficiary).map(mapToMember);
      } else {
        let historyE = (await this.$services.households.getHouseholdHistory(this.caseFile?.householdId) || []);
        let historyM = (await this.$services.households.getHouseholdMetadataHistory(this.caseFile?.householdId) || []);
        historyE = _orderBy(historyE, 'timestamp', 'desc');
        historyM = _orderBy(historyM, 'timestamp', 'desc');
        // since our BE stuff happens async, some history might not be recorded at the exact same time
        // it has been decided that we will look at the version of history that was valid one minute before the close/archive
        const oneMinuteBeforeCloseArchive = moment(this.closeActivity.created).add(-1, 'minute').toISOString();
        const lastMeta = historyM.filter((h) => h.timestamp <= oneMinuteBeforeCloseArchive)[0]?.entity as IHouseholdMetadata;
        const lastEntity = historyE.filter((h) => h.timestamp <= oneMinuteBeforeCloseArchive)[0]?.entity as IHouseholdEntity;
        if (lastMeta) {
          this.primary = (lastMeta.memberMetadata || []).filter((m) => m.id === lastEntity?.primaryBeneficiary).map(mapToMember)[0];
          this.householdMembers = (lastMeta.memberMetadata || []).filter((m) => m.id !== lastEntity?.primaryBeneficiary).map(mapToMember);
        }
      }
    },
  },
});
</script>

<style scoped>

.label {
  white-space: nowrap;
  width: 30%;
}
.data {
  white-space: pre-line;
}
.background {
  background-color: var(--v-grey-lighten4);
}

</style>
