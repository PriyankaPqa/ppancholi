<template>
  <rc-page-content
    :title="$t('assessmentTemplateDetails.title')">
    <div v-if="assessmentForm">
      <div class="ma-4">
        <v-row class="justify-space-between">
          <div class="details-page-title">
            {{ $m(assessmentForm.name) }}
          </div>
          <div>
            <status-chip status-name="AssessmentResponseCompletionStatus" :status="assessmentResponse.completionStatus" />
            <v-btn v-if="canEdit" class="ml-4" icon @click="launchAssessment()">
              <v-icon size="20">
                mdi-pencil
              </v-icon>
            </v-btn>
          </div>
        </v-row>
        <v-row class="stacked-details rc-body14">
          <div>
            <div>{{ $t('assessmentResponse.dateAssigned') }}:</div>
            <div data-test="date_assigned">
              {{ format(new Date(assessmentResponse.dateAssigned), 'PP') }}
            </div>
          </div>
          <div>
            <div>{{ $t('assessmentResponse.completedBy') }}:</div>
            <div v-if="assessmentResponse.completedBy" data-test="completed_by">
              {{ assessmentResponse.completedBy.type === CompletedByType.Crc
                ? assessmentResponse.completedBy.crcUserName
                : $t('assessment.completedBy.individual') }}
            </div>
          </div>
          <div>
            <div>{{ $t('assessmentResponse.dateCompleted') }}:</div>
            <div data-test="date_completed">
              {{ assessmentResponse.dateCompleted ? format(new Date(assessmentResponse.dateCompleted), 'PP') : '' }}
            </div>
          </div>
          <div v-if="scoringRange">
            <div>{{ scoringRange }}</div>
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
        :assessment-response="assessmentResponse"
        :assessment-form="assessmentForm"
        data-test="question-list" />
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
import {
  RcPageContent, RcTab, RcTabs,
} from '@libs/component-lib/components';
import routes from '@/constants/routes';
import {
  CompletedByType, CompletionStatus, IAssessmentFormEntity, IAssessmentResponseEntity,
} from '@libs/entities-lib/assessment-template';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { useAssessmentFormStore } from '@/pinia/assessment-form/assessment-form';
import { useAssessmentResponseStore } from '@/pinia/assessment-response/assessment-response';
import { UserRoles } from '@libs/entities-lib/user';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { format } from 'date-fns';
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

  data() {
    return {
      CompletedByType,
      FeatureKeys,
      selectedTab: 'Questions',
      tabs: ['Questions'],
      format,
    };
  },

  computed: {
    canEdit(): boolean {
      return this.$hasLevel(UserRoles.level3) && !this.readonly
      && this.assessmentResponse?.completionStatus === CompletionStatus.Completed;
    },
    assessmentResponse(): IAssessmentResponseEntity {
      return useAssessmentResponseStore().getById(this.assessmentResponseId);
    },
    assessmentForm(): IAssessmentFormEntity {
      return useAssessmentFormStore().getById(this.assessmentResponse?.assessmentFormId);
    },
    scoringRange(): string {
      const range = this.assessmentForm?.scoringRanges?.find((sr) => sr.minValue <= this.assessmentResponse.totalScore && sr.maxValue >= this.assessmentResponse.totalScore);
      if (range && this.assessmentResponse.completionStatus === CompletionStatus.Completed) {
        return this.$m(range.label);
      }
      return null;
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

    launchAssessment() {
      const routeData = this.$router.resolve({
        name: routes.events.assessments.complete.name,
        params: {
          assessmentTemplateId: this.assessmentForm.id,
          id: this.event.id,
          assessmentResponseId: this.assessmentResponse.id,
        },
      });
      window.open(routeData.href, '_blank');
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
