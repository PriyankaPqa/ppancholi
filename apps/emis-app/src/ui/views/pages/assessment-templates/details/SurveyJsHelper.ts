/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import {
  FunctionFactory, JsonObject, Question, QuestionSelectBase, StylesManager, SurveyModel,
} from 'survey-core';
import helpers from '@/ui/helpers/helpers';
import {
  CompletionStatus,
  IAnsweredQuestion,
  IAssessmentAnswerChoice, IAssessmentQuestion, IAssessmentResponseEntity, SurveyJsAssessmentResponseState,
} from '@libs/entities-lib/assessment-template';
import { IMultilingual } from '@libs/shared-lib/types';
import { SurveyCreator, localization } from 'survey-creator-knockout';
import { CreatorBase } from 'survey-creator-core';
import _merge from 'lodash/merge';
import 'survey-core/survey.i18n';
import 'survey-creator-core/survey-creator-core.i18n';

type TextValue = (string | { value: string; text?: string | Record<string, string>; score?: number; });

interface ISimpleQuestion {
    name: string; html?: string | Record<string, string>;
    title?: string | Record<string, string>;
    suffix?: { name: string; title?: string | Record<string, string>; };
    score: number;
    rateValues?: TextValue[];
    choices?: TextValue[];
    items?: { name: string; title?: string | Record<string, string>; }[];
    rows?: TextValue[];
    columns?: TextValue[];
    hasOther?: boolean; otherText?: string | Record<string, string>;
    hasNone?: boolean; noneText?: string | Record<string, string>;
    hasComment?: boolean;
    commentText?: string | Record<string, string>;
    otherPlaceHolder?: string | Record<string, string>;
}

interface ISurveyJsPlainData {
  displayValue: string | Record<string, string>,
  name: string,
  questionType: string,
  title: string,
  value: string | Record<string, string>,
  isNode: boolean,
  data?: { name: string, title: string, value: string, displayValue: string, isNode: boolean }[],
}

interface ISurveyModel extends SurveyModel { _totalScore?: number }

export class SurveyJsHelper {
  totalScore = 0;

  creator = null as SurveyCreator;

  survey = null as ISurveyModel;

  initializeSurveyJsCreator(locale?: string) {
    StylesManager.applyTheme('defaultV2');

    JsonObject.metaData.addProperty('question', { name: 'score:number' });
    JsonObject.metaData.addProperty('itemvalue', { name: 'score:number' });

    this.initializeTranslations(locale);

    this.registerCustomSurveyJsFunctions();

    this.creator = new SurveyCreator({
      showLogicTab: true,
      isAutoSave: true,
      showTranslationTab: true,
      // we currently will only support these types.  other stories will add to this
      questionTypes: ['text', 'checkbox', 'radiogroup', 'dropdown', 'comment', 'boolean', 'html', 'multipletext', 'matrix'],
    });
    this.creator.locale = locale;
    this.creator.onPreviewSurveyCreated.add((_sender, options) => this.previewCreated(_sender, options));
    this.totalScore = 0;

    return this.creator;
  }

  initializeSurveyJsRunner(locale: string, surveyJson: string) {
    StylesManager.applyTheme('defaultV2');

    JsonObject.metaData.addProperty('question', { name: 'score:number' });
    JsonObject.metaData.addProperty('itemvalue', { name: 'score:number' });

    this.registerCustomSurveyJsFunctions();

    this.survey = new SurveyModel(surveyJson);
    this.survey.locale = locale;
    this.survey._totalScore = 0;
    this.totalScore = 0;
    this.survey.onValueChanged.add(this.valueChangedNewScore);

    return this.survey;
  }

  initializeTranslations(locale?: string) {
    if (locale === 'fr') {
      // // changing some labels
      // localization.getLocale('fr').ed.surveyPlaceHolder = ' Ajoutez des questions...';
      // localization.getLocale('fr').qt.signaturepad = 'Pad de signature';
      // what we end up with in localization
      console.log('current french', _merge(localization.getLocale('en'), localization.getLocale('fr')));
    } else {
      // console.log('current english', localization.getLocale('en'));
      localization.getLocale('en');
    }
  }

  registerCustomSurveyJsFunctions() {
    FunctionFactory
      .Instance
      .register('totalScore', this.getTotalScore, true);
  }

  async getTotalScore() {
    // as this is a FunctionFactory method we dont have access to the correct "this"
    // and as it is async we must return with the callback returnResult
    const method = this as any;
    await helpers.timeout(50);
    method.returnResult(+method.survey._totalScore);
  }

  getAssessmentQuestions() : IAssessmentQuestion[] {
    const result = [] as IAssessmentQuestion[];
    this.creator.survey.getAllQuestions().filter((q) => q.getType() !== 'html').forEach((q: Question) => {
      const qJson = q.toJSON() as ISimpleQuestion;

      // eslint-disable-next-line no-nested-ternary
      const subQuestions = qJson.items?.length ? qJson.items : (qJson.rows?.length
        ? qJson.rows.map((r) => (typeof r === 'string' ? { name: r, title: r } : { name: r.value, title: r.text })) : [null]);

      subQuestions.forEach((subQuestion) => {
        const simpleQuestion = { ...qJson, suffix: subQuestion } as ISimpleQuestion;

        const choices = (q as any).getChoices
          ? JSON.parse(JSON.stringify((q as any).getChoices())) as TextValue[]
        // to extract instead when ratings or matrix...
          : simpleQuestion.rateValues || simpleQuestion.columns;

        const assessmentQuestion = {
          identifier: simpleQuestion.name + (simpleQuestion.suffix != null ? `|${simpleQuestion.suffix.name}` : ''),
          questionType: q.getType(),
          question: this.getPropertyAsMultilingual(
            // eslint-disable-next-line
            simpleQuestion.title != null ? simpleQuestion.title : (simpleQuestion.html != null ? simpleQuestion.html : simpleQuestion.name),
            simpleQuestion.suffix?.title != null ? simpleQuestion.suffix?.title : simpleQuestion.suffix?.name,
          ),
          score: simpleQuestion.score,
          answerChoices: choices ? [] : null,
        } as IAssessmentQuestion;

        result.push(assessmentQuestion);

        if (choices) {
          if (simpleQuestion.hasOther) {
            choices.push({
              value: 'other',
              text: simpleQuestion.otherText || {
                en: 'Other (describe)',
                fr: 'Autre (préciser)',
              },
            });
            // there is a comment section that appears then
            result.push(this.getCommentSubquestion(simpleQuestion));
          }
          if (simpleQuestion.hasNone) {
            choices.push({
              value: 'none',
              text: simpleQuestion.noneText || {
                en: 'None',
                fr: 'Aucun',
              },
            });
          }
        }

        (choices || []).forEach((c) => {
          const choice = {
            identifier: typeof c === 'string' ? c : c.value,
            displayValue: this.getPropertyAsMultilingual(typeof c === 'string' ? c : (c.text || c.value.toString())),
            textValue: typeof c === 'string' ? c : c.value,
            score: typeof c === 'string' ? null : c.score || null,
          } as IAssessmentAnswerChoice;
          if (+choice.textValue as any === choice.textValue || (choice.textValue.trim() !== '' && !Number.isNaN(+choice.textValue))) {
            choice.numericValue = +choice.textValue;
          }

          assessmentQuestion.answerChoices.push(choice);
        });

        if (simpleQuestion.hasComment) {
          result.push(this.getCommentSubquestion(simpleQuestion));
        }
      });
    });
    return result;
  }

  getCommentSubquestion(simpleQuestion: ISimpleQuestion): IAssessmentQuestion {
    const text = this.getPropertyAsMultilingual(simpleQuestion.commentText || simpleQuestion.otherPlaceHolder || { en: 'Comment', fr: 'Commentaires' });
    const commentQuestion = {
      identifier: `${simpleQuestion.name + (simpleQuestion.suffix != null ? `|${simpleQuestion.suffix.name}` : '')}|Comment`,
      questionType: 'text',
      question: this.getPropertyAsMultilingual(
        // eslint-disable-next-line
        simpleQuestion.title != null ? simpleQuestion.title : (simpleQuestion.html != null ? simpleQuestion.html : simpleQuestion.name),
        simpleQuestion.suffix?.title != null ? simpleQuestion.suffix?.title : simpleQuestion.suffix?.name,
      ),
      answerChoices: null,
    } as IAssessmentQuestion;

    commentQuestion.question.translation.fr += `|${text.translation.fr}`;
    commentQuestion.question.translation.en += `|${text.translation.en}`;

    return commentQuestion;
  }

  getPropertyAsMultilingual(prop: string | Record<string, string>, suffix?: string | Record<string, string>): IMultilingual {
    const result = {
      translation: {
        en: '',
        fr: '',
      },
    } as IMultilingual;

    if (prop != null && typeof prop === 'string') {
      result.translation.en = prop;
      result.translation.fr = prop;
    }

    if (prop != null && typeof prop === 'object') {
      result.translation.en = prop.en || prop.default;
      result.translation.fr = prop.fr || result.translation.en;
    }

    if (suffix != null && typeof suffix === 'string') {
      result.translation.en += `|${suffix}`;
      result.translation.fr += `|${suffix}`;
    }

    if (suffix != null && typeof suffix === 'object') {
      result.translation.en += `|${suffix.en || suffix.default}`;
      result.translation.fr += `|${suffix.fr || suffix.en || suffix.default}`;
    }

    return result;
  }

  surveyToAssessmentResponse(sender: ISurveyModel, assessmentResponseOriginal?: IAssessmentResponseEntity) : IAssessmentResponseEntity {
    const assessmentResponse = assessmentResponseOriginal || {
      dateAssigned: new Date(),
    } as IAssessmentResponseEntity;

    assessmentResponse.completionStatus = CompletionStatus.Partial;
    assessmentResponse.externalToolState = new SurveyJsAssessmentResponseState(JSON.stringify(sender.data),
      JSON.stringify(sender.getPlainData({ includeEmpty: false, includeQuestionTypes: true })));
    assessmentResponse.totalScore = sender._totalScore;
    assessmentResponse.answeredQuestions = [];

    const r = JSON.parse(assessmentResponse.externalToolState.data.denormalizedJson) as ISurveyJsPlainData[];

    r.forEach((question) => this.questionToAssessmentResponse(sender, assessmentResponse, question));

    return assessmentResponse;
  }

  private questionToAssessmentResponse(sender: ISurveyModel, assessmentResponse: IAssessmentResponseEntity, question: ISurveyJsPlainData): void {
    const questionObj : Question = sender.getQuestionByName(question.name);
    (typeof question.value === 'object' && !Array.isArray(question.value) ? Object.keys(question.value) : [null]).forEach((subQuestion, ix) => {
      const response = {
        assessmentQuestionIdentifier: question.name + (subQuestion != null ? `|${subQuestion}` : ''),
        responses: [],
      } as IAnsweredQuestion;
      if (!question.isNode) {
        if (subQuestion == null) {
          response.responses = [{
            displayValue: question.displayValue as string,
            textValue: question.value.toString() as string,
          }];
        } else {
          response.responses = [{
            displayValue: Object.values(question.displayValue as Record<string, string>)[ix],
            textValue: (question.value as Record<string, string>)[subQuestion],
          }];
        }
      } else {
        response.responses = question.data.filter((q) => (!questionObj.comment || q.value !== '-Comment') && (!subQuestion || subQuestion === q.name))
          .map((x) => ({
            displayValue: x.displayValue,
            textValue: x.value.toString(),
          }));
      }

      if (questionObj.hasOther) {
        const responseOther = response.responses.filter((r) => r.textValue === 'other')[0];
        if (responseOther) {
          responseOther.displayValue = (questionObj as QuestionSelectBase).otherText;
        }
      }

      response.responses.forEach((userResponse) => {
        userResponse.numericValue = `${userResponse.textValue}`.trim() !== '' && !Number.isNaN(+userResponse.textValue) ? +userResponse.textValue : null;
      });
      assessmentResponse.answeredQuestions.push(response);

      if (questionObj.comment) {
        this.addCommentResponse(assessmentResponse, question, subQuestion, questionObj);
      }
    });
  }

  private addCommentResponse(assessmentResponse: IAssessmentResponseEntity, question: ISurveyJsPlainData, subQuestion: string, questionObj: Question): void {
    const commentResponse = {
      assessmentQuestionIdentifier: `${question.name + (subQuestion != null ? `|${subQuestion}` : '')}|Comment`,
      responses: [{
        displayValue: questionObj.comment,
        textValue: questionObj.comment,
      }],
    } as IAnsweredQuestion;
    assessmentResponse.answeredQuestions.push(commentResponse);
  }

  previewCreated(_sender: CreatorBase, options : { survey: ISurveyModel }) {
    options.survey._totalScore = 0;
    this.totalScore = 0;
    options.survey.onValueChanged.add(this.valueChangedNewScore);
  }

  valueChangedNewScore(survey: ISurveyModel) {
    survey._totalScore = 0;
    const data = survey.data;

    Object.keys(data).forEach((qName) => {
      const question = survey.getQuestionByName(qName) as any;
      const qValue = data[qName];
      if (question) {
        if (question.choices) {
          question.choices.filter((c: any) => c.score).forEach((choice: any) => {
            if (choice.value === qValue || (Array.isArray(qValue) && qValue.indexOf(choice.value) > -1)) {
              // if (choice.value === qValue || (Array.isArray(qValue) && qValue.indexOf(question.choices[0].value) > -1)) {
              // debugger;
              survey._totalScore += +choice.score || 0;
            }
          });
        } else {
          survey._totalScore += +question.score || 0;
        }
      }
    });
    this.totalScore = survey._totalScore;
  }
}
