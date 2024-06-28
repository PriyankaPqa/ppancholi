<template>
  <case-file-list-item-wrapper v-if="itemData" :item="item" :sidebar-icon="icon">
    <div slot="content" class="d-flex flex-column" data-test="caseFileActivity-listItem-content">
      <div class="rc-body16 fw-bold" data-test="caseFileActivity-listItem-content-title">
        {{ $t('caseFileActivity.activityList.title.PaymentMoved') }}
      </div>
      <div data-test="caseFileActivity-listItem-content-body">
        <div>
          <span class="rc-body14 content-body" data-test="caseFileActivity-listItem-content-body-start">
            {{ bodyText }}
          </span>

          <router-link
            :to="getCaseFileRoutePreviousCaseFile()"
            class="rc-link14"
            :data-test="`caseFileActivity-listItem-content-body-previous-case-file-number-${item.details.previousCaseFileNumber}`">
            {{ `#${itemData.previousCaseFileNumber}` }}
          </router-link>

          <span class="rc-body14" data-test="caseFileActivity-listItem-content-body-to">
            {{ $t('caseFileActivity.activityList.body.PaymentMoved.To') }}
          </span>

          <router-link
            :to="getCaseFileRouteNewCaseFile()"
            class="rc-link14"
            :data-test="`caseFileActivity-listItem-content-body-new-case-file-number-${item.details.newCaseFileNumber}`">
            {{ `#${itemData.newCaseFileNumber}` }}
          </router-link>
        </div>
      </div>
    </div>
  </case-file-list-item-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import CaseFileListItemWrapper from '@/ui/views/pages/case-files/details/components/CaseFileListItemWrapper.vue';
import routes from '@/constants/routes';
import { ICaseFileActivity } from '@libs/entities-lib/case-file';
import { TranslateResult } from 'vue-i18n';

export default Vue.extend({
  name: 'CaseFileActivityPaymentMoved',
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
    itemData(): Record<string, unknown> {
      return this.item?.details;
    },

    bodyText(): TranslateResult {
      return this.$t(this.item.details.numberOfPaymentLines > 0 ? 'caseFileActivity.activityList.body.PaymentMoved.SomeLines'
                                                                : 'caseFileActivity.activityList.body.PaymentMoved.AllLines', {
        x: this.item.details.numberOfPaymentLines,
        y: this.item.details.paymentName,
      });
    },
  },

  methods: {
    getCaseFileRoutePreviousCaseFile() {
      return {
        name: routes.caseFile.details.name,
        params: {
          id: this.item.details.previousCaseFileId,
        },
      };
    },

    getCaseFileRouteNewCaseFile() {
      return {
        name: routes.caseFile.details.name,
        params: {
          id: this.item.details.newCaseFileId,
        },
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
