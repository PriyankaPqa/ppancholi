<template>
  <div class="question-section rc-body14">
    <v-simple-table data-test="question-list">
      <thead>
        <tr>
          <th>{{ $t('assessment.questions') }}</th>
          <th>{{ $t('assessment.responses') }}</th>
          <th v-if="canEdit" />
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
          <td v-if="editedQuestion == qAndA" class="answer">
            <div>
              <v-select-with-validation
                v-if="qAndA.isMultiple"
                v-model="editedAnswer"
                dense
                outlined
                multiple
                clearable
                data-test="question_answer_select_multiple"
                :attach="false"
                :item-value="(answer) => answer.identifier"
                :item-text="(answer) => $m(answer.displayValue)"
                :items="qAndA.question.answerChoices" />
              <v-select-with-validation
                v-else-if="qAndA.question.answerChoices && qAndA.question.answerChoices.length"
                v-model="editedAnswer[0]"
                dense
                outlined
                clearable
                data-test="question_answer_select"
                :attach="false"
                :item-value="(answer) => answer.identifier"
                :item-text="(answer) => $m(answer.displayValue)"
                :items="qAndA.question.answerChoices" />
              <v-text-area-with-validation
                v-else-if="qAndA.question.questionType == 'comment'"
                v-model="editedAnswer[0]"
                dense
                outlined
                clearable
                data-test="question_answer_text" />
              <v-text-field-with-validation
                v-else
                v-model="editedAnswer[0]"
                dense
                outlined
                clearable
                data-test="question_answer_text" />
            </div>
          </td>
          <td v-else class="answer">
            {{ qAndA.displayAnswer }}
            <v-btn v-if="qAndA.history.length > 1" icon class="pl-1" @click="showHistory(qAndA)">
              <v-icon size="20">
                mdi-history
              </v-icon>
            </v-btn>
          </td>
          <td v-if="canEdit" align="right">
            <div class="editSection">
              <template v-if="editedQuestion == qAndA">
                <v-btn color="primary" :disabled="answerHasntChanged" @click="applyEdit()">
                  {{ $t('common.apply') }}
                </v-btn>

                <v-btn class="ml-3" icon data-test="cancel" @click="cancelEdit()">
                  <v-icon size="20">
                    mdi-close
                  </v-icon>
                </v-btn>
              </template>

              <template v-if="!editedQuestion">
                <v-btn icon data-test="cancel" @click="editQuestion(qAndA)">
                  <v-icon size="20">
                    mdi-pencil
                  </v-icon>
                </v-btn>
              </template>
            </div>
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
              <td class="history">
                <div>
                  {{ $index == 0 ? $t('assessment.originalResponse') : moment(h.answeredOn).format('ll') }}
                </div>
                <div v-if="$index > 0">
                  {{ $t('assessment.answeredBy', { user: h.crcUserName }) }}
                </div>
              </td>
              <td>
                <div class="answer">
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
import moment from 'moment';
import _xor from 'lodash/xor';
import {
  VSelectWithValidation, VTextFieldWithValidation, RcDialog, VTextAreaWithValidation,
} from '@libs/component-lib/components';
import {
  CompletedByType, IAnsweredQuestion, IAssessmentFormEntity, IAssessmentQuestion, IAssessmentResponseEntity,
} from '@libs/entities-lib/assessment-template';
import { SurveyJsHelper } from '@libs/shared-lib/plugins/surveyJs/SurveyJsHelper';

interface IQuestionAndAnswer {
  question: IAssessmentQuestion,
  answer: IAnsweredQuestion,
  displayAnswer: string,
  history: (IAnsweredQuestion & { displayAnswer: string })[],
  isMultiple: boolean,
}

export default Vue.extend({
  name: 'QuestionTab',

  components: {
    VSelectWithValidation,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
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
    canEdit: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      CompletedByType,
      moment,
      selectedTab: 'Questions',
      tabs: ['Questions', 'Scoring'],
      editedQuestion: null as IQuestionAndAnswer,
      currentAnswer: [] as string[],
      editedAnswer: [] as string[],
      currentHistoryData: null as IAnsweredQuestion[],
      showHistoryDialog: false,
    };
  },

  computed: {
    questionsAndAnswers(): IQuestionAndAnswer[] {
      if (!this.assessmentForm?.questions) {
        return [];
      }

      const qAndAs = this.assessmentForm.questions
        .filter((q) => SurveyJsHelper.questionTypesThatCannotBeAnswered().indexOf(q.questionType) === -1)
        .map((q) => ({
          question: q,
          answer: this.assessmentResponse.answeredQuestions?.find((a) => a.assessmentQuestionIdentifier === q.identifier),
          displayAnswer: null,
          history: this.assessmentResponse.answeredQuestionsHistory?.filter((a) => a.assessmentQuestionIdentifier === q.identifier) || [],
          isMultiple: SurveyJsHelper.questionTypeIsMultipleAnswer(q.questionType),
        })) as IQuestionAndAnswer[];

      qAndAs.forEach((qAndA) => {
        if (this.assessmentResponse.dateCompleted
          && qAndA.history.filter((a) => a.answeredOn.toString() === this.assessmentResponse.dateCompleted.toString()).length === 0) {
          qAndA.history.unshift({
            assessmentQuestionIdentifier: qAndA.question.identifier,
            responses: [],
            displayAnswer: null,
          });
        }

        qAndA.history.forEach((h) => {
          h.displayAnswer = this.getDisplayAnswer(h, qAndA.question);
        });

        qAndA.displayAnswer = this.getDisplayAnswer(qAndA.answer, qAndA.question);
      });

      return qAndAs;
    },
    answerHasntChanged(): boolean {
      return _xor(this.editedAnswer, this.currentAnswer).length === 0;
    },
  },

  watch: {
    answerHasntChanged(newVal) {
      this.$emit('pending-changes', !newVal);
    },
  },

  methods: {
    editQuestion(q: IQuestionAndAnswer) {
      this.editedQuestion = q;
      this.currentAnswer = q?.answer?.responses?.map((r) => r.textValue) || [];
      this.editedAnswer = q?.answer?.responses?.map((r) => r.textValue) || [];
    },
    async applyEdit() {
      const newAnswer = {
        assessmentQuestionIdentifier: this.editedQuestion.question.identifier,
        responses: [],
      } as IAnsweredQuestion;
      if (this.editedAnswer != null) {
        newAnswer.responses = this.editedAnswer.filter((x) => x != null && x.toString().trim() !== '').map((userResponse) => ({
          displayValue: this.$m(this.editedQuestion.question.answerChoices?.find((ac) => ac.identifier === userResponse)?.displayValue) || userResponse,
          textValue: userResponse,
          numericValue: `${(userResponse || '')}`.trim() !== '' && !Number.isNaN(+userResponse) ? +userResponse : null,
        }));
      }

      if (await this.$storage.assessmentResponse.actions.editAssessmentAnsweredQuestion({
        id: this.assessmentResponse.id, responses: newAnswer.responses, assessmentQuestionIdentifier: this.editedQuestion.question.identifier,
      })) {
        this.cancelEdit();
      }
    },
    cancelEdit() {
      this.editQuestion(null);
    },
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
  },
});
</script>
<style scoped lang="scss">
  .question, .history {
    font-weight: bold;
    min-width: 200px;
  }
  .answer {
    white-space: pre-wrap;
  }
  .editSection {
    white-space: nowrap;
  }
  ::v-deep .v-text-field__details {
    min-height: 0 !important;
    margin-bottom: 0 !important;
  }
</style>
