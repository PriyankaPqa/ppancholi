<template>
  <case-file-list-item-wrapper v-if="content" :item="item" :sidebar-icon="icon">
    <div slot="content" class="d-flex flex-column" data-test="caseFileActivity-listItem-content">
      <div class="rc-body16 fw-bold" data-test="caseFileActivity-listItem-content-title">
        {{ content.title }}
      </div>
      <div data-test="caseFileActivity-listItem-content-body">
        <span class="rc-body14 content-body">{{ content.body }}</span>
      </div>
    </div>
  </case-file-list-item-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import CaseFileListItemWrapper from '@/ui/views/pages/case-files/details/components/CaseFileListItemWrapper.vue';
import { ECaseFileActivityType, ICaseFileActivity } from '@/entities/case-file';
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
          return '$rctech-actions';

        case ECaseFileActivityType.AddedDuplicateFlag:
        case ECaseFileActivityType.RemovedDuplicateFlag:
          return '$rctech-duplicate';

        case ECaseFileActivityType.CaseFileStatusClosed:
          return 'mdi-lock';

        case ECaseFileActivityType.CaseFileStatusReopened:
          return 'mdi-lock-open';

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
  },
});
</script>

<style scoped lang="scss">
  .content-body {
    white-space: pre-line;
  }
</style>
