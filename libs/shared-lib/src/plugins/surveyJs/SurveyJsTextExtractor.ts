/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IAssessmentQuestion } from '@libs/entities-lib/src/assessment-template';
import { isObject } from 'lodash';
import {
  Question,
  QuestionMatrixDropdownModelBase,
  QuestionPanelDynamicModel,
  PageModel,
  PanelModelBase,
  QuestionHtmlModel,
  QuestionMultipleTextModel,
  QuestionImageModel,
  QuestionMatrixModel,
  ItemValue,
  MatrixDropdownColumn,
  MatrixDropdownRowModel,
  SurveyValidator,
  SurveyModel,
} from 'survey-core';
import { CreatorBase, localization } from 'survey-creator-core';
import { SurveyCreator } from 'survey-creator-knockout';
import { SurveyJsHelper } from './SurveyJsHelper';

export interface validator { type: string, typename: string, properties: { name: string, value: any }[] }

export interface IExtractedSurveyObject {
  type: string,
  identifier: string,
  title?: string,
  description?: string,
  isRequired?: boolean,
  elements: IExtractedSurveyObject[],
  choices?: { text: string, value: string, score?: number }[],
  logic?: string[],
  validators?: validator[],
}

export class SurveyJsTextExtractor {
  surveyJsHelper: SurveyJsHelper;

  constructor(public locale: string) {
    this.surveyJsHelper = new SurveyJsHelper();
    this.surveyJsHelper.initializeSurveyJsCreator(this.locale);
  }

  extractAllText(json: any) {
    this.surveyJsHelper.creator.JSON = json;
    const survey = this.surveyJsHelper.creator.survey;
    survey.locale = this.locale;
    const extract: IExtractedSurveyObject = {
      type: 'survey',
      identifier: 'survey',
      title: survey.title,
      description: survey.description,
      elements: [],
      logic: this.extractLogic(json)?.logicItems,
    };

    extract.elements = (survey.pages as PageModel[]).map((p) => this.extractPanel(p));

    extract.elements.push(this.extractCompletionPage(survey));

    // console.log(JSON.parse(JSON.stringify(extract)));
    return extract;
  }

  extractCompletionPage(survey: SurveyModel): IExtractedSurveyObject {
    return {
      type: 'page',
      identifier: 'Completion page',
      elements: [{
        type: 'html',
        identifier: '',
        elements: [],
        title: survey.completedHtml,
      }],
    };
  }

  extractPanel(panel: PanelModelBase | QuestionPanelDynamicModel) : IExtractedSurveyObject {
    const extract: IExtractedSurveyObject = {
      type: panel.getType(),
      identifier: panel.name,
      title: panel.title,
      description: panel.description,
      isRequired: panel.isRequired,
      elements: [],
      validators: panel instanceof QuestionPanelDynamicModel ? this.extractValidators(panel) : null,
    };

    const elements = panel instanceof QuestionPanelDynamicModel ? (panel.getElementsInDesign(true)[0] as any).getElementsInDesign(true)
      : panel.getElementsInDesign(true);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element instanceof PanelModelBase || element instanceof QuestionPanelDynamicModel) {
        extract.elements.push(this.extractPanel(element));
      } else if (element instanceof Question) {
        extract.elements = extract.elements.concat(this.extractQuestion(element));
      } else {
        // debugger;
      }
    }

    return extract;
  }

  extractQuestion(question: Question) : IExtractedSurveyObject[] {
    const extractedQuestions = this.surveyJsHelper.getAssessmentQuestions([question]);

    const result : IExtractedSurveyObject[] = [];

    const extract: IExtractedSurveyObject = {
      type: question.getType(),
      identifier: question.name,
      title: (question as QuestionHtmlModel).html || question.title,
      description: question.description,
      isRequired: question.isRequired,
      elements: [],
      choices: (extractedQuestions[0]?.answerChoices || []).map((ac) => ({
        value: ac.identifier,
        text: ac.displayValue.translation[this.locale || 'en'],
        score: ac.score,
      })),
      validators: this.extractValidators(question),
    };

    if (question.getType() === 'image') {
      extract.title = `<div><img src="${(question as QuestionImageModel).imageLink}"/></div>`;
    }

    result.push(extract);

    if (question.getType() === 'multipletext') {
      // multiple text is like having multiple questions on a panel
      extract.elements = (question as QuestionMultipleTextModel).items.map((q: Question) => ({
        type: 'text',
        identifier: q.name,
        title: q.title,
        description: q.description,
        isRequired: q.isRequired,
        elements: [],
      }) as IExtractedSurveyObject);
    }

    if (['matrix', 'matrixdynamic', 'matrixdropdown'].indexOf(question.getType()) > -1) {
      this.extractMatrixTypeQuestions(extract, question, extractedQuestions);
    }

    if (question.hasComment) {
      extract.elements.push({
        type: 'text',
        identifier: 'Comment',
        title: question.commentText,
        description: '',
        elements: [],
      });
    }

    return result;
  }

  extractMatrixTypeQuestions(extract: IExtractedSurveyObject, question: Question, extractedQuestions: IAssessmentQuestion[]) {
    if (question.getType() === 'matrix' || question.getType() === 'matrixdynamic') {
      // matrix is like having multiple questions on a panel
      extract.choices = [];
      const choiceSource = question.getType() === 'matrix' ? (question as QuestionMatrixModel).rows : (question as QuestionMatrixModel).columns;

      if (question.getType() === 'matrixdynamic') {
        // for matrix dynamic we extracted the first question as a panel - we dont need it here
        extractedQuestions.shift();
      }

      let index = -1;
      extract.elements = choiceSource.map((q: ItemValue) => {
        index++;
        const element = {
          type: question.getType() === 'matrix' ? 'row' : 'column',
          identifier: q.value,
          title: q.text || (q as any).title,
          elements: [],
          choices: (extractedQuestions[index]?.answerChoices || []).map((ac) => ({
            value: ac.identifier,
            text: ac.displayValue.translation[this.locale || 'en'],
            score: ac.score,
          })),
        } as IExtractedSurveyObject;

        if (extractedQuestions[index + 1]?.questionType === 'comment') {
          index++;
        }
        return element;
      });
    }

    if (question.getType() === 'matrixdropdown') {
      // matrixdropdown is like having multiple questions on a panel, with each column as a subpanel
      extract.choices = [];
      let index = -1;
      extract.elements = (question as QuestionMatrixDropdownModelBase).rows.map((r: MatrixDropdownRowModel) => ({
        type: 'row',
        identifier: r.value,
        title: r.text,
        elements: (question as QuestionMatrixDropdownModelBase).columns.map((c: MatrixDropdownColumn) => {
          index++;

          const element = {
            type: 'column',
            identifier: c.value,
            title: c.title,
            elements: [],
            choices: (extractedQuestions[index]?.answerChoices || []).map((ac) => ({
              value: ac.identifier,
              text: ac.displayValue.translation[this.locale || 'en'],
              score: ac.score,
            })),
          } as IExtractedSurveyObject;

          if (extractedQuestions[index + 1]?.questionType === 'comment') {
            index++;
          }

          return element;
        }),
      }) as IExtractedSurveyObject);
    }
  }

  extractValidators(item: Question) : validator[] {
    if (!item.getValidators()?.length && !item.requiredErrorText) {
      return null;
    }

    let validators : validator[] = [];
    if (item.requiredErrorText) {
      validators.push({
        type: 'requiredErrorText',
        typename: localization.getLocale(this.locale).pe.requiredErrorText || localization.getLocale('en').pe.requiredErrorText || 'requiredErrorText',
        properties: [{
          name: localization.getLocale(this.locale).pe.text || localization.getLocale('en').pe.text,
          value: item.requiredErrorText,
        }],
      });
    }

    validators = validators.concat(((item.getValidators() || []) as []).map((v: SurveyValidator & { getErrorText?: () => string }) => {
      const details = v.toJSON();
      const validator: validator = {
        type: v.getType(),
        typename: localization.getLocale(this.locale).validators[v.getType()] || localization.getLocale('en').validators[v.getType()] || v.getType(),
        properties: [],
      };

      if (v.getErrorText && v.getErrorText()) {
        details.text = v.getErrorText();
      }
      if (details.text && isObject(details.text)) {
        details.text = details.text[this.locale] || details.text.default || details.text;
      }

      validator.properties = Object.keys(details).map((k) => ({
        name: localization.getLocale(this.locale).pe[k] || localization.getLocale('en').pe[k] || k,
        value: isObject(details[k]) ? JSON.stringify(details[k]) : details[k],
      }));
      return validator;
    }));

    return validators;
  }

  extractLogic(jsonData: any) {
    const creator = new SurveyCreator({
      haveCommercialLicense: true,
      showLogicTab: true,
      questionTypes: SurveyJsHelper.supportedQuestionTypes(),
    });
    creator.JSON = jsonData;
    creator.locale = this.locale;

    const logicItems = [] as Array<{ conditionText: string, conditionExpression: string, questionNames: [], options: any }>;
    creator.onLogicItemDisplayText.add((_sender, options) => this.logicShown(_sender, options, logicItems));
    creator.activeTab = 'logic';
    const logic = {
      requiredQuestions: creator.survey.getAllQuestions().filter((q) => q.isRequired).map((q) => q.name),
      logicItems: logicItems.map((l) => l.conditionText),
    };

    // console.log('Required questions: ', logic.requiredQuestions);
    // console.log('Logic items', logic.logicItems);
    return logic;
  }

  private logicShown(_sender: CreatorBase, options: any, logicItems: Array<{ conditionText: string, conditionExpression: string, questionNames: [], options: any }>) {
    if (!logicItems.find((i) => i.conditionText === options.text)) {
      logicItems.push({
        conditionText: options.text,
        conditionExpression: options.expression,
        questionNames: options.logicItem.actionsValue?.length ? options.logicItem.actionsValue.map((av: any) => av?.elementValue?.name
          || (av?.elementValue || [])[(av?.logicTypeValue?.questionNames || [])[0]]) : null,
        options,
      });
    }
  }
}
