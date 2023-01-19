<template>
  <rc-page-content
    :title="canEdit ? $t('assessmentTemplateEdit.title') : $t('assessmentTemplateDetails.title')">
    <div v-if="assessmentForm">
      <div class="ma-4">
        <v-row class="justify-space-between">
          <h3>
            {{ $m(assessmentForm.name) }}
          </h3>
          <status-chip status-name="AssessmentResponseCompletionStatus" :status="assessmentResponse.completionStatus" />
        </v-row>
        <v-row class="stacked-details rc-body14">
          <div>
            <div>{{ $t('assessmentResponse.dateAssigned') }}:</div>
            <div>{{ moment(assessmentResponse.dateAssigned).format('ll') }}</div>
          </div>
          <div>
            <div>{{ $t('assessmentResponse.completedBy') }}:</div>
            <div v-if="assessmentResponse.completedBy">
              {{ assessmentResponse.completedBy.type === CompletedByType.Crc
                ? assessmentResponse.completedBy.crcUserName : $t('assessment.completedBy.beneficiary') }}
            </div>
          </div>
          <div>
            <div>{{ $t('assessmentResponse.dateCompleted') }}:</div>
            <div>{{ assessmentResponse.dateCompleted ? moment(assessmentResponse.dateCompleted).format('ll') : '' }}</div>
          </div>
          <div>
            <div>{{ $t('assessmentResponse.scoring') }}:</div>
            <div>{{ assessmentResponse.totalScore }}</div>
          </div>
        </v-row>
      </div>

      <rc-tabs class="mt-8 mb-4">
        <rc-tab
          v-for="tab in tabs"
          :key="tab"
          :label="$t(`assessmentResponse.tab.${tab}`)"
          :data-test="`assessmentResponse__tab--${tab}`"
          :active="selectedTab === tab"
          @click="selectedTab = tab" />
      </rc-tabs>

      <question-tab
        v-if="selectedTab === 'Questions'"
        :can-edit="canEdit"
        :assessment-response="assessmentResponse"
        :assessment-form="assessmentForm"
        data-test="question-list"
        @pending-changes="hasPendingChanges = $event" />
    </div>

    <template slot="actions">
      <v-btn
        data-test="details_back_btn"
        @click="goToList()">
        {{ $t('assessmentTemplateDetails.back_to_assessmentTemplates') }}
      </v-btn>
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import moment from 'moment';
import {
  RcPageContent, RcTab, RcTabs,
} from '@libs/component-lib/components';
import routes from '@/constants/routes';
import {
  CompletedByType, CompletionStatus, IAssessmentFormEntity, IAssessmentResponseEntity,
} from '@libs/entities-lib/assessment-template';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { Route, NavigationGuardNext } from 'vue-router';
import helpers from '@/ui/helpers/helpers';
import { useAssessmentFormStore } from '@/pinia/assessment-form/assessment-form';
import { useAssessmentResponseStore } from '@/pinia/assessment-response/assessment-response';
import caseFileDetail from '../../caseFileDetail';
import QuestionTab from './QuestionTab.vue';

export default mixins(caseFileDetail).extend({
  name: 'AssessmentDetails',

  components: {
    RcPageContent,
    StatusChip,
    RcTab,
    RcTabs,
    QuestionTab,
  },

  props: {
    assessmentResponseId: {
      type: String,
      required: true,
    },
  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    await helpers.confirmBeforeLeaving(this, this.hasPendingChanges, next);
  },

  data() {
    return {
      CompletedByType,
      moment,
      selectedTab: 'Questions',
      tabs: ['Questions'],
      hasPendingChanges: false,
    };
  },

  computed: {
    canEdit(): boolean {
      return this.$hasLevel('level3') && !this.readonly
      && this.$route.name === routes.caseFile.assessments.edit.name
      && this.assessmentResponse?.completionStatus === CompletionStatus.Completed;
    },
    assessmentResponse(): IAssessmentResponseEntity {
      return useAssessmentResponseStore().getById(this.assessmentResponseId);
    },
    assessmentForm(): IAssessmentFormEntity {
      return useAssessmentFormStore().getById(this.assessmentResponse?.assessmentFormId);
    },
  },

  async created() {
    const response = await useAssessmentResponseStore().fetch({ id: this.assessmentResponseId });
    if (response?.assessmentFormId) {
      await useAssessmentFormStore().fetch({ id: response.assessmentFormId });
    }
  },

  methods: {
    goToList() {
      this.$router.push({
        name: routes.caseFile.assessments.home.name,
      });
    },
  },
});
</script>
<style scoped lang="scss">
  .stacked-details {
    padding: 18px 0;
  }
  .stacked-details > div {
    padding: 0 12px;
    border-right: 1px solid  var(--v-grey-lighten2);
  }
  .stacked-details > div:last-child {
    border-right: initial;
  }
</style>
