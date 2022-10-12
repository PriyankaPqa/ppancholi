<template>
  <rc-page-content
    :title=" $t('assessmentTemplateDetails.title')">
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

      <div v-if="selectedTab === 'Questions'" class="question-section rc-body14">
        <v-simple-table data-test="question-list">
          <thead>
            <tr>
              <th>{{ $t('assessment.questions') }}</th>
              <th>{{ $t('assessment.responses') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(qAndA, $index) in questionsAndAnswers"
              :key="`item__${$index}`">
              <td class="question">
                <div>{{ $m(qAndA.question.question).split('|')[0] }}</div>
                <div class="pl-6">
                  {{ $m(qAndA.question.question).split('|')[1] }}
                </div>
              </td>
              <td class="answer">
                {{ qAndA.displayAnswer }}
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </div>
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
import { RcPageContent, RcTab, RcTabs } from '@libs/component-lib/components';
import routes from '@/constants/routes';
import {
  CompletedByType, IAnsweredQuestion, IAssessmentFormEntity, IAssessmentQuestion, IAssessmentResponseEntity,
} from '@libs/entities-lib/assessment-template';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { SurveyJsHelper } from '@libs/shared-lib/plugins/surveyJs/SurveyJsHelper';
import caseFileDetail from '../../caseFileDetail';

interface QuestionAndAnswer {
  question: IAssessmentQuestion,
  answer: IAnsweredQuestion,
  displayAnswer: string,
  history: IAnsweredQuestion[],
}

export default mixins(caseFileDetail).extend({
  name: 'AssessmentDetails',

  components: {
    RcPageContent,
    StatusChip,
    RcTab,
    RcTabs,
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
      moment,
      selectedTab: 'Questions',
      tabs: ['Questions', 'Scoring'],
    };
  },

  computed: {
    canEdit(): boolean {
      return this.$hasLevel('level1') && !this.readonly;
    },
    assessmentResponse(): IAssessmentResponseEntity {
      return this.$storage.assessmentResponse.getters.get(this.assessmentResponseId)?.entity;
    },
    assessmentForm(): IAssessmentFormEntity {
      return this.$storage.assessmentForm.getters.get(this.assessmentResponse?.assessmentFormId)?.entity;
    },
    questionsAndAnswers(): QuestionAndAnswer[] {
      if (!this.assessmentForm?.questions) {
        return [];
      }

      const qAndAs = this.assessmentForm.questions
        .filter((q) => SurveyJsHelper.questionTypesThatCannotBeAnswered().indexOf(q.questionType) === -1)
        .map((q) => ({
          question: q,
          answer: this.assessmentResponse.answeredQuestions?.find((a) => a.assessmentQuestionIdentifier === q.identifier),
          displayAnswer: null,
          history: this.assessmentResponse.answeredQuestionsHistory?.filter((a) => a.assessmentQuestionIdentifier === q.identifier),
        }) as QuestionAndAnswer);

      qAndAs.forEach((qAndA) => {
        qAndA.displayAnswer = (qAndA.answer?.responses || [])
          .map((r) => this.$m(qAndA.question.answerChoices?.find((ac) => ac.identifier === r.textValue)?.displayValue)).join(', ');
        if (qAndA.displayAnswer == null || qAndA.displayAnswer === '') {
          qAndA.displayAnswer = (qAndA.answer?.responses || [])
            .map((r) => r.displayValue).join(', ');
        }
      });

      return qAndAs;
    },
  },

  async created() {
    const response = await this.$storage.assessmentResponse.actions.fetch({ id: this.assessmentResponseId });
    if (response?.entity?.assessmentFormId) {
      await this.$storage.assessmentForm.actions.fetch({ id: response.entity.assessmentFormId });
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
  .question {
    font-weight: bold;
  }
  .answer {
    white-space: pre-wrap;
  }
</style>
