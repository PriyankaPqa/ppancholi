<template>
  <div class="question-section rc-body14">
    <v-simple-table
      v-for="(group, index) in questionGroups"
      :key="`qGroup_${index}`"
      data-test="question-list"
      class="mb-6">
      <thead>
        <tr>
          <th>{{ index ? $t('assessment.obsoleteQuestions') : $t('assessment.questions') }}</th>
          <th>{{ index ? $t('assessment.obsoleteAnswers') : $t('assessment.responses') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(qAndA, $index) in group"
          :key="`item__${$index}`">
          <td class="question">
            <div class="d-flex">
              <div
                v-for="(childIndex, $sub) in qAndA.childEntryIndexes"
                :key="`item__${$index}__childindex__${$sub}`"
                :class="`question-dynamic ${childIndex % 2 === 0 ? 'even' : 'odd'}`" />
              <div :class="qAndA.question.endDate ? 'obsolete' : ''">
                <div
                  v-for="(qDescription, $descindex) in $m(qAndA.question.question).split('|')"
                  :key="`item__${$index}__desc__${$descindex}`"
                  :style="`padding-left:${$descindex * 20}px`">
                  {{ qDescription }}
                </div>
              </div>
            </div>
          </td>
          <td class="answer">
            {{ qAndA.displayAnswer }}
            <v-btn v-if="qAndA.history.length > 1" data-test="answer-history-open-button" icon class="pl-1" @click="showHistory(qAndA)">
              <v-icon size="20">
                mdi-history
              </v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-simple-table>

    <rc-dialog
      v-if="currentHistoryData"
      data-test="history-dialog"
      :title="$t('assessment.answerHistory')"
      :submit-action-label="$t('common.close')"
      :content-only-scrolling="true"
      :persistent="true"
      :max-width="750"
      :min-height="480"
      :show.sync="showHistoryDialog"
      :show-cancel="false"
      @close="showHistoryDialog = false"
      @submit="showHistoryDialog = false">
      <div>
        <v-simple-table>
          <tbody>
            <tr
              v-for="(h, $index) in currentHistoryData"
              :key="`history__${$index}`">
              <td class="history" :data-test="`history-response-${$index}`">
                <div>
                  {{ $index == 0 ? $t('assessment.originalResponse') : format(new Date(h.answeredOn), 'MMM d, yyyy') }}
                </div>
                <div v-if="$index > 0">
                  {{ $t('assessment.answeredBy', { user: h.crcUserName }) }}
                </div>
              </td>
              <td>
                <div class="answer" :data-test="`history-answer-${$index}`">
                  {{ h.displayAnswer }}
                </div>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </div>
    </rc-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  RcDialog,
} from '@libs/component-lib/components';
import {
  CompletedByType, IAnsweredQuestion, IAssessmentFormEntity, IAssessmentQuestion, IAssessmentResponseEntity,
} from '@libs/entities-lib/assessment-template';
import { SurveyJsHelper } from '@libs/shared-lib/plugins/surveyJs/SurveyJsHelper';
import { format } from 'date-fns';

interface IQuestionAndAnswer {
  question: IAssessmentQuestion,
  answer: IAnsweredQuestion,
  displayAnswer: string,
  history: (IAnsweredQuestion & { displayAnswer: string })[],
  isMultiple: boolean,
  level: number,
  groupName: string,
  path: string,
  isDynamicRoot: boolean,
  childEntryIndexes?: number[],
}

export default Vue.extend({
  name: 'QuestionTab',

  components: {
    RcDialog,
  },

  props: {
    assessmentResponse: {
      type: Object as () => IAssessmentResponseEntity,
      required: true,
    },
    assessmentForm: {
      type: Object as () => IAssessmentFormEntity,
      required: true,
    },
  },

  data() {
    return {
      CompletedByType,
      format,
      selectedTab: 'Questions',
      tabs: ['Questions', 'Scoring'],
      editedQuestion: null as IQuestionAndAnswer,
      currentAnswer: [] as string[],
      editedAnswer: [] as string[],
      currentHistoryData: null as (IAnsweredQuestion & { displayAnswer: string })[],
      showHistoryDialog: false,
      additionalDynamicPaths: [] as string[],
    };
  },

  computed: {
    questionsAndAnswers(): IQuestionAndAnswer[] {
      if (!this.assessmentForm?.questions) {
        return [];
      }

      const questionsList = this.regroupQuestions(this.assessmentForm, this.assessmentResponse, this.additionalDynamicPaths) as (
        IAssessmentQuestion & { path?: string, childEntryIndexes?: number[] }
      )[];

      let qAndAs = questionsList
        .map((q) => ({
          question: q,
          path: q.path,
          childEntryIndexes: q.childEntryIndexes,
          answer: this.assessmentResponse.answeredQuestions?.find((a) => a.questionId === q.id
            && (q.path == null || a.parentIndexPath?.indexOf(q.path) === 0)),
          displayAnswer: null,
          history: this.assessmentResponse.answeredQuestionsHistory?.filter((a) => a.questionId === q.id
            && (q.path == null || a.parentIndexPath?.indexOf(q.path) === 0)) || [],
          isMultiple: SurveyJsHelper.questionTypeIsMultipleAnswer(q.questionType),
          isDynamicRoot: SurveyJsHelper.questionTypeIsDynamic(q.questionType),
        })) as IQuestionAndAnswer[];

      qAndAs.forEach((qAndA) => {
        if (this.assessmentResponse.dateCompleted
          && qAndA.history.filter((a) => a.answeredOn.toString() === this.assessmentResponse.dateCompleted.toString()).length === 0) {
          qAndA.history.unshift({
            assessmentQuestionIdentifier: qAndA.question.identifier,
            responses: [],
            displayAnswer: null,
            questionId: qAndA.question.id,
          });
        }

        qAndA.history.forEach((h) => {
          h.displayAnswer = this.getDisplayAnswer(h, qAndA.question);
        });

        qAndA.displayAnswer = this.getDisplayAnswer(qAndA.answer, qAndA.question);
      });

      qAndAs = qAndAs.filter((q) => q.answer || q.history?.length > 1);

      return qAndAs;
    },
    questionGroups(): IQuestionAndAnswer[][] {
      const groups = [this.questionsAndAnswers.filter((q) => !q.question.endDate)];
      const obsoletes = this.questionsAndAnswers.filter((q) => q.question.endDate);
      if (obsoletes.length) {
        groups.push(obsoletes);
      }
      return groups;
    },
  },

  methods: {
    showHistory(qAndA: IQuestionAndAnswer) {
      this.currentHistoryData = qAndA.history;
      this.showHistoryDialog = true;
    },

    getDisplayAnswer(answeredQuestion: IAnsweredQuestion, question: IAssessmentQuestion) : string {
      let displayAnswer = (answeredQuestion?.responses || [])
        .map((r) => this.$m(question.answerChoices?.find((ac) => ac.identifier === r.textValue)?.displayValue)).join(', ');
      if (displayAnswer == null || displayAnswer === '') {
        displayAnswer = (answeredQuestion?.responses || [])
          .map((r) => r.displayValue).join(', ');
      }
      return displayAnswer;
    },

    // some questions are stored in dynamic panels, meaning they can be repeated multiple times.  If one question was answered in a panel,
    // we need to generate a set of questions representing that panel and regroup all the answers of that panel instance
    // which are grouped together by starting with the same parentIndexPath
    regroupQuestions(form: IAssessmentFormEntity, response: IAssessmentResponseEntity, additionalDynamicPaths: string[]): (
      IAssessmentQuestion & { path?: string, childEntryIndexes?: number[] })[] {
      // get the list of all parent paths (questions answered in dynamic panels)
      // we will need to have a group of questions for each path
      let parentPaths = (response.answeredQuestions?.map((a) => a.parentIndexPath) || []).concat(
        (response.answeredQuestionsHistory?.map((a) => a.parentIndexPath) || []),
      ).concat(additionalDynamicPaths || []);

      // unique paths
      parentPaths = parentPaths.filter((v, i, a) => a != null && a.indexOf(v) === i).sort();

      const originalQuestionsToShow = form.questions
        .filter((q) => SurveyJsHelper.questionTypesThatCannotBeAnswered().indexOf(q.questionType) === -1);

      const qPanels = originalQuestionsToShow.filter((q) => SurveyJsHelper.questionTypeIsDynamic(q.questionType));

      // first extract all root items
      let questionsList = originalQuestionsToShow
        .filter((q) => qPanels.map((qP) => qP.identifier).filter((qP) => q.identifier.startsWith(`${qP}|`)).length === 0)
        .map((q) => ({ ...q, path: null, childEntryIndexes: [] }));

      for (let i = 0; i < questionsList.length; i += 1) {
        const q = questionsList[i];
        if (SurveyJsHelper.questionTypeIsDynamic(q.questionType)) {
          // clear all children questions previously spliced if any by removing any subsequent question
          // we keep everything not related to this parent even if at later index
          questionsList = questionsList.filter((q2, index) => index <= i || !q2.identifier.startsWith(`${q.identifier}|`));
          const currentPath = this.getDynamicPathForPanel(q.path, q.identifier);

          // get all paths that we will need to show - each repeat of the dynamic panel
          const subPathToGenerate = parentPaths.filter((pp) => pp && pp.startsWith(`${currentPath}[`))
            .map((pp) => pp.replace(currentPath, '').split('|')[0])
            // unique
            .filter((v, i, a) => a != null && a.indexOf(v) === i);

          const childrenQuestions = originalQuestionsToShow.filter((q2) => q2.identifier.startsWith(`${q.identifier}|`));
          for (let j = subPathToGenerate.length - 1; j >= 0; j -= 1) {
            questionsList.splice(i + 1, 0, ...childrenQuestions.map((k) => ({
              ...k,
              path: currentPath + subPathToGenerate[j],
              childEntryIndexes: q.childEntryIndexes.concat([j]),
            })));
          }
        }
      }

      return questionsList;
    },

    getDynamicPathForPanel(panelPath: string, panelIdentifier: string) : string {
      return (panelPath != null ? `${panelPath}|` : '') + panelIdentifier.split('|')[panelIdentifier.split('|').length - 1];
    },
  },
});
</script>
<style scoped lang="scss">
  .question, .history {
    font-weight: bold;
    min-width: 200px;
  }
  .question > div {
    height: 100%;
  }
  .question div {
    align-self: center;
  }
  .answer {
    white-space: pre-wrap;
  }
  .question-dynamic.even {
    background-color: var(--v-accent-lighten2);
    width: 10px;
    margin: 0 4px;
    height: 100%;
  }
  .question-dynamic.odd {
    background-color: var(--v-accent-darken2);
    width: 10px;
    margin: 0 4px;
    height: 100%;
  }

  .obsolete {
    color: var(--v-grey-base);
    font-style: italic;
  }
</style>
