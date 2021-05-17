<template>
  <case-file-list-item-wrapper v-if="content" :item="item" :sidebar-icon="icon">
    <div slot="content" class="d-flex flex-column" data-test="caseFileActivity-listItem-content">
      <div class="rc-body16 fw-bold" data-test="caseFileActivity-listItem-content-title">
        {{ content.title }}
      </div>
      <div class="rc-body14" data-test="caseFileActivity-listItem-content-body">
        {{ content.body }}
      </div>
    </div>
  </case-file-list-item-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import CaseFileListItemWrapper from '@/ui/views/pages/case-files/details/components/CaseFileListItemWrapper.vue';
import { ECaseFileActivityType, ICaseFileActivity } from '@/entities/case-file';
import { IIdMultilingualName } from '@/types';

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

        default:
          return null;
      }
    },

    icon(): string {
      switch (this.item.activityType) {
        case ECaseFileActivityType.AddedTag:
        case ECaseFileActivityType.RemovedTag:
          return '$rctech-actions';

        case ECaseFileActivityType.AddedDuplicateFlag:
        case ECaseFileActivityType.RemovedDuplicateFlag:
          return '$rctech-duplicate';

        default:
          return 'mdi-message-text';
      }
    },

  },

  methods: {
    makeContentForTags(activityType:ECaseFileActivityType): {title: TranslateResult, body: TranslateResult} {
      const title = this.$t(`caseFileActivity.activityList.title.${ECaseFileActivityType[activityType]}`);

      const tagsString = this.item.details.tags.map((tag: IIdMultilingualName) => this.$m(tag.name)).join(', ');
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
  },
});
</script>
