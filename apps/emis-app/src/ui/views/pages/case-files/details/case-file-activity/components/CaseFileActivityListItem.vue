<template>
  <case-file-list-item-wrapper v-if="content" :item="item" :sidebar-icon="icon">
    <div slot="content" class="d-flex flex-column" data-test="caseFileActivity-listItem-content">
      <div class="rc-body16 fw-bold" data-test="caseFileActivity-listItem-content-title">
        {{ content.title }}
      </div>
      <div v-if="content.body" data-test="caseFileActivity-listItem-content-body">
        <span class="rc-body14 content-body">{{ content.body }}</span>
      </div>
    </div>
  </case-file-list-item-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import CaseFileListItemWrapper from '@/ui/views/pages/case-files/details/components/CaseFileListItemWrapper.vue';
import {
  CaseFileActivityType,
  HouseholdCaseFileActivityType,
  ICaseFileActivity,
  IdentityAuthenticationStatus,
  RegistrationType,
  ValidationOfImpactStatus,
} from '@libs/entities-lib/case-file';
import { ERegistrationMethod, IIdMultilingualName, IMultilingual } from '@libs/shared-lib/types';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { ApprovalAction } from '@libs/entities-lib/financial-assistance-payment';

export interface IAssignInfo {
  id: string;
  name: string;
}

export interface IAssignTeamMembersActivity {
  team: IAssignInfo,
  teamMembers: IAssignInfo[]
}

export default Vue.extend({
  name: 'CaseFileActivityListItem',
  components: {
    CaseFileListItemWrapper,
  },

  props: {
    item: {
      type: Object as () => ICaseFileActivity,
      required: true,
    },
  },

  computed: {
    // eslint-disable-next-line
    content(): {title: TranslateResult, body: TranslateResult} {
      const { activityType } = this.item;
      switch (activityType) {
        case CaseFileActivityType.AddedTag:
        case CaseFileActivityType.RemovedTag:
          return this.makeContentForTags(activityType);

        case CaseFileActivityType.AddedDuplicateFlag:
          return this.makeContentForAddedDuplicateFlag();

        case CaseFileActivityType.RemovedDuplicateFlag:
          return this.makeContentForRemovedDuplicateFlag();

        case CaseFileActivityType.TriageUpdated:
          return this.makeContentForTriageUpdated();

        case CaseFileActivityType.CaseFileStatusDeactivated:
          return this.makeContentForCaseFileStatusDeactivated();

        case CaseFileActivityType.CaseFileStatusClosed:
          return this.makeContentForCaseFileStatusClosed();

        case CaseFileActivityType.CaseFileStatusArchived:
          return this.makeContentForCaseFileStatusArchived();

        case CaseFileActivityType.CaseFileStatusReopened:
          return this.makeContentForCaseFileStatusReopened();

        case CaseFileActivityType.AssignedToCaseFile:
          return this.makeContentForAssignedToCaseFile();

        case CaseFileActivityType.UnassignedFromCaseFile:
          return this.makeContentForUnassignedFromCaseFile();

        case CaseFileActivityType.IdentityAuthenticationUpdatedStatus:
          return this.makeContentForIdentityAuthenticationUpdatedStatus();

        case CaseFileActivityType.IdentityAuthenticationUpdatedId:
          return this.makeContentForIdentityAuthenticationUpdatedId();

        case CaseFileActivityType.ImpactStatusValidationUpdated:
          return this.makeContentForImpactStatusValidationUpdated();

        case CaseFileActivityType.ReferralAdded:
          return this.makeContentForReferralAdded();

        case CaseFileActivityType.ReferralUpdated:
          return this.makeContentForReferralUpdated();

        case CaseFileActivityType.DocumentDeactivated:
          return this.makeContentForDocumentDeactivated();

        case CaseFileActivityType.DocumentUpdated:
          return this.makeContentForDocumentUpdated();

        case CaseFileActivityType.DocumentAdded:
          return this.makeContentForDocumentAdded();

        case CaseFileActivityType.CaseNoteAdded:
        case CaseFileActivityType.CaseNoteUpdated:
          return this.makeContentForCaseNote(activityType);

        case CaseFileActivityType.Registration:
          return this.makeContentForRegistration();

        case CaseFileActivityType.PaymentSubmitted:
          return this.makeContentForFinancialAssistancePaymentSubmit();

        case CaseFileActivityType.HouseholdEdited:
          return this.makeContentForHouseholdEdited();

        case CaseFileActivityType.HouseholdSplit:
          return this.makeContentForHouseholdSplit();

        case CaseFileActivityType.HouseholdCreatedAfterSplit:
          return this.makeContentForHouseholdCreatedAfterSplit();

        case CaseFileActivityType.HouseholdMovedMembersOut:
          return this.makeContentForHouseholdMovedMembersOut();

        case CaseFileActivityType.HouseholdMovedMembersIn:
          return this.makeContentForHouseholdMovedMembersIn();

        case CaseFileActivityType.PaymentCompleted:
          return this.makeContentForFinancialAssistancePaymentCompleted();

        case CaseFileActivityType.AssessmentCompleted:
          return this.makeContentForAssessmentCompleted();

        case CaseFileActivityType.FinancialAssistancePayment:
          return this.makeContentForFinancialAssistancePayment();

        default:
          return null;
      }
    },

    // eslint-disable-next-line
    icon(): string {
      switch (this.item.activityType) {
        case CaseFileActivityType.AddedTag:
        case CaseFileActivityType.RemovedTag:
        case CaseFileActivityType.TriageUpdated:
        case CaseFileActivityType.CaseFileStatusDeactivated:
        case CaseFileActivityType.CaseFileStatusArchived:
        case CaseFileActivityType.AssignedToCaseFile:
        case CaseFileActivityType.UnassignedFromCaseFile:
        case CaseFileActivityType.ReferralAdded:
        case CaseFileActivityType.ReferralUpdated:
        case CaseFileActivityType.DocumentDeactivated:
        case CaseFileActivityType.DocumentAdded:
        case CaseFileActivityType.DocumentUpdated:
          return '$rctech-actions';

        case CaseFileActivityType.AddedDuplicateFlag:
        case CaseFileActivityType.RemovedDuplicateFlag:
          return '$rctech-duplicate';

        case CaseFileActivityType.CaseFileStatusClosed:
          return 'mdi-lock';

        case CaseFileActivityType.CaseFileStatusReopened:
          return 'mdi-lock-open';

        case CaseFileActivityType.IdentityAuthenticationUpdatedStatus:
        case CaseFileActivityType.IdentityAuthenticationUpdatedId:
          return 'mdi-shield-check';

        case CaseFileActivityType.ImpactStatusValidationUpdated:
          return 'mdi-map-check';

        case CaseFileActivityType.PaymentCompleted:
        case CaseFileActivityType.FinancialAssistancePayment:
          return 'mdi-currency-usd';

        default:
          return 'mdi-message-text';
      }
    },

  },

  methods: {
    makeContentForTags(activityType:CaseFileActivityType): { title: TranslateResult, body: TranslateResult } {
      const title = this.$t(`caseFileActivity.activityList.title.${CaseFileActivityType[activityType]}`);

      const tagsString = (this.item.details.tags as IIdMultilingualName[]).map((tag) => this.$m(tag.name)).join(', ');
      const body = `${this.$t('caseFileActivity.activityList.tags.tag_names')}: ${tagsString}`;

      return { title, body };
    },

    makeContentForAddedDuplicateFlag(): { title: TranslateResult, body: TranslateResult } {
      return {
        title: this.$t('caseFileActivity.activityList.title.addedDuplicateFlag'),
        body: this.$t('DuplicateStatus.Added'),
      };
    },

    makeContentForRemovedDuplicateFlag(): { title: TranslateResult, body: TranslateResult } {
      return {
        title: this.$t('caseFileActivity.activityList.title.removedDuplicateFlag'),
        body: this.$t('DuplicateStatus.Removed'),
      };
    },

    makeContentForTriageUpdated(): { title: TranslateResult, body: TranslateResult } {
      return {
        title: this.$t('caseFileActivity.activityList.title.triageUpdated'),
        body: `${this.$t('caseFileActivity.activityList.triage.new_triage')}: ${this.$m(this.item.details.triageName as IMultilingual)}`,
      };
    },

    makeContentForCaseFileStatusDeactivated(): { title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.CaseFileStatusDeactivated');

      const reasonString = this.$m((this.item.details.reason as IIdMultilingualName).name);
      const rationaleString = this.item.details.rationale as string;
      let body = `${this.$t('caseFileActivity.activityList.status.reason')}: ${reasonString}`;
      if (rationaleString) {
        body = body.concat(`\n${this.$t('caseFileActivity.activityList.status.rationale')}: ${rationaleString}`);
      }
      return { title, body };
    },

    makeContentForCaseFileStatusClosed(): { title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.CaseFileStatusClosed');

      const reasonString = this.$m((this.item.details.reason as IIdMultilingualName).name);
      const rationaleString = this.item.details.rationale as string;

      const body = `${this.$t('caseFileActivity.activityList.status.reason')}: ${reasonString}`
      + `\n${this.$t('caseFileActivity.activityList.status.rationale')}: ${rationaleString}`;
      return { title, body };
    },

    makeContentForCaseFileStatusReopened(): { title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.CaseFileStatusReopened');
      const rationaleString = this.item.details.rationale as string;
      const body = `${this.$t('caseFileActivity.activityList.status.rationale')}: ${rationaleString}`;
      return { title, body };
    },

    makeContentForCaseFileStatusArchived(): { title: TranslateResult, body: TranslateResult } {
      return {
        title: this.$t('caseFileActivity.activityList.title.CaseFileStatusArchived'),
        body: null,
      };
    },

    makeContentForAssignedToCaseFile():{ title: TranslateResult, body: TranslateResult } {
      let title = null;
      let body = null;
      const teams = (this.item.details.teams as { name: string }[]).map((i) => i.name);

      if (this.item.details.teamMembers) {
        const usersWithTeams = [] as string[];
        (this.item.details.teamMembers as IAssignTeamMembersActivity[]).forEach((t) => {
          t.teamMembers.forEach((m) => {
            usersWithTeams.push(`${m.name}, ${t.team.name}`);
          });
        });

        if ((usersWithTeams).length + (teams).length === 1) {
          const name = usersWithTeams[0] || teams[0];
          title = this.$t('caseFileActivity.activityList.title.AssignedToCaseFile', { x: name });
        } else {
          title = this.$t('caseFileActivity.activityList.title.assigned_new_users_teams');
          body = `${this.$t('caseFileActivity.activityList.assign.new_user')}: ${usersWithTeams.length ? usersWithTeams.join('; ') : '-'}`
            + `\n${this.$t('caseFileActivity.activityList.assign.new_team')}: ${teams.length ? teams.join('; ') : '-'}`;
        }
      } else { // TODO: Remove when EMISV2-4373
        const individuals = (this.item.details.individuals as { name: string }[]).map((i) => i.name);
        if ((individuals).length + (teams).length === 1) {
          const name = individuals[0] || teams[0];
          title = this.$t('caseFileActivity.activityList.title.AssignedToCaseFile', { x: name });
        } else {
          title = this.$t('caseFileActivity.activityList.title.assigned_new_users_teams');
          body = `${this.$t('caseFileActivity.activityList.assign.new_user')}: ${individuals.length ? individuals.join(', ') : '-'}`
            + `\n${this.$t('caseFileActivity.activityList.assign.new_team')}: ${teams.length ? teams.join(', ') : '-'}`;
        }
      }

      return { title, body };
    },

    makeContentForUnassignedFromCaseFile(): { title: TranslateResult, body: TranslateResult } {
      if (this.item.details.teamMembers) {
        const usersWithTeams = [] as string[];
        (this.item.details.teamMembers as IAssignTeamMembersActivity[]).forEach((t) => {
          t.teamMembers.forEach((m) => {
            usersWithTeams.push(`${m.name}, ${t.team.name}`);
          });
        });

        const names = [...usersWithTeams, ...(this.item.details.teams as { name: string }[]).map((i) => i.name)]
          .join(', ');

        const title = this.$t('caseFileActivity.activityList.title.UnassignedFromCaseFile', { x: names });
        return { title, body: null };
      }
      // TODO: Remove when EMISV2-4373
      const names = ([...this.item.details.individuals as { name: string }[], ...this.item.details.teams as { name: string }[]])
        .map((i) => i.name)
        .join(', ');

      const title = this.$t('caseFileActivity.activityList.title.UnassignedFromCaseFile', { x: names });

      return { title, body: null };
    },

    makeContentForIdentityAuthenticationUpdatedStatus():{ title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.IdentityAuthenticationUpdated');

      let body = `${this.$t('caseFileActivity.activityList.identity_authentication_updated')}: `;
      switch (this.item.details.status) {
        case IdentityAuthenticationStatus.Passed:
          body += this.$t('caseFile.beneficiaryIdentityVerificationStatus.Passed');
          break;
        case IdentityAuthenticationStatus.Failed:
          body += this.$t('caseFile.beneficiaryIdentityVerificationStatus.Failed');
          break;
        default:
          body += this.$t('caseFile.beneficiaryIdentityVerificationStatus.NotVerified');
          break;
      }

      return { title, body };
    },

    makeContentForIdentityAuthenticationUpdatedId():{ title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.IdentityAuthenticationUpdatedId');
      const body = this.$t('caseFileActivity.activityList.title.IdentityAuthenticationUpdatedId.idUpdated');
      return { title, body };
    },

    makeContentForImpactStatusValidationUpdated():{ title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.ImpactStatusValidationUpdated');

      let body = `${this.$t('caseFileActivity.activityList.impact_status_validation_updated')}: `;
      switch (this.item.details.status) {
        case ValidationOfImpactStatus.Impacted:
          body += this.$t('caseFile.beneficiaryImpactValidationStatus.Impacted');
          break;
        case ValidationOfImpactStatus.NotImpacted:
          body += this.$t('caseFile.beneficiaryImpactValidationStatus.NotImpacted');
          break;
        default:
          body += this.$t('caseFile.beneficiaryImpactValidationStatus.Undetermined');
          break;
      }

      return { title, body };
    },

    makeContentForReferralAdded(): { title: TranslateResult, body: TranslateResult } {
      return {
        title: this.$t('caseFileActivity.activityList.title.ReferralAdded'),
        body: `${this.$t('caseFileActivity.activityList.referral.referral_name')}: ${this.item.details.name}`,
      };
    },

    makeContentForReferralUpdated(): { title: TranslateResult, body: TranslateResult } {
      return {
        title: this.$t('caseFileActivity.activityList.title.ReferralUpdated'),
        body: `${this.$t('caseFileActivity.activityList.referral.referral_name')}: ${this.item.details.name}`,
      };
    },

    makeContentForDocumentDeactivated(): { title: TranslateResult, body: TranslateResult } {
      return {
        title: this.$t('caseFileActivity.activityList.title.DocumentDeactivated'),
        body: `${this.$t('caseFileActivity.activityList.document.document_name')}: ${this.item.details.name}`,
      };
    },

    makeContentForDocumentUpdated(): { title: TranslateResult, body: TranslateResult } {
      return {
        title: this.$t('caseFileActivity.activityList.title.DocumentUpdated'),
        body: `${this.$t('caseFileActivity.activityList.document.document_name')}: ${this.item.details.name}`,
      };
    },

    makeContentForDocumentAdded(): { title: TranslateResult, body: TranslateResult } {
      return {
        title: this.$t('caseFileActivity.activityList.title.DocumentAdded'),
        body: `${this.$t('caseFileActivity.activityList.document.document_name')}: ${this.item.details.name}`,
      };
    },

    makeContentForCaseNote(activityType:CaseFileActivityType): { title: TranslateResult, body: TranslateResult } {
      const title = this.$t(`caseFileActivity.activityList.title.${CaseFileActivityType[activityType]}`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const category = (this.item.details.caseNoteCategory as any).name.translation[this.$i18n.locale];
      let body = `${this.$t('caseFileActivity.activityList.caseNote.subject')}: ${this.item.details.subject}`;
      body += `\n${this.$t('caseFileActivity.activityList.caseNote.category')}: ${category}`;

      return { title, body };
    },

    makeContentForRegistration(): { title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.Registration');
      let body = '';
      if (this.item.details.registrationType === RegistrationType.Crc) {
        body += this.$t(
          'caseFileActivity.activityList.body.CRCRegistration',
          {
            By: this.item.user.name,
          },
        );
        if (this.item.details.registrationMethod) {
          body += `\n${this.$t('caseFileActivity.activityList.body.registrationMethod')}: `;
          body += this.$t(`enums.RegistrationMethod.${ERegistrationMethod[this.item.details.registrationMethod as number]}`);
          if (this.item.details.registrationMethod === ERegistrationMethod.InPerson && this.item.details.registrationLocation) {
            body += `\n${this.$t('caseFileActivity.activityList.body.registrationLocation')}: `;
            body += this.$m(this.item.details.registrationLocation as IMultilingual);
          }
        }
      } else {
        body += this.$t('caseFileActivity.activityList.body.PublicRegistration');
      }

      return { title, body };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    },

    makeContentForFinancialAssistancePaymentSubmit(): { title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.PaymentSubmitted');
      const amount = this.$formatCurrency(Number(this.item.details.totalAmount));
      const body = `${this.item.details.paymentName}: ${amount}`;
      return { title, body };
    },

    makeContentForHouseholdEdited(): { title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.HouseholdEdited');
      const body = this.makeHouseholdEditedBody();
      return { title, body };
    },

    makeContentForHouseholdSplit(): { title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.HouseholdSplitTo', { x: this.item.details.registrationNumber });
      const body = this.$t('caseFileActivity.activityList.body.HouseholdSplit')
        + (this.item.details?.removedMembers as [] || []).map((m: { name: string }) => m.name).join(', ');
      return { title, body };
    },

    makeContentForHouseholdCreatedAfterSplit(): { title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.HouseholdSplitFrom', { x: this.item.details.registrationNumber });
      const body = this.$t('caseFileActivity.activityList.body.HouseholdSplit')
        + (this.item.details?.removedMembers as [] || []).map((m: { name: string }) => m.name).join(', ');
      return { title, body };
    },

    makeContentForHouseholdMovedMembersOut(): { title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.HouseholdMovedMembersOut', { x: this.item.details.registrationNumber });
      const body = this.$t('caseFileActivity.activityList.body.HouseholdMovedMembers')
        + (this.item.details?.members as [] || []).map((m: { name: string }) => m.name).join(', ');
      return { title, body };
    },

    makeContentForHouseholdMovedMembersIn(): { title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.HouseholdMovedMembersIn', { x: this.item.details.registrationNumber });
      const body = this.$t('caseFileActivity.activityList.body.HouseholdMovedMembers')
        + (this.item.details?.members as [] || []).map((m: { name: string }) => m.name).join(', ');
      return { title, body };
    },

    makeContentForFinancialAssistancePaymentCompleted(): { title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.PaymentCompleted');
      const amount = this.$formatCurrency(Number(this.item.details.totalAmount));
      let body = `${this.$t('caseFileActivity.activityList.body.paymentCompleted.name')}: ${this.item.details.paymentName}`;
      body += `\n${this.$t('caseFileActivity.activityList.body.paymentCompleted.modality')}: `;
      body += this.$t(`enums.PaymentModality.${EPaymentModalities[this.item.details.paymentModality as number]}`);
      body += `\n${this.$t('caseFileActivity.activityList.body.paymentCompleted.amount')}: ${amount}`;
      return { title, body };
    },

    makeContentForFinancialAssistancePayment(): {title: TranslateResult, body: TranslateResult} {
      let title = `${this.$t('caseFileActivity.activityList.title.FinancialAssistancePayment')} - `;
      title += this.$t(`enums.approvalAction.${ApprovalAction[this.item.details.approvalAction as number]}`);
      const amount = this.$formatCurrency(Number(this.item.details.totalAmount));
      let body = `${this.$t('caseFileActivity.activityList.body.paymentCompleted.name')}: ${this.item.details.paymentName}`;
      body += `\n${this.$t('caseFileActivity.activityList.body.paymentCompleted.amount')}: ${amount}`;
      return { title, body };
    },

    makeHouseholdEditedBody(): TranslateResult {
      const name = (this.item.details?.member as { name:string })?.name;
      const displayedName = name ? `: ${name}` : '';

      switch (this.item.details?.householdActivityType as HouseholdCaseFileActivityType) {
        case HouseholdCaseFileActivityType.IdentitySetEdited:
          return this.$t('household.history.action.personal_information_changed');
        case HouseholdCaseFileActivityType.ContactInformationEdited:
          return this.$t('household.history.action.contact_information_changed');
        case HouseholdCaseFileActivityType.TempAddressEdited:
          return this.$t('household.history.action.temporary_address_changed');
        case HouseholdCaseFileActivityType.HomeAddressEdited:
          return this.$t('household.history.action.address_information_changed');
        case HouseholdCaseFileActivityType.MemberAdded:
          return `${this.$t('household.history.action.household_member_added')}${displayedName}`;
        case HouseholdCaseFileActivityType.MemberRemoved:
          return `${this.$t('household.history.action.household_member_removed')}${displayedName}`;
        case HouseholdCaseFileActivityType.PrimaryAssigned:
          return `${this.$t('household.history.action.household_member_assign_primary')}${displayedName}`;

        default:
          return '';
      }
    },

    makeContentForAssessmentCompleted(): { title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.AssessmentCompleted');
      const name = this.$m(this.item.details.assessmentName as IMultilingual);
      const body = this.$t('caseFileActivity.activityList.body.assessmentCompleted.name', { x: name });

      return { title, body };
    },
  },
});
</script>

<style scoped lang="scss">
  .content-body {
    white-space: pre-line;
  }
</style>
