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
import { ECaseFileActivityType, ICaseFileActivity, IdentityAuthenticationStatus, ValidationOfImpactStatus  } from '@/entities/case-file';
import { IIdMultilingualName, IMultilingual } from '@/types';

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
    content(): {title: TranslateResult, body: TranslateResult} {
      const { activityType } = this.item;

      switch (activityType) {
        case ECaseFileActivityType.AddedTag:
        case ECaseFileActivityType.RemovedTag:
          return this.makeContentForTags(activityType);

        case ECaseFileActivityType.AddedDuplicateFlag:
          return this.makeContentForAddedDuplicateFlag();

        case ECaseFileActivityType.RemovedDuplicateFlag:
          return this.makeContentForRemovedDuplicateFlag();

        case ECaseFileActivityType.TriageUpdated:
          return this.makeContentForTriageUpdated();

        case ECaseFileActivityType.CaseFileStatusDeactivated:
          return this.makeContentForCaseFileStatusDeactivated();

        case ECaseFileActivityType.CaseFileStatusClosed:
          return this.makeContentForCaseFileStatusClosed();

        case ECaseFileActivityType.CaseFileStatusArchived:
          return this.makeContentForCaseFileStatusArchived();

        case ECaseFileActivityType.CaseFileStatusReopened:
          return this.makeContentForCaseFileStatusReopened();

        case ECaseFileActivityType.AssignedToCaseFile:
          return this.makeContentForAssignedToCaseFile();

        case ECaseFileActivityType.UnassignedFromCaseFile:
          return this.makeContentForUnassignedFromCaseFile();

        case ECaseFileActivityType.IdentityAuthenticationUpdated:
          return this.makeContentForIdentityAuthenticationUpdated();

        case ECaseFileActivityType.ImpactStatusValidationUpdated:
          return this.makeContentForImpactStatusValidationUpdated();

        default:
          return null;
      }
    },

    icon(): string {
      switch (this.item.activityType) {
        case ECaseFileActivityType.AddedTag:
        case ECaseFileActivityType.RemovedTag:
        case ECaseFileActivityType.TriageUpdated:
        case ECaseFileActivityType.CaseFileStatusDeactivated:
        case ECaseFileActivityType.CaseFileStatusArchived:
        case ECaseFileActivityType.AssignedToCaseFile:
        case ECaseFileActivityType.UnassignedFromCaseFile:
          return '$rctech-actions';

        case ECaseFileActivityType.AddedDuplicateFlag:
        case ECaseFileActivityType.RemovedDuplicateFlag:
          return '$rctech-duplicate';

        case ECaseFileActivityType.CaseFileStatusClosed:
          return 'mdi-lock';

        case ECaseFileActivityType.CaseFileStatusReopened:
          return 'mdi-lock-open';

        case ECaseFileActivityType.IdentityAuthenticationUpdated:
          return 'mdi-shield-check';

        case ECaseFileActivityType.ImpactStatusValidationUpdated:
          return 'mdi-map-check';

        default:
          return 'mdi-message-text';
      }
    },

  },

  methods: {
    makeContentForTags(activityType:ECaseFileActivityType): {title: TranslateResult, body: TranslateResult} {
      const title = this.$t(`caseFileActivity.activityList.title.${ECaseFileActivityType[activityType]}`);

      const tagsString = (this.item.details.tags as IIdMultilingualName[]).map((tag) => this.$m(tag.name)).join(', ');
      const body = `${this.$t('caseFileActivity.activityList.tags.tag_names')}: ${tagsString}`;

      return { title, body };
    },

    makeContentForAddedDuplicateFlag(): {title: TranslateResult, body: TranslateResult} {
      return {
        title: this.$t('caseFileActivity.activityList.title.addedDuplicateFlag'),
        body: this.$t('DuplicateStatus.Added'),
      };
    },

    makeContentForRemovedDuplicateFlag(): {title: TranslateResult, body: TranslateResult} {
      return {
        title: this.$t('caseFileActivity.activityList.title.removedDuplicateFlag'),
        body: this.$t('DuplicateStatus.Removed'),
      };
    },

    makeContentForTriageUpdated(): {title: TranslateResult, body: TranslateResult} {
      return {
        title: this.$t('caseFileActivity.activityList.title.triageUpdated'),
        body: `${this.$t('caseFileActivity.activityList.triage.new_triage')}: ${this.$m(this.item.details.triageName as IMultilingual)}`,
      };
    },

    makeContentForCaseFileStatusDeactivated(): {title: TranslateResult, body: TranslateResult} {
      const title = this.$t('caseFileActivity.activityList.title.CaseFileStatusDeactivated');

      const reasonString = this.$m((this.item.details.reason as IIdMultilingualName).name);
      const rationaleString = this.item.details.rationale as string;
      let body = `${this.$t('caseFileActivity.activityList.status.reason')}: ${reasonString}`;
      if (rationaleString) body = body.concat(`\n${this.$t('caseFileActivity.activityList.status.rationale')}: ${rationaleString}`);
      return { title, body };
    },

    makeContentForCaseFileStatusClosed(): {title: TranslateResult, body: TranslateResult} {
      const title = this.$t('caseFileActivity.activityList.title.CaseFileStatusClosed');

      const reasonString = this.$m((this.item.details.reason as IIdMultilingualName).name);
      const rationaleString = this.item.details.rationale as string;

      const body = `${this.$t('caseFileActivity.activityList.status.reason')}: ${reasonString}`
      + `\n${this.$t('caseFileActivity.activityList.status.rationale')}: ${rationaleString}`;
      return { title, body };
    },

    makeContentForCaseFileStatusReopened(): {title: TranslateResult, body: TranslateResult} {
      const title = this.$t('caseFileActivity.activityList.title.CaseFileStatusReopened');
      const rationaleString = this.item.details.rationale as string;
      const body = `${this.$t('caseFileActivity.activityList.status.rationale')}: ${rationaleString}`;
      return { title, body };
    },

    makeContentForCaseFileStatusArchived(): {title: TranslateResult, body: TranslateResult} {
      return {
        title: this.$t('caseFileActivity.activityList.title.CaseFileStatusArchived'),
        body: null,
      };
    },

    makeContentForAssignedToCaseFile():{title: TranslateResult, body: TranslateResult} {
      let title = null;
      let body = null;
      const individuals = (this.item.details.individuals as {name: string}[]).map((i) => i.name);
      const teams = (this.item.details.teams as {name: string}[]).map((i) => i.name);
      if ((individuals).length + (teams).length === 1) {
        const name = individuals[0] || teams[0];
        title = this.$t('caseFileActivity.activityList.title.AssignedToCaseFile', { x: name });
      } else {
        title = this.$t('caseFileActivity.activityList.title.assigned_new_users_teams');
        body = `${this.$t('caseFileActivity.activityList.assign.new_user')}: ${individuals.length ? individuals.join(', ') : '-'}`
      + `\n${this.$t('caseFileActivity.activityList.assign.new_team')}: ${teams.length ? teams.join(', ') : '-'}`;
      }

      return { title, body };
    },

    makeContentForUnassignedFromCaseFile():{title: TranslateResult, body: TranslateResult} {
      const names = ([...this.item.details.individuals as {name: string}[], ...this.item.details.teams as {name: string}[]])
        .map((i) => i.name)
        .join(', ');

      const title = this.$t('caseFileActivity.activityList.title.UnassignedFromCaseFile', { x: names });

      return { title, body: null };
    },

    makeContentForIdentityAuthenticationUpdated():{title: TranslateResult, body: TranslateResult} {
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

    makeContentForImpactStatusValidationUpdated():{title: TranslateResult, body: TranslateResult} {
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

  },
});
</script>

<style scoped lang="scss">
  .content-body {
    white-space: pre-line;
  }
</style>
