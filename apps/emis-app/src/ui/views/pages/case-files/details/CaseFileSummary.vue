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
              {{ $t('casefile.summary.totalHousehold', { x: householdMembers.length + (primary ? 1 : 0) }) }}
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
              {{ summary.financialTotal != null ? $formatCurrency(summary.financialTotal) : '' }}
            </td>
          </tr>
          <tr>
            <td class="label fw-bold">
              {{ $t('casefile.summary.referrals') }}
            </td>
            <td class="data">
              {{ summary.hasReferrals === null ? '' : $t(summary.hasReferrals ? 'common.yes' : 'common.no') }}
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
          <tr class="grey-container">
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
import _flatten from 'lodash/flatten';
import {
  CaseFileActivityType, CaseFileStatus, CaseFileTriage, ICaseFileActivity, ICaseFileSummary, ValidationOfImpactStatus,
} from '@libs/entities-lib/case-file';
import { useCaseFileReferralStore } from '@/pinia/case-file-referral/case-file-referral';
import { IIdMultilingualName } from '@libs/shared-lib/types';
import helpers from '@/ui/helpers/helpers';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';
import entityUtils from '@libs/entities-lib/utils';

import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { PaymentsSummary } from '@libs/entities-lib/financial-assistance-payment';
import { IdParams, IUserAccountEntity, IUserAccountMetadata } from '@libs/entities-lib/user-account';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { useTeamStore } from '@/pinia/team/team';
import { useHouseholdStore } from '@/pinia/household/household';
import { usePersonStore } from '@/pinia/person/person';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import { IMemberEntity } from '@libs/entities-lib/household-create';
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
      caseFile: null as ICaseFileSummary,
      closeActivity: null as ICaseFileActivity,
      faSummary: null as PaymentsSummary,
      primary: null as { name: string, birthDate: string },
      householdMembers: [] as { name: string, birthDate: string }[],
      combinedUserAccountStore: new CombinedStoreFactory<IUserAccountEntity, IUserAccountMetadata, IdParams>(useUserAccountStore(), useUserAccountMetadataStore()),
    };
  },

  computed: {
    assignedIndividualIds(): string[] {
      return _flatten(this.caseFile.assignedTeamMembers?.map((m) => m.teamMembersIds) || []);
    },

    assignedUserAccounts(): string[] {
      return useUserAccountMetadataStore().getByIds(this.assignedIndividualIds).map((u) => u.displayName) || [];
    },

    assignedTeams(): string[] {
      return useTeamStore().getByIds(this.caseFile?.assignedTeamIds || []).map((u) => u.name) || [];
    },

    summary(): CaseFileSummary {
      if (!this.caseFile) {
        return null;
      }
      const s = {} as CaseFileSummary;
      s.caseFileStatus = this.caseFile.caseFileStatus;
      s.triage = this.$t(`enums.Triage.${CaseFileTriage[this.caseFile.triage || CaseFileTriage.None]}`) as string;
      s.caseFileNumber = this.caseFile.caseFileNumber;
      s.validationOfImpact = this.$t(`enums.ValidationOfImpactStatus.${ValidationOfImpactStatus[this.caseFile.impactStatusValidation?.status
          || ValidationOfImpactStatus.Undetermined]}`) as string;

      const existingIds = (this.caseFile.tags || []).map((t) => t.optionItemId);
      const tags = useCaseFileStore().getTagsOptions(false);
      s.tags = existingIds.map((id) => {
        const name = tags.find((t) => t.id === id)?.name || entityUtils.initMultilingualAttributes();
        return { id, name };
      });

      s.assignedToUsersAndTeams = [...this.assignedTeams, ...this.assignedUserAccounts].join(', ');
      s.financialTotal = this.faSummary?.grandTotalAmount;
      s.hasReferrals = this.hasReferrals;
      if (this.closeActivity) {
        s.closedArchivedActivity = {
          name: this.closeActivity.user.name,
          isClosed: this.closeActivity.activityType === CaseFileActivityType.CaseFileStatusClosed,
          date: helpers.getLocalStringDate(this.closeActivity.created, 'CaseFileSummary.closeActivityDate', 'PP'),
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
      await useCaseFileStore().fetchTagsOptions();
      this.caseFile = await this.$services.caseFiles.getSummary(this.caseFileId);
      await Promise.all([
        useTeamStore().getTeamsAssigned(this.caseFileId),
        this.getAssignedIndividualsInfo(),
        this.getReferrals(),
        this.getActivities(),
        this.getFASummary(),
      ]);

      await this.getHouseholdMembers();
    },

    async getAssignedIndividualsInfo() {
      await sharedHelpers.callSearchInInBatches({
        ids: this.assignedIndividualIds,
        service: this.combinedUserAccountStore,
        searchInFilter: { Entity: { Id: { in: '{ids}' } } },
        otherOptions: {
        },
        otherApiParameters: [null, false, true],
      });
    },

    async getReferrals() {
      await useCaseFileReferralStore().fetchAll({ caseFileId: this.caseFileId });
      this.hasReferrals = useCaseFileReferralStore().getByCaseFile(this.caseFileId).length > 0;
    },

    async getActivities() {
      this.activities = await useCaseFileStore().fetchCaseFileActivities(this.caseFileId);
      this.activities = _orderBy(this.activities, 'created', 'desc');

      this.closeActivity = this.activities.filter((a) => a.activityType === CaseFileActivityType.CaseFileStatusClosed
        || a.activityType === CaseFileActivityType.CaseFileStatusArchived)[0];
    },

    async getFASummary() {
      this.faSummary = await this.$services.financialAssistancePaymentsService.getPaymentSummary(this.caseFileId);
    },

    async getHouseholdMembers() {
      const mapToMember = (m: IMemberEntity) => ({
        name: `${m.identitySet.firstName} ${m.identitySet.lastName}`,
        birthDate: helpers.getLocalStringDate(m.identitySet.dateOfBirth, 'HouseholdMemberMetadata.dateOfBirth', 'PP'),
      });

      const household = useHouseholdStore().getById(this.caseFile?.householdId);
      if (!household.id) {
        return;
      }

      const memberIds = this.caseFile.impactedIndividuals.filter((i) => i.receivingAssistance).map((x) => x.personId);
      let primaryId = household.primaryBeneficiary;

      // we get primary and all members marked as receiving assistance - if the case file is closed we get the primary of that day
      if (this.closeActivity?.created) {
        // we look for primary at that date
        const date = new Date(this.closeActivity.created);
        const dayOfClosing = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)).toISOString();
        primaryId = (_orderBy(household.primaryBeneficiariesHistory || [], (x) => new Date(x.from).toISOString() + (x.to || 'ZZZZ'), 'desc'))
          .filter((x) => new Date(x.from).toISOString() <= dayOfClosing).map((x) => x.memberId)[0];
      }

      const members = await usePersonStore().fetchByIds([...memberIds, primaryId], true);
      this.primary = members.filter((m) => m.id === primaryId).map(mapToMember)[0];
      this.householdMembers = members.filter((m) => m.id !== primaryId).map(mapToMember);
    },
  },
});
</script>
