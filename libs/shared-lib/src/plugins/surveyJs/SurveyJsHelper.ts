/* eslint-disable no-plusplus */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FunctionFactory, Question, QuestionSelectBase, StylesManager, SurveyModel,
  Serializer,
  QuestionMatrixDropdownModelBase,
  QuestionRatingModel,
  ComponentCollection,
  QuestionPanelDynamicModel,
} from 'survey-core';
import {
  CompletionStatus,
  IAnsweredQuestion,
  IAssessmentAnswerChoice, IAssessmentBaseEntity, IAssessmentQuestion, IAssessmentResponseEntity, SurveyJsAssessmentResponseState,
} from '@libs/entities-lib/assessment-template';
import { IColoursEntity } from '@libs/entities-lib/tenantSettings';
import { SurveyCreator, localization } from 'survey-creator-knockout';
import { CreatorBase } from 'survey-creator-core';
import { Status } from '@libs/entities-lib/base';
import { IMultilingual } from '../../types';
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
    labelTrue?: string | Record<string, string>;
    labelFalse?: string | Record<string, string>;
    scoreTrue?: number;
    scoreFalse?: number;
}

interface ISurveyJsDataNode { name: string, title: string, value: string, displayValue: string,
  isNode: boolean, isComment?: boolean, data?: ISurveyJsDataNode[] }

interface ISurveyJsPlainData {
  displayValue: string | Record<string, string>,
  name: string,
  title: string,
  value: string | Record<string, string>,
  isNode: boolean,
  data?: ISurveyJsDataNode[],
}

interface ISurveyModel extends SurveyModel { _totalScore?: number }

export class SurveyJsHelper {
  totalScore = 0;

  creator = null as SurveyCreator;

  survey = null as ISurveyModel;

  // we currently will only support these types.  other stories will add to this
  static supportedQuestionTypes(): string[] {
    return ['text', 'checkbox', 'radiogroup', 'dropdown', 'comment', 'boolean', 'html', 'multipletext',
      'matrix', 'rating', 'image', 'matrixdropdown', 'panel', 'yes-no', 'paneldynamic', 'matrixdynamic'];
  }

  static questionTypesThatCannotBeAnswered(): string[] {
    return ['html', 'panel', 'image'];
  }

  static questionTypeIsMultipleAnswer(questionType: string): boolean {
    return ['checkbox'].indexOf(questionType) > -1;
  }

  static questionTypeIsDynamic(questionType: string): boolean {
    return ['paneldynamic', 'matrixdynamic'].indexOf(questionType) > -1;
  }

  initializeSurveyJsCreator(locale?: string) {
    StylesManager.applyTheme('defaultV2');

    this.registerCustomProperties();
    this.registerCustomComponents();
    this.initializeTranslations(locale);
    this.registerCustomSurveyJsFunctions();

    this.creator = new SurveyCreator({
      haveCommercialLicense: true,
      showLogicTab: true,
      isAutoSave: true,
      showTranslationTab: true,
      questionTypes: SurveyJsHelper.supportedQuestionTypes(),
    });
    this.creator.locale = locale;
    this.creator.onPreviewSurveyCreated.add((_sender, options) => this.previewCreated(_sender, options));
    this.totalScore = 0;
    this.removeAllDataCategory();
    this.creator.toolbox.getItemByName('yes-no').title = locale === 'fr' ? 'Oui-Non' : 'Yes-No';

    return this.creator;
  }

  initializeSurveyJsRunner(locale: string, surveyJson: string) {
    StylesManager.applyTheme('defaultV2');

    this.registerCustomProperties();
    this.registerCustomComponents();
    this.registerCustomSurveyJsFunctions();

    this.survey = new SurveyModel(surveyJson);
    this.survey.locale = locale;
    this.survey._totalScore = 0;
    this.totalScore = 0;
    this.survey.onValueChanged.add(this.valueChangedNewScore);
    document.title = this.survey.title;

    return this.survey;
  }

  setColorScheme(selector: string, colours: IColoursEntity) {
    const elementStyle = (document.querySelector(selector) as HTMLElement)?.style;
    if (elementStyle && colours) {
      // theme color variables can be found here https://github.com/surveyjs/survey-library/blob/master/src/defaultV2-theme/variables.scss
      elementStyle.setProperty('--primary', colours.primaryDark);
      elementStyle.setProperty('--primary-light', colours.primaryLight);
      elementStyle.setProperty('--secondary', colours.secondary);
    }
  }

  getSurveyCanBeCompletedErrorMessage(assessmentTemplate: IAssessmentBaseEntity, response: IAssessmentResponseEntity, vue: Vue,
    $m: (s: IMultilingual) => string) {
    if (response?.status !== Status.Active || assessmentTemplate?.status !== Status.Active) {
      return $m.call(vue, assessmentTemplate?.messageIfUnavailable) || vue.$t('assessment.messageUnavailable') as string;
    }
    if (response.completionStatus === CompletionStatus.Completed) {
      const survey = this.initializeSurveyJsRunner(vue.$i18n.locale, assessmentTemplate.externalToolState.data.rawJson);
      return survey.processedCompletedBeforeHtml || vue.$t('assessment.surveyAlreadyCompleted') as string;
    }
    return null;
  }

  initializeTranslations(locale?: string) {
    if (locale === 'fr') {
      // // changing some labels
      // localization.getLocale('fr').ed.surveyPlaceHolder = ' Ajoutez des questions...';
      // localization.getLocale('fr').qt.signaturepad = 'Pad de signature';
      // what we end up with in localization
      localization.getLocale('fr').pe.labelTrue = 'Texte pour "Vrai"';
      localization.getLocale('fr').pe.labelFalse = 'Texte pour "Faux"';
      localization.getLocale('fr').pe.valueTrue = 'Valeur pour "Vrai"';
      localization.getLocale('fr').pe.valueFalse = 'Valeur pour "Faux"';
      localization.getLocale('fr');
      // console.log('current french', _merge(localization.getLocale('en'), localization.getLocale('fr')));
    } else {
      // console.log('current english', localization.getLocale('en'));
      localization.getLocale('en');
    }
  }

  registerCustomProperties() {
    Serializer.addProperty('itemvalue', {
      name: 'score:number',
      displayName: { default: 'Score', fr: 'Points' },
    });

    Serializer.addProperty('boolean', {
      name: 'scoreTrue:number',
      displayName: { default: '"True" score', fr: 'Points pour "Vrai"' },
      category: 'general',
    });

    Serializer.addProperty('boolean', {
      name: 'scoreFalse:number',
      displayName: { default: '"False" score', fr: 'Points pour "Faux"' },
      category: 'general',
    });

    Serializer.getProperty('matrixdropdown', 'cellType').visible = false;
    Serializer.getProperty('matrixdropdown', 'detailPanelMode').visible = false;
    Serializer.getProperty('matrixdropdowncolumn', 'cellType').visible = false;
    Serializer.getProperty('matrixdropdowncolumn', 'cellType').visible = false;
    Serializer.getProperty('checkbox', 'valuePropertyName').visible = false;
    Serializer.getProperty('matrixdynamic', 'cellType').visible = false;
    Serializer.getProperty('matrixdynamic', 'detailPanelMode').visible = false;
  }

  removeAllDataCategory() {
    if (!this.creator) {
      return;
    }
    // A black list of properties displayed in Data categories for different survey elements
    // list taken from https://github.com/surveyjs/survey-creator/blob/master/packages/survey-creator/src/questionEditors/questionEditorDefinition.ts
    const propertyStopList = [
      'valueName',
      'defaultValue',
      'correctAnswer',
      'useDisplayValuesInTitle',
      'clearIfInvisible',
      'storeOthersAsComment',
      'textUpdateMode',
      'sendResultOnPageNext',
    ];

    // FYI we are keeping some Data values by choice
    // 'clearInvisibleValues' at survey level; 'defaultRowValue', 'defaultValueFromLastRow' at matrixdynamic, 'valueTrue', 'valueFalse' at boolean
    // 'defaultPanelValue', 'defaultValueFromLastPanel' at paneldynamic

    // Hide properties contained in the black list, show all other properties
    this.creator.onShowingProperty.add((_sender, options) => {
      options.canShow = propertyStopList.indexOf(options.property.name) === -1;
    });
  }

  registerCustomComponents() {
    ComponentCollection.Instance.clear();
    // boolean component that switches the order of the boolean - which looks weird in code but presents the user with a yes-no, with yes as the first answer
    // saves a response not of true or false but yes or no
    ComponentCollection.Instance.add({
      name: 'yes-no',
      questionJSON: {
        type: 'boolean',
        labelTrue: { default: 'No', fr: 'Non' },
        labelFalse: { default: 'Yes', fr: 'Oui' },
        valueTrue: 'no',
        valueFalse: 'yes',
      },
    } as any);

    Serializer.addProperty('yes-no', {
      name: 'scoreFalse:number',
      displayName: { default: '"Yes" score', fr: 'Points pour "Oui"' },
      category: 'general',
    });

    Serializer.addProperty('yes-no', {
      name: 'scoreTrue:number',
      displayName: { default: '"No" score', fr: 'Points pour "Non"' },
      category: 'general',
    });
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
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    method.returnResult(+method.survey._totalScore);
  }

  getAssessmentQuestions(currentRoot: QuestionPanelDynamicModel = null,
    currentResults: IAssessmentQuestion[] = [], currentIdentifier: string = null) : IAssessmentQuestion[] {
    let result = currentResults;
    const qIdentifierPrefix = currentIdentifier !== null ? `${currentIdentifier}|` : '';
    (currentRoot ? currentRoot.panels[0].questions : this.creator.survey.getAllQuestions())
      .filter((q: Question) => SurveyJsHelper.questionTypesThatCannotBeAnswered().indexOf(q.getType()) === -1).forEach((q: Question) => {
        const qJson = q.toJSON() as ISimpleQuestion;
        let qType = q.getType();

        if (qType === 'matrixdynamic') {
          result.push(this.getDynamicMatrixSubquestion(qJson, qIdentifierPrefix));
        }

        // eslint-disable-next-line no-nested-ternary
        let subQuestions: { name: string, title?: string | Record<string, string>, rowscore?: number, overriddenProperties?: any }[] = [null];

        if (qJson.items?.length) {
          subQuestions = qJson.items;
        } else if (qType === 'matrixdynamic') {
          const colsAsSubquestion = qJson.columns.map((r: any) => (typeof r === 'string' ? { name: r, title: r }
            : {
              name: r.name, title: r.title || r.name, overriddenProperties: r,
            }));

          subQuestions = colsAsSubquestion
            .map((c) => ({
              overriddenProperties: c.overriddenProperties,
              name: c.name,
              title: this.getPropertyAsMultilingual(typeof c.title === 'string' ? c.title : { default: c.name, ...c.title }).translation,
            }));
        } else if (qJson.rows?.length) {
          if (qType === 'matrixdropdown') {
            const rowsAsSubquestion = qJson.rows.map((r: any) => (typeof r === 'string' ? { name: r, title: r }
              : { name: r.value, title: r.text || r.value, rowscore: r.score }));
            const colsAsSubquestion = qJson.columns.map((r: any) => (typeof r === 'string' ? { name: r, title: r }
              : {
                name: r.name, title: r.title || r.name, rowscore: r.score, overriddenProperties: r,
              }));
            subQuestions = (rowsAsSubquestion.map((r) => colsAsSubquestion
              .map((c) => ({
                overriddenProperties: c.overriddenProperties,
                name: `${r.name}|${c.name}`,
                title: this.getPropertyAsMultilingual(typeof r.title === 'string' ? r.title : { default: r.name, ...r.title },
                  typeof c.title === 'string' ? c.title : { default: c.name, ...c.title }).translation,
                rowscore: r.rowscore,
              })))).flat();
          } else {
            subQuestions = qJson.rows.map((r) => (typeof r === 'string' ? { name: r, title: r } : { name: r.value, title: r.text, rowscore: r.score }));
          }
        }

        subQuestions.forEach((subQuestion) => {
          const simpleQuestion = {
            ...qJson, ...(subQuestion?.overriddenProperties || {}), name: qJson.name, title: qJson.title, suffix: subQuestion,
          } as ISimpleQuestion;

          if (q.getType() === 'matrixdynamic') {
            qType = 'dropdown';
          }

          let choices = this.getChoicesList(q, simpleQuestion, qType);

          const assessmentQuestion = {
            identifier: qIdentifierPrefix + simpleQuestion.name + (simpleQuestion.suffix != null ? `|${simpleQuestion.suffix.name}` : ''),
            questionType: qType,
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
            choices = choices.map((c) => (typeof (c as any) === 'number' ? c.toString() : c));

            if (simpleQuestion.hasOther) {
              choices.push({
                value: 'other',
                text: simpleQuestion.otherText || {
                  en: 'Other (describe)',
                  fr: 'Autre (préciser)',
                },
              });
              // there is a comment section that appears then
              result.push(this.getCommentSubquestion(simpleQuestion, qIdentifierPrefix));
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
              identifier: typeof c === 'string' ? c : c.value?.toString(),
              displayValue: typeof c === 'string'
                ? this.getPropertyAsMultilingual(c) : this.getPropertyAsMultilingual(c.text || c.value?.toString(), null, c.value?.toString()),
              textValue: typeof c === 'string' ? c : c.value?.toString(),
              score: typeof c === 'string' ? null : c.score || null,
            } as IAssessmentAnswerChoice;
            if (+choice.textValue as any === choice.textValue || (choice.textValue.trim() !== '' && !Number.isNaN(+choice.textValue))) {
              choice.numericValue = +choice.textValue;
            }

            if (subQuestion?.rowscore) {
              choice.score = subQuestion?.rowscore + (choice.score || 0);
            }

            assessmentQuestion.answerChoices.push(choice);
          });

          if (simpleQuestion.hasComment) {
            result.push(this.getCommentSubquestion(simpleQuestion, qIdentifierPrefix));
          }

          if (qType === 'paneldynamic') {
            result = this.getAssessmentQuestions(q as QuestionPanelDynamicModel, result, assessmentQuestion.identifier);
          }
        });
      });
    return result;
  }

  getChoicesList(q: any, simpleQuestion: ISimpleQuestion, qType: string): TextValue[] {
    let choices = (q as any).getChoices
      ? JSON.parse(JSON.stringify((q as any).getChoices())) as TextValue[]
    // to extract instead when ratings or matrix...
      : simpleQuestion.rateValues || simpleQuestion.choices || simpleQuestion.columns;

    if (qType === 'boolean') {
      choices = [{
        value: (q as any).getValueTrue().toString(),
        text: simpleQuestion.labelTrue || {
          en: 'Yes',
          fr: 'Oui',
        },
        score: simpleQuestion.scoreTrue,
      }, {
        value: (q as any).getValueFalse().toString(),
        text: simpleQuestion.labelFalse || {
          en: 'No',
          fr: 'Non',
        },
        score: simpleQuestion.scoreFalse,
      },
      ];
    }
    if (qType === 'yes-no') {
      choices = [{
        value: 'yes',
        text: { en: 'Yes', fr: 'Oui' },
        score: simpleQuestion.scoreFalse,
      }, {
        value: 'no',
        text: { en: 'No', fr: 'Non' },
        score: simpleQuestion.scoreTrue,
      },
      ];
    }

    if (!choices && qType === 'rating') {
      choices = [];
      const qRating = q as QuestionRatingModel;
      for (let i = qRating.rateMin; i <= qRating.rateMax; i += qRating.rateStep) {
        choices.push({
          value: i.toString(),
          text: i.toString(),
        });
      }
    }

    if (!choices && qType === 'rating') {
      choices = [];
      const qRating = q as QuestionRatingModel;
      for (let i = qRating.rateMin; i <= qRating.rateMax; i += qRating.rateStep) {
        choices.push({
          value: i.toString(),
          text: i.toString(),
        });
      }
    }

    return choices;
  }

  getCommentSubquestion(simpleQuestion: ISimpleQuestion, qIdentifierPrefix: string): IAssessmentQuestion {
    const text = this.getPropertyAsMultilingual(simpleQuestion.commentText || simpleQuestion.otherPlaceHolder || { en: 'Comment', fr: 'Commentaires' });
    const commentQuestion = {
      identifier: `${qIdentifierPrefix}${simpleQuestion.name + (simpleQuestion.suffix != null ? `|${simpleQuestion.suffix.name}` : '')}|Comment`,
      questionType: 'comment',
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

  getDynamicMatrixSubquestion(simpleQuestion: ISimpleQuestion, qIdentifierPrefix: string): IAssessmentQuestion {
    const question = {
      identifier: `${qIdentifierPrefix}${simpleQuestion.name}`,
      questionType: 'matrixdynamic',
      question: this.getPropertyAsMultilingual(simpleQuestion.title != null ? simpleQuestion.title : simpleQuestion.name),
      answerChoices: null,
    } as IAssessmentQuestion;

    return question;
  }

  getPropertyAsMultilingual(prop: string | Record<string, string>, suffix?: string | Record<string, string>, defaultEnglish?: string): IMultilingual {
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
      result.translation.en = prop.en || prop.default || defaultEnglish;
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
    const data = sender.data;
    data._currentPageNo = sender.currentPageNo;
    assessmentResponse.externalToolState = new SurveyJsAssessmentResponseState(JSON.stringify(data),
      JSON.stringify(sender.getPlainData({ includeEmpty: false, includeQuestionTypes: true })));
    assessmentResponse.totalScore = sender._totalScore;
    assessmentResponse.answeredQuestions = [];

    const r = JSON.parse(assessmentResponse.externalToolState.data.denormalizedJson) as ISurveyJsPlainData[];

    r.forEach((question) => this.questionToAssessmentResponse(sender, assessmentResponse, question));

    return assessmentResponse;
  }

  // eslint-disable-next-line max-params
  private questionToAssessmentResponse(sender: ISurveyModel, assessmentResponse: IAssessmentResponseEntity, question: ISurveyJsPlainData,
    currentPanel: any = null, currentIdentifier: string = null, parentIndexPath: string = null, forcedType: string = null, rootQuestion: Question = null): void {
    const questionObj : Question = rootQuestion || (currentPanel || sender).getQuestionByName(question.name);
    const qType = forcedType || questionObj.getType();

    if (SurveyJsHelper.questionTypeIsDynamic(qType)) {
      for (let i = 0; i < question.data.length; i++) {
        if (question.data[i]) {
          const identifier = `${(currentIdentifier || '') + question.name}|`;
          const indexPath = `${(parentIndexPath || '') + question.name}[${i}]|`;
          // eslint-disable-next-line max-depth
          if (qType === 'paneldynamic') {
            question.data[i].data.forEach((sub) => this.questionToAssessmentResponse(sender, assessmentResponse, sub,
              (questionObj as any).panels[i], identifier, indexPath));
          } else {
            question.data[i].data.forEach((sub) => this.questionToAssessmentResponse(sender, assessmentResponse, sub,
              null, identifier, indexPath, 'matrixdropdown', questionObj));
          }
        }
      }
      return;
    }

    let subQuestions: { name: string, path: string[], overriddenProperties?: any }[] = [null];

    if (typeof question.value === 'object' && !Array.isArray(question.value)) {
      subQuestions = Object.keys(question.value).map((qName) => {
        const qValue = (question.value as any)[qName];
        if (typeof qValue === 'object' && !Array.isArray(qValue)) {
          return Object.keys(qValue).map((sub) => ({ name: `${qName}|${sub}`, path: [qName, sub] }));
        }
        return [{ name: qName, path: [qName] }];
      }).flat();
    }

    subQuestions.forEach((subQuestion, ix) => {
      const columnName = (subQuestion?.path || [])[1];
      const currentQuestionOrColumn = qType === 'matrixdropdown'
        ? (questionObj as QuestionMatrixDropdownModelBase).getColumnByName(columnName || question.name) : questionObj;
      if (!currentQuestionOrColumn) {
        return;
      }
      const response = {
        assessmentQuestionIdentifier: (currentIdentifier || '') + question.name + (subQuestion != null ? `|${subQuestion.name}` : ''),
        responses: [],
      } as IAnsweredQuestion;

      if (parentIndexPath != null) {
        response.parentIndexPath = parentIndexPath;
      }

      if (!question.isNode || qType === 'rating') {
        if (subQuestion == null) {
          response.responses = [{
            displayValue: question.displayValue as string,
            textValue: question.value.toString() as string,
          }];
        } else {
          response.responses = [{
            displayValue: Object.values(question.displayValue as Record<string, string>)[ix],
            textValue: (question.value as Record<string, string>)[subQuestion.name],
          }];
        }
      } else {
        response.responses = question.data.filter((q) => (!q.isComment) && (!subQuestion || subQuestion.path[0] === q.name))
          .map((d) => (columnName ? d.data.filter((d2) => subQuestion.path[1] === d2.name) : [d])).flat()
          .map((x) => ({
            displayValue: x.displayValue,
            textValue: x.value.toString(),
          }));
      }

      let commentOrOtherDescribe = questionObj.comment;

      if (currentQuestionOrColumn.hasOther) {
        const responseOther = response.responses.filter((r) => r.textValue === 'other')[0];
        if (responseOther && responseOther.displayValue !== (currentQuestionOrColumn as QuestionSelectBase).otherText) {
          commentOrOtherDescribe = responseOther.displayValue;
          responseOther.displayValue = (currentQuestionOrColumn as QuestionSelectBase).otherText;
        }
      }

      response.responses.forEach((userResponse) => {
        userResponse.numericValue = `${userResponse.textValue}`.trim() !== '' && !Number.isNaN(+userResponse.textValue) ? +userResponse.textValue : null;
      });
      assessmentResponse.answeredQuestions.push(response);

      if (commentOrOtherDescribe) {
        this.addCommentResponse(assessmentResponse, response.assessmentQuestionIdentifier, commentOrOtherDescribe, parentIndexPath);
      }
    });
  }

  private addCommentResponse(assessmentResponse: IAssessmentResponseEntity, questionName: string, comment: string, parentIndexPath: string): void {
    const commentResponse = {
      assessmentQuestionIdentifier: `${questionName}|Comment`,
      responses: [{
        displayValue: comment,
        textValue: comment,
      }],
    } as IAnsweredQuestion;

    if (parentIndexPath != null) {
      commentResponse.parentIndexPath = parentIndexPath;
    }

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
      const question = survey.getQuestionByName(qName) as
        (Question & { choices?: any[], rows?: any[], columns? : any[], scoreTrue?: number, scoreFalse?: number, score?: number });
      const qValue = data[qName];
      if (question && question.visible) {
        if (question.choices) {
          question.choices.filter((c: any) => c.score).forEach((choice: any) => {
            if (choice.value === qValue || (Array.isArray(qValue) && qValue.indexOf(choice.value) > -1)) {
              survey._totalScore += +choice.score || 0;
            }
          });
        } else if (question.rows && question.columns) {
          Object.keys(qValue).forEach((rowId) => {
            survey._totalScore += +question.rows.find((r: any) => r.value === rowId)?.score || 0;
            survey._totalScore += +question.columns.find((r: any) => r.value === qValue[rowId])?.score || 0;
          });
        } else if (question.getType() === 'boolean' || question.getType() === 'yes-no') {
          // yes-no questionWrapper is boolean
          survey._totalScore += +(qValue.toString() === ((question as any).questionWrapper || question as any)
            .getValueTrue().toString() ? question.scoreTrue : question.scoreFalse) || 0;
        } else {
          survey._totalScore += +question.score || 0;
        }
      }
    });
    this.totalScore = survey._totalScore;
  }
}
