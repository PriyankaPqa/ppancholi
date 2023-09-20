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
  IdentityAuthenticationMethod,
  RegistrationType,
  ValidationOfImpactStatus,
} from '@libs/entities-lib/case-file';
import { ERegistrationMethod, IIdMultilingualName, IMultilingual } from '@libs/shared-lib/types';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { ApprovalAction } from '@libs/entities-lib/financial-assistance-payment';
import { HouseholdStatus } from '@libs/entities-lib/household';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import { useEventStore } from '@/pinia/event/event';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

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
  data() {
    return {
      FeatureKeys,
    };
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

        case CaseFileActivityType.AssessmentAdded:
          return this.makeContentForAssessmentAdded();

        case CaseFileActivityType.AssessmentCompleted:
          return this.makeContentForAssessmentCompleted();

        case CaseFileActivityType.FinancialAssistancePayment:
          return this.makeContentForFinancialAssistancePayment();

        case CaseFileActivityType.CaseFileLabelsUpdated:
          return this.makeContentForCaseFileLabelsUpdated();

        case CaseFileActivityType.PaymentCorrected:
          return this.makeContentForFinancialAssistancePaymentCorrected();

        case CaseFileActivityType.HouseholdStatusChanged:
          return this.makeContentForHouseholdStatusChanged();

        case CaseFileActivityType.TempAddressUpdated:
        case CaseFileActivityType.ImpactedIndividualReceivingAssistance:
        case CaseFileActivityType.ImpactedIndividualNoLongerReceivingAssistance:
          return this.makeContentForImpactedIndividualsEdited();

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
        case CaseFileActivityType.TempAddressUpdated:
        case CaseFileActivityType.ImpactedIndividualReceivingAssistance:
        case CaseFileActivityType.ImpactedIndividualNoLongerReceivingAssistance:
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
        case CaseFileActivityType.PaymentCorrected:
        case CaseFileActivityType.FinancialAssistancePayment:
          return 'mdi-currency-usd';

        default:
          return 'mdi-message-text';
      }
    },
  },
  async created() {
    await useCaseFileStore().fetchScreeningIds();
    await useEventStore().fetchExceptionalAuthenticationTypes();
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
      } else { // To keep to support case file activities with old format
       try {
         const individuals = (this.item.details.individuals as { name: string }[]).map((i) => i.name);
         if ((individuals).length + (teams).length === 1) {
           const name = individuals[0] || teams[0];
           title = this.$t('caseFileActivity.activityList.title.AssignedToCaseFile', { x: name });
         } else {
           title = this.$t('caseFileActivity.activityList.title.assigned_new_users_teams');
           body = `${this.$t('caseFileActivity.activityList.assign.new_user')}: ${individuals.length ? individuals.join(', ') : '-'}`
             + `\n${this.$t('caseFileActivity.activityList.assign.new_team')}: ${teams.length ? teams.join(', ') : '-'}`;
         }
       } catch (e) { /* empty */ }
      }
      return { title, body };
    },

    makeContentForUnassignedFromCaseFile(): { title: TranslateResult, body: TranslateResult } {
      let title = null;
      let names = '';
      if (this.item.details.teamMembers) {
        const usersWithTeams = [] as string[];
        (this.item.details.teamMembers as IAssignTeamMembersActivity[]).forEach((t) => {
          t.teamMembers.forEach((m) => {
            usersWithTeams.push(`${m.name}, ${t.team.name}`);
          });
        });

        names = [...usersWithTeams, ...(this.item.details.teams as { name: string }[]).map((i) => i.name)]
          .join(', ');

        title = this.$t('caseFileActivity.activityList.title.UnassignedFromCaseFile', { x: names });
      } else {
        // Keep to be compatible with old activity format
        try {
          names = ([...this.item.details.individuals as { name: string }[], ...this.item.details.teams as { name: string }[]])
            .map((i) => i.name)
            .join(', ');

          title = this.$t('caseFileActivity.activityList.title.UnassignedFromCaseFile', { x: names });
        } catch (e) { /* empty */ }
      }
      return { title, body: null };
    },

    // will not be needed when AuthenticationPhaseII feature flag is removed
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
      let body = this.$hasFeature(FeatureKeys.AuthenticationPhaseII) ? '' : this.$t('caseFileActivity.activityList.title.IdentityAuthenticationUpdatedId.idUpdated');
      if (this.$hasFeature(FeatureKeys.AuthenticationPhaseII)) {
        // this too lengthy for tenary
        if (this.item.details.status === this.item.details.previousStatus) {
          body += `${this.$t('caseFileActivity.activityList.identity_authentication_status')}: `;
        } else {
          body += `${this.$t('caseFileActivity.activityList.identity_authentication_updated')}: `;
        }
        switch (this.item.details.status) {
          case IdentityAuthenticationStatus.Passed:
            body += `${this.$t('caseFile.beneficiaryIdentityVerificationStatus.Passed')}`;
            break;
          case IdentityAuthenticationStatus.Failed:
            body += `${this.$t('caseFile.beneficiaryIdentityVerificationStatus.Failed')}`;
            break;
          default:
            body += `${this.$t('caseFile.beneficiaryIdentityVerificationStatus.NotVerified')}`;
            break;
        }

        switch (this.item.details.method) {
          case IdentityAuthenticationMethod.Exceptional:
            body += `\n${this.$t('caseFileDetail.verifyIdentityDialog.method')}: ${this.$t('caseFile.verifyMethod.Exceptional')}`;
            break;
          case IdentityAuthenticationMethod.InPerson:
            body += `\n${this.$t('caseFileDetail.verifyIdentityDialog.method')}: ${this.$t('caseFile.verifyMethod.InPerson')}`;
            break;
          default:
              // need only two case
            break;
        }

        const exceptionalTypeId = this.item.details.exceptionalAuthenticationTypeId as any;
        const exceptionalType = useEventStore().getExceptionalAuthenticationTypes().find((item: { id: any; }) => item.id === exceptionalTypeId?.optionItemId);
        const otherId = exceptionalTypeId?.specifiedOther;
        body += (exceptionalType) ? `\n${this.$t('caseFileDetail.verifyIdentityDialog.exceptionalType')}: ${otherId ?? this.$m(exceptionalType.name)}` : '';
        const identificationIds = this.item.details.identificationIds as Record<string, any>;
        const identifications = identificationIds?.map((id: any) => {
          const foundItem = useCaseFileStore().getScreeningIds().find((item: { id: any; }) => item.id === id.optionItemId);
          return foundItem ? id.specifiedOther ?? this.$m(foundItem.name) : '';
        });

        body += (identifications && identifications.length > 0) ? `\n${this.$t('caseFileDetail.verifyIdentityDialog.options')}: ${identifications.join(', ')}` : '';
      }
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
       body += this.makeHouseholdRegistrationDetailsBody(this.item.details);
      } else {
        body += this.$t('caseFileActivity.activityList.body.PublicRegistration.individual');
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

    makeContentForFinancialAssistancePayment(): { title: TranslateResult, body: TranslateResult } {
      let title = `${this.$t('caseFileActivity.activityList.title.FinancialAssistancePayment')} - `;
      title += this.$t(`enums.approvalAction.${ApprovalAction[this.item.details.approvalAction as number]}`);
      const amount = this.$formatCurrency(Number(this.item.details.totalAmount));
      let body = `${this.$t('caseFileActivity.activityList.body.paymentCompleted.name')}: ${this.item.details.paymentName}`;
      body += `\n${this.$t('caseFileActivity.activityList.body.paymentCompleted.amount')}: ${amount}`;
      return { title, body };
    },

    makeContentForFinancialAssistancePaymentCorrected(): { title: TranslateResult, body: TranslateResult } {
      const title = `${this.$t('caseFileActivity.activityList.title.FinancialAssistancePaymentUpdated')}`;
      const body = this.$t('caseFileActivity.activityList.body.paymentDataCorrected', { x: this.item.details.paymentName });
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
          return `${this.$t('household.history.action.household_member_assign_primary')}${displayedName}${
           this.makeHouseholdRegistrationDetailsBody(this.item.details)}`;
        default:
          return '';
      }
    },

    makeHouseholdRegistrationDetailsBody(details: Record<string, unknown>) : TranslateResult {
      let body = '';
      if (details?.registrationMethod) {
        body += `\n${this.$t('caseFileActivity.activityList.body.registrationMethod')}: `;
        body += this.$t(`enums.RegistrationMethod.${ERegistrationMethod[details.registrationMethod as number]}`);

        if (details.registrationMethod === ERegistrationMethod.InPerson && details.registrationLocation) {
          body += `\n${this.$t('caseFileActivity.activityList.body.registrationLocation')}: `;
          body += this.$m(this.item.details.registrationLocation as IMultilingual);
          if (details.eventName) {
            body += ` - ${this.$m(details.eventName as IMultilingual)}`;
          }
        }
      }

      return body;
    },

    makeContentForAssessmentAdded(): { title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.AssessmentAdded');
      const name = this.$m(this.item.details.assessmentName as IMultilingual);
      const body = this.$t('caseFileActivity.activityList.body.assessmentAdded.name', { x: name });

      return { title, body };
    },

    makeContentForAssessmentCompleted(): { title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.AssessmentCompleted');
      const name = this.$m(this.item.details.assessmentName as IMultilingual);
      const body = this.$t('caseFileActivity.activityList.body.assessmentCompleted.name', { x: name });

      return { title, body };
    },

    makeContentForCaseFileLabelsUpdated(): { title: TranslateResult, body: TranslateResult } {
      const title = this.$t('caseFileActivity.activityList.title.CaseFileLabelsUpdated');
      let body = `${this.$t('caseFileActivity.activityList.body.PreviousLabels')}: `;
      body += (this.item.details.previousLabels as [])
        .filter((label : Record<string, any>) => (label.name as string).trim().length > 0)
        .map((label : Record<string, any>) => label.name).join(' | ');

      body += `\n${this.$t('caseFileActivity.activityList.body.NewLabels')}: `;
      body += (this.item.details.newLabels as [])
        .filter((label : Record<string, any>) => (label.name as string).trim().length > 0)
        .map((label : Record<string, any>) => label.name).join(' | ');

      return { title, body };
    },

    makeContentForHouseholdStatusChanged(): { title: TranslateResult, body: TranslateResult } {
      const rationale = this.item.details.rationale as IMultilingual;
      const title = this.$t('caseFileActivity.activityList.title.HouseholdEdited');
      let body = `${this.$t('caseFileActivity.activityList.body.HouseholdStatusChanged')}`;
      body += `\n${this.$t(`household.profile.householdStatus.${HouseholdStatus[(this.item.details.oldHouseholdStatus) as HouseholdStatus]}`)}`;
      body += ` ${this.$t('caseFileActivity.activityList.body.HouseholdStatusChanged.to')} `;
      body += `${this.$t(`household.profile.householdStatus.${HouseholdStatus[(this.item.details.newHouseholdStatus) as HouseholdStatus]}`)}`;
      body += `\n${this.$m(rationale) || rationale.translation[this.$i18n.fallbackLocale as string]}`;

      return { title, body };
    },

    makeContentForImpactedIndividualsEdited(): { title: TranslateResult, body: TranslateResult | string } {
      const contentObject: { [index: number ]: TranslateResult | string } = {
        [CaseFileActivityType.TempAddressUpdated]: this.$t('caseFileActivity.activityList.body.temporaryAddressUpdated'),
        [CaseFileActivityType.ImpactedIndividualReceivingAssistance]: `${this.$t('caseFileActivity.activityList.body.receivingAssistance')} \n${this.item.details.rationale}`,
        [CaseFileActivityType.ImpactedIndividualNoLongerReceivingAssistance]:
          `${this.$t('caseFileActivity.activityList.body.noLongerReceivingAssistance')} \n${this.item.details.rationale}`,
      };
      const title = this.$t('caseFileActivity.activityList.title.ImpactedIndividualsEdited');
      let body = `${(this.item.details.member as any).name} - `;
      body += contentObject[this.item.activityType as CaseFileActivityType];
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
