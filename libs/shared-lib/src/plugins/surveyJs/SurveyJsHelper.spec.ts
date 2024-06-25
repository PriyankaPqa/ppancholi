/* eslint-disable no-plusplus */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CompletionStatus, IAnsweredQuestion, mockAssessmentFormEntity, mockAssessmentResponseEntity,
} from '@libs/entities-lib/assessment-template';
import { Status } from '@libs/shared-lib/types';
import {
  JsonObject,
} from 'survey-core';
import { SurveyCreator } from 'survey-creator-knockout';
import Vue from 'vue';
import { SurveyJsHelper } from './SurveyJsHelper';
import { surveyData } from './SurveyJs.specdata';

let helper = new SurveyJsHelper();

describe('SurveyJsHelper', () => {
  beforeEach(async () => {
    helper = new SurveyJsHelper();
    jest.clearAllMocks();
  });

  describe('initializeSurveyJsCreator', () => {
    it('initializes the creator', () => {
      const creator = helper.initializeSurveyJsCreator('en');
      expect(creator.showLogicTab).toBeTruthy();
      expect(creator.isAutoSave).toBeFalsy();
      expect(creator.showTranslationTab).toBeTruthy();
    });
    it('adds properties in surveyjs', () => {
      helper.initializeSurveyJsCreator('en');
      expect(JsonObject.metaData.getProperty('itemvalue', 'score')).not.toBeNull();
      expect(JsonObject.metaData.getProperty('boolean', 'scoreTrue')).not.toBeNull();
      expect(JsonObject.metaData.getProperty('boolean', 'scoreFalse')).not.toBeNull();
      expect(helper.totalScore).toBe(0);
    });
    it('initializes creator locale', () => {
      let creator = helper.initializeSurveyJsCreator('en');
      expect(creator.locale).toBe('en');
      creator = helper.initializeSurveyJsCreator('fr');
      expect(creator.locale).toBe('fr');
    });
    it('calls registerCustomSurveyJsFunctions', () => {
      helper.registerCustomSurveyJsFunctions = jest.fn();
      helper.initializeSurveyJsCreator('en');
      expect(helper.registerCustomSurveyJsFunctions).toHaveBeenCalled();
    });
  });

  describe('initializeSurveyJsRunner', () => {
    it('initializes the survey', () => {
      const survey = helper.initializeSurveyJsRunner('zz', surveyData.complexJson);
      expect(survey.locale).toEqual('zz');
      expect(survey._totalScore).toEqual(0);
    });
    it('adds score in surveyjs', () => {
      helper.initializeSurveyJsRunner('en', surveyData.complexJson);
      expect(JsonObject.metaData.getProperty('itemvalue', 'score')).not.toBeNull();
      expect(JsonObject.metaData.getProperty('boolean', 'scoreTrue')).not.toBeNull();
      expect(JsonObject.metaData.getProperty('boolean', 'scoreFalse')).not.toBeNull();
      expect(helper.totalScore).toBe(0);
    });
    it('initializes survey locale', () => {
      let survey = helper.initializeSurveyJsRunner('fr', surveyData.complexJson);
      expect(survey.locale).toBe('fr');
      survey = helper.initializeSurveyJsRunner('zz', surveyData.complexJson);
      expect(survey.locale).toBe('zz');
    });
    it('calls registerCustomSurveyJsFunctions', () => {
      helper.registerCustomSurveyJsFunctions = jest.fn();
      helper.initializeSurveyJsRunner('en', surveyData.complexJson);
      expect(helper.registerCustomSurveyJsFunctions).toHaveBeenCalled();
    });
  });

  describe('setColorScheme', () => {
    it('sets the colors', () => {
      const setProperty = jest.fn();
      document.querySelector = jest.fn(() => ({ style: { setProperty } }));
      helper.setColorScheme('mySelector', {
        primary: 'primary', primaryDark: 'primaryDark', primaryLight: 'primaryLight', secondary: 'secondary',
      });
      expect(setProperty).toHaveBeenCalledWith('--primary', 'primaryDark');
      expect(setProperty).toHaveBeenCalledWith('--primary-light', 'primaryLight');
      expect(setProperty).toHaveBeenCalledWith('--secondary', 'secondary');
    });
  });

  describe('getSurveyCanBeCompletedErrorMessage', () => {
    const mockAssessment = mockAssessmentFormEntity();
    const mockResponse = mockAssessmentResponseEntity();
    const $m = jest.fn(() => 'lang');
    it('returns no error normally', () => {
      mockResponse.status = Status.Active;
      mockAssessment.status = Status.Active;
      expect(helper.getSurveyCanBeCompletedErrorMessage(mockAssessment, mockResponse, new Vue(), $m)).toBeNull();
    });
    it('returns false and sets error when response or assessment is not active', () => {
      mockResponse.status = Status.Inactive;
      expect(helper.getSurveyCanBeCompletedErrorMessage(mockAssessment, mockResponse, new Vue(), $m)).not.toBeNull();
      mockResponse.status = Status.Active;
      mockAssessment.status = Status.Inactive;
      expect(helper.getSurveyCanBeCompletedErrorMessage(mockAssessment, mockResponse, new Vue(), $m)).not.toBeNull();
    });
    it('returns false when survey was already completed', () => {
      mockResponse.completionStatus = CompletionStatus.Completed;
      expect(helper.getSurveyCanBeCompletedErrorMessage(mockAssessment, mockResponse, new Vue(), $m)).not.toBeNull();
    });
  });

  describe('getAssessmentQuestions', () => {
    it('translates surveyJs format to a emis question format', () => {
      helper.initializeSurveyJsCreator('en');
      // this json comes from survey creator and includes
      // - translations but not for everything
      // - matrix questions for having subquestions and choices
      // - some scores
      // - multi-text questions for subquestions
      // - some questions with answer choices
      helper.creator.text = surveyData.complexJson;

      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([
        {
          answerChoices: [
            {
              displayValue: {
                translation: {
                  en: 'Strongly Disagree',
                  fr: 'Très en désaccord',
                },
              },
              identifier: '1',
              numericValue: 1,
              score: null,
              textValue: '1',
            },
            {
              displayValue: {
                translation: {
                  en: 'Disagree',
                  fr: 'En désaccord',
                },
              },
              identifier: '2',
              numericValue: 2,
              score: null,
              textValue: '2',
            },
            {
              displayValue: {
                translation: {
                  en: 'Neutral',
                  fr: 'Neutre',
                },
              },
              identifier: '3',
              numericValue: 3,
              score: null,
              textValue: '3',
            },
            {
              displayValue: {
                translation: {
                  en: 'Agree',
                  fr: 'En accord',
                },
              },
              identifier: '4',
              numericValue: 4,
              score: 10,
              textValue: '4',
            },
            {
              displayValue: {
                translation: {
                  en: 'Strongly Agree',
                  fr: 'Très en accord',
                },
              },
              identifier: '5',
              numericValue: 5,
              score: null,
              textValue: '5',
            },
          ],
          identifier: 'Quality|affordable',
          question: {
            translation: {
              en: 'Please indicate if you agree or disagree with the following statements|Product is affordable',
              fr: 'Veuillez indiquer si vous êtes en accord ou en désaccord avec|Le produit est pas trop cher',
            },
          },
          questionType: 'matrix',
          score: undefined,
        },
        {
          answerChoices: [
            {
              displayValue: {
                translation: {
                  en: 'Strongly Disagree',
                  fr: 'Très en désaccord',
                },
              },
              identifier: '1',
              numericValue: 1,
              score: null,
              textValue: '1',
            },
            {
              displayValue: {
                translation: {
                  en: 'Disagree',
                  fr: 'En désaccord',
                },
              },
              identifier: '2',
              numericValue: 2,
              score: null,
              textValue: '2',
            },
            {
              displayValue: {
                translation: {
                  en: 'Neutral',
                  fr: 'Neutre',
                },
              },
              identifier: '3',
              numericValue: 3,
              score: null,
              textValue: '3',
            },
            {
              displayValue: {
                translation: {
                  en: 'Agree',
                  fr: 'En accord',
                },
              },
              identifier: '4',
              numericValue: 4,
              score: 10,
              textValue: '4',
            },
            {
              displayValue: {
                translation: {
                  en: 'Strongly Agree',
                  fr: 'Très en accord',
                },
              },
              identifier: '5',
              numericValue: 5,
              score: null,
              textValue: '5',
            },
          ],
          identifier: 'Quality|does what it claims',
          question: {
            translation: {
              en: 'Please indicate if you agree or disagree with the following statements|Product does what it claims',
              fr: "Veuillez indiquer si vous êtes en accord ou en désaccord avec|Le produit fait ce qu'il doit faire",
            },
          },
          questionType: 'matrix',
          score: undefined,
        },
        {
          answerChoices: [
            {
              displayValue: {
                translation: {
                  en: 'Strongly Disagree',
                  fr: 'Très en désaccord',
                },
              },
              identifier: '1',
              numericValue: 1,
              score: null,
              textValue: '1',
            },
            {
              displayValue: {
                translation: {
                  en: 'Disagree',
                  fr: 'En désaccord',
                },
              },
              identifier: '2',
              numericValue: 2,
              score: null,
              textValue: '2',
            },
            {
              displayValue: {
                translation: {
                  en: 'Neutral',
                  fr: 'Neutre',
                },
              },
              identifier: '3',
              numericValue: 3,
              score: null,
              textValue: '3',
            },
            {
              displayValue: {
                translation: {
                  en: 'Agree',
                  fr: 'En accord',
                },
              },
              identifier: '4',
              numericValue: 4,
              score: 10,
              textValue: '4',
            },
            {
              displayValue: {
                translation: {
                  en: 'Strongly Agree',
                  fr: 'Très en accord',
                },
              },
              identifier: '5',
              numericValue: 5,
              score: null,
              textValue: '5',
            },
          ],
          identifier: 'Quality|better then others',
          question: {
            translation: {
              en: 'Please indicate if you agree or disagree with the following statements|Product is better than other products on the market',
              fr: 'Veuillez indiquer si vous êtes en accord ou en désaccord avec|Product is better than other products on the market',
            },
          },
          questionType: 'matrix',
          score: undefined,
        },
        {
          answerChoices: [
            {
              displayValue: {
                translation: {
                  en: 'Strongly Disagree',
                  fr: 'Très en désaccord',
                },
              },
              identifier: '1',
              numericValue: 1,
              score: null,
              textValue: '1',
            },
            {
              displayValue: {
                translation: {
                  en: 'Disagree',
                  fr: 'En désaccord',
                },
              },
              identifier: '2',
              numericValue: 2,
              score: null,
              textValue: '2',
            },
            {
              displayValue: {
                translation: {
                  en: 'Neutral',
                  fr: 'Neutre',
                },
              },
              identifier: '3',
              numericValue: 3,
              score: null,
              textValue: '3',
            },
            {
              displayValue: {
                translation: {
                  en: 'Agree',
                  fr: 'En accord',
                },
              },
              identifier: '4',
              numericValue: 4,
              score: 10,
              textValue: '4',
            },
            {
              displayValue: {
                translation: {
                  en: 'Strongly Agree',
                  fr: 'Très en accord',
                },
              },
              identifier: '5',
              numericValue: 5,
              score: null,
              textValue: '5',
            },
          ],
          identifier: 'Quality|easy to use',
          question: {
            translation: {
              en: 'Please indicate if you agree or disagree with the following statements|Product is easy to use',
              fr: 'Veuillez indiquer si vous êtes en accord ou en désaccord avec|Product is easy to use',
            },
          },
          questionType: 'matrix',
          score: undefined,
        },
        {
          answerChoices: [
            {
              displayValue: {
                translation: {
                  en: 'val 1',
                  fr: 'val 1',
                },
              },
              identifier: '1',
              numericValue: 1,
              score: 10,
              textValue: '1',
            },
            {
              displayValue: {
                translation: {
                  en: 'val 2',
                  fr: 'val 2',
                },
              },
              identifier: '2',
              numericValue: 2,
              score: 2,
              textValue: '2',
            },
            {
              displayValue: {
                translation: {
                  en: 'val 3',
                  fr: 'val 3',
                },
              },
              identifier: '3',
              numericValue: 3,
              score: 3,
              textValue: '3',
            },
          ],
          identifier: 'satisfaction',
          question: {
            translation: {
              en: 'How satisfied are you with the Product?',
              fr: 'Comment êtes vous satisfaits',
            },
          },
          questionType: 'rating',
          score: undefined,
        },
        {
          answerChoices: [
            {
              displayValue: {
                translation: {
                  en: '1',
                  fr: '1',
                },
              },
              identifier: '1',
              numericValue: 1,
              score: null,
              textValue: '1',
            },
            {
              displayValue: {
                translation: {
                  en: '2',
                  fr: '2',
                },
              },
              identifier: '2',
              numericValue: 2,
              score: null,
              textValue: '2',
            },
            {
              displayValue: {
                translation: {
                  en: '3',
                  fr: '3',
                },
              },
              identifier: '3',
              numericValue: 3,
              score: null,
              textValue: '3',
            },
            {
              displayValue: {
                translation: {
                  en: '4',
                  fr: '4',
                },
              },
              identifier: '4',
              numericValue: 4,
              score: null,
              textValue: '4',
            },
            {
              displayValue: {
                translation: {
                  en: '5',
                  fr: '5',
                },
              },
              identifier: '5',
              numericValue: 5,
              score: null,
              textValue: '5',
            },
          ],
          identifier: 'recommend friends',
          question: {
            translation: {
              en: 'How likely are you to recommend the Product to a friend or co-worker?',
              fr: 'How likely are you to recommend the Product to a friend or co-worker?',
            },
          },
          questionType: 'rating',
          score: undefined,
        },
        {
          answerChoices: null,
          identifier: 'suggestions',
          question: {
            translation: {
              en: 'What would make you more satisfied with the Product?',
              fr: 'What would make you more satisfied with the Product?',
            },
          },
          questionType: 'comment',
          score: undefined,
        },
        {
          answerChoices: [
            {
              displayValue: {
                translation: {
                  en: 'Less expensive',
                  fr: 'Less expensive',
                },
              },
              identifier: 'Less expensive',
              score: null,
              textValue: 'Less expensive',
            },
            {
              displayValue: {
                translation: {
                  en: 'Priced about the same',
                  fr: 'Priced about the same',
                },
              },
              identifier: 'Priced about the same',
              score: null,
              textValue: 'Priced about the same',
            },
            {
              displayValue: {
                translation: {
                  en: 'More expensive',
                  fr: 'More expensive',
                },
              },
              identifier: 'More expensive',
              score: null,
              textValue: 'More expensive',
            },
            {
              displayValue: {
                translation: {
                  en: 'Not sure',
                  fr: 'Not sure',
                },
              },
              identifier: 'Not sure',
              score: null,
              textValue: 'Not sure',
            },
          ],
          identifier: 'price to competitors',
          question: {
            translation: {
              en: 'Compared to our competitors, do you feel the Product is',
              fr: 'Compared to our competitors, do you feel the Product is',
            },
          },
          questionType: 'radiogroup',
          score: undefined,
        },
        {
          answerChoices: [
            {
              displayValue: {
                translation: {
                  en: 'Yes, the price is about right',
                  fr: 'Yes, the price is about right',
                },
              },
              identifier: 'correct',
              score: 10,
              textValue: 'correct',
            },
            {
              displayValue: {
                translation: {
                  en: 'No, the price is too low for your product',
                  fr: 'No, the price is too low for your product',
                },
              },
              identifier: 'low',
              score: 5,
              textValue: 'low',
            },
            {
              displayValue: {
                translation: {
                  en: 'No, the price is too high for your product',
                  fr: 'No, the price is too high for your product',
                },
              },
              identifier: 'high',
              score: null,
              textValue: 'high',
            },
          ],
          identifier: 'price',
          question: {
            translation: {
              en: 'Do you feel our current price is merited by our product?',
              fr: 'Do you feel our current price is merited by our product?',
            },
          },
          questionType: 'radiogroup',
          score: undefined,
        },
        {
          answerChoices: null,
          identifier: 'pricelimit|mostamount',
          question: {
            translation: {
              en: 'What is the... |Most amount you would every pay for a product like ours',
              fr: 'Quel est le|Plus cher que vous paieriez',
            },
          },
          questionType: 'multipletext',
          score: undefined,
        },
        {
          answerChoices: null,
          identifier: 'pricelimit|leastamount',
          question: {
            translation: {
              en: 'What is the... |The least amount you would feel comfortable paying',
              fr: 'Quel est le|The least amount you would feel comfortable paying',
            },
          },
          questionType: 'multipletext',
          score: undefined,
        },
        {
          answerChoices: null,
          identifier: 'email',
          question: {
            translation: {
              // eslint-disable-next-line vue/max-len
              en: "Thank you for taking our survey. Your survey is almost complete, please enter your email address in the box below if you wish to participate in our drawing, then press the 'Submit' button.",
              // eslint-disable-next-line vue/max-len
              fr: "Thank you for taking our survey. Your survey is almost complete, please enter your email address in the box below if you wish to participate in our drawing, then press the 'Submit' button.",
            },
          },
          questionType: 'text',
          score: undefined,
        },
      ]);
    });
    it('extracts for text question type', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.textQuestion;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([{
        answerChoices: null,
        identifier: 'question1',
        question: {
          translation: {
            en: 'Text eng',
            fr: 'Text fr',
          },
        },
        questionType: 'text',
      }]);
    });

    it('extracts for questions translated in french but with default english', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.questionsTranslatedFrenchEglishDefault;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([{
        answerChoices: [
          {
            displayValue: {
              translation: {
                en: 'Gatineau',
                fr: 'Gatineau',
              },
            },
            identifier: 'Gatineau',
            score: null,
            textValue: 'Gatineau',
          },
          {
            displayValue: {
              translation: {
                en: 'Other',
                fr: 'Autre',
              },
            },
            identifier: 'Other',
            score: null,
            textValue: 'Other',
          },
          {
            displayValue: {
              translation: {
                en: 'Other (describe)',
                fr: 'Autre (préciser)',
              },
            },
            identifier: 'other',
            score: null,
            textValue: 'other',
          },
        ],
        identifier: 'Where do you reside.',
        question: {
          translation: {
            en: 'Where do you reside.',
            fr: 'Où résidez vous',
          },
        },
        questionType: 'radiogroup',
        score: undefined,
      },
      {
         answerChoices: null,
         identifier: 'Where do you reside.|Comment',
         question: {
           translation: {
             en: 'Where do you reside.|Comment',
             fr: 'Où résidez vous|Commentaires',
           },
         },
         questionType: 'comment',
      }]);
    });

    it('extracts for questions translated in french but with default english - dynamic panel with multitext', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.panelDynamicTranslatedFrenchEnglishDefault;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([
        {
          identifier: 'Complete the following for each of your children:',
          question: {
              translation: {
                  en: 'Complete the following for each of your children:',
                  fr: 'Si vous avez des enfants, remplissez ce qui suit :',
              },
          },
          questionType: 'paneldynamic',
          score: undefined,
          answerChoices: null,
      }, {
        identifier: "Complete the following for each of your children:|What is the name of the school attended by each of your children?|Child's name:",
        question: {
            translation: {
                en: "What is the name of the school attended by each of your children?|Child's name:",
                fr: "Complétez ce qui suit pour chacun de vos enfants|Nom de l'enfant :",
            },
        },
        questionType: 'multipletext',
        score: undefined,
        answerChoices: null,
    }, {
      identifier: "Complete the following for each of your children:|What is the name of the school attended by each of your children?|School's name:",
      question: {
          translation: {
              en: "What is the name of the school attended by each of your children?|School's name:",
              fr: "Complétez ce qui suit pour chacun de vos enfants|Nom de l'école :",
          },
      },
      questionType: 'multipletext',
      score: undefined,
      answerChoices: null,
  }]);
    });
    it('extracts for checkbox question type', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.checkboxQuestion;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([{
        answerChoices: [
          {
            displayValue: {
              translation: {
                en: 'item 1 en',
                fr: 'item 1 fr',
              },
            },
            identifier: 'item1',
            score: 1,
            textValue: 'item1',
          },
          {
            displayValue: {
              translation: {
                en: 'item 2 en',
                fr: 'item 2 fr',
              },
            },
            identifier: 'item2',
            score: 2,
            textValue: 'item2',
          },
          {
            displayValue: {
              translation: {
                en: 'item3',
                fr: 'item3',
              },
            },
            identifier: 'item3',
            score: null,
            textValue: 'item3',
          },
          {
            displayValue: {
              translation: {
                en: 'Other (describe) en',
                fr: 'other fr',
              },
            },
            identifier: 'other',
            score: null,
            textValue: 'other',
          },
          {
            displayValue: {
              translation: {
                en: 'None',
                fr: 'Aucun',
              },
            },
            identifier: 'none',
            score: null,
            textValue: 'none',
          },
        ],
        identifier: 'question1',
        question: {
          translation: {
            en: 'Text eng',
            fr: 'Text fr',
          },
        },
        questionType: 'checkbox',
        score: undefined,
      },
      {
        answerChoices: null,
        identifier: 'question1|Comment',
        question: {
          translation: {
            en: 'Text eng|Comment',
            fr: 'Text fr|Commentaires',
          },
        },
        questionType: 'comment',
      }]);
    });
    it('extracts for radiogroup question type', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.radiogroupQuestion;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([{
        answerChoices: [
          {
            displayValue: {
              translation: {
                en: 'item 1 en',
                fr: 'item 1 fr',
              },
            },
            identifier: 'item1',
            score: 1,
            textValue: 'item1',
          },
          {
            displayValue: {
              translation: {
                en: 'item 2 en',
                fr: 'item 2 fr',
              },
            },
            identifier: 'item2',
            score: 2,
            textValue: 'item2',
          },
          {
            displayValue: {
              translation: {
                en: 'item3',
                fr: 'item3',
              },
            },
            identifier: 'item3',
            score: null,
            textValue: 'item3',
          },
          {
            displayValue: {
              translation: {
                en: 'Other (describe)',
                fr: 'Autre (préciser)',
              },
            },
            identifier: 'other',
            score: null,
            textValue: 'other',
          },
          {
            displayValue: {
              translation: {
                en: 'None',
                fr: 'Aucun',
              },
            },
            identifier: 'none',
            score: null,
            textValue: 'none',
          },
        ],
        identifier: 'question1',
        question: {
          translation: {
            en: 'Text eng',
            fr: 'Text fr',
          },
        },
        questionType: 'radiogroup',
        score: undefined,
      },
      {
        answerChoices: null,
        identifier: 'question1|Comment',
        question: {
          translation: {
            en: 'Text eng|Comment',
            fr: 'Text fr|Commentaires',
          },
        },
        questionType: 'comment',
      }]);
    });
    it('extracts for dropdown question type', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.dropdownQuestion;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([{
        answerChoices: [
          {
            displayValue: {
              translation: {
                en: 'item 1 en',
                fr: 'item 1 fr',
              },
            },
            identifier: 'item1',
            score: 1,
            textValue: 'item1',
          },
          {
            displayValue: {
              translation: {
                en: 'item 2 en',
                fr: 'item 2 fr',
              },
            },
            identifier: 'item2',
            score: 2,
            textValue: 'item2',
          },
          {
            displayValue: {
              translation: {
                en: 'item3',
                fr: 'item3',
              },
            },
            identifier: 'item3',
            score: null,
            textValue: 'item3',
          }, {
            displayValue: {
              translation: {
                en: '1',
                fr: '1',
              },
            },
            identifier: '1',
            numericValue: 1,
            score: null,
            textValue: '1',
          },
          {
            displayValue: {
              translation: {
                en: '3',
                fr: '3',
              },
            },
            identifier: '3',
            numericValue: 3,
            score: null,
            textValue: '3',
          },
          {
            displayValue: {
              translation: {
                en: '5',
                fr: '5',
              },
            },
            identifier: '5',
            numericValue: 5,
            score: null,
            textValue: '5',
          },
          {
            displayValue: {
              translation: {
                en: 'Nonez',
                fr: 'Nonez',
              },
            },
            identifier: 'none',
            score: null,
            textValue: 'none',
          },
        ],
        identifier: 'question1',
        question: {
          translation: {
            en: 'Text eng',
            fr: 'Text fr',
          },
        },
        questionType: 'dropdown',
        score: undefined,
      },
      {
        answerChoices: null,
        identifier: 'question1|Comment',
        question: {
          translation: {
            en: 'Text eng|zzz',
            fr: 'Text fr|xxx',
          },
        },
        questionType: 'comment',
      }]);
    });
    it('extracts for comment question type', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.commentQuestion;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([{
        answerChoices: null,
        identifier: 'question1',
        question: {
          translation: {
            en: 'question1',
            fr: 'question1',
          },
        },
        questionType: 'comment',
      }]);
    });
    it('extracts for boolean question type', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.booleanQuestion;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([{
        answerChoices: [{
          displayValue: {
            translation: {
              en: 'why yes',
              fr: 'ouiii',
            },
          },
          identifier: '123',
          numericValue: 123,
          score: 1,
          textValue: '123',
        }, {
          displayValue: {
            translation: {
              en: 'No',
              fr: 'Non',
            },
          },
          identifier: 'false',
          score: 2,
          textValue: 'false',
        }],
        identifier: 'question1',
        question: {
          translation: {
            en: 'dddd',
            fr: 'xxx',
          },
        },
        questionType: 'boolean',
      }]);
    });
    it('extracts for yes-no question type', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.yesnoQuestion;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([{
        answerChoices: [{
          displayValue: {
            translation: {
              en: 'Yes',
              fr: 'Oui',
            },
          },
          identifier: 'yes',
          score: 12,
          textValue: 'yes',
        }, {
          displayValue: {
            translation: {
              en: 'No',
              fr: 'Non',
            },
          },
          identifier: 'no',
          score: -5,
          textValue: 'no',
        }],
        identifier: 'question1',
        question: {
          translation: {
            en: 'dddd',
            fr: 'xxx',
          },
        },
        questionType: 'yes-no',
      }]);
    });
    it('ignores for html question type', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.htmlQuestion;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([]);
    });
    it('ignores for image question type', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.imageQuestion;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([]);
    });
    it('extracts for multipletext question type', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.multipleTextQuestion;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([
        {
          answerChoices: null,
          identifier: 'question1|sub q 1',
          question: {
            translation: {
              en: 'dddd|sub q 1 text',
              fr: 'xxx|sub q1 fr',
            },
          },
          questionType: 'multipletext',
        },
        {
          answerChoices: null,
          identifier: 'question1|text2',
          question: {
            translation: {
              en: 'dddd|sub q 2 text',
              fr: 'xxx|sub q 2 text',
            },
          },
          questionType: 'multipletext',
        },
      ]);
    });
    it('extracts for matrix question type', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.matrixQuestion;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([
        {
          answerChoices: [
            {
              displayValue: {
                translation: {
                  en: '1 en',
                  fr: '1 fr',
                },
              },
              identifier: 'answer 1',
              score: 11,
              textValue: 'answer 1',
            },
            {
              displayValue: {
                translation: {
                  en: '2 en',
                  fr: '2 en',
                },
              },
              identifier: 'answer 2',
              score: 21,
              textValue: 'answer 2',
            },
            {
              displayValue: {
                translation: {
                  en: 'Column 3',
                  fr: 'Column 3',
                },
              },
              identifier: 'Column 3',
              score: 1,
              textValue: 'Column 3',
            },
          ],
          identifier: 'question1|sub q 1',
          question: {
            translation: {
              en: 'dddd|en',
              fr: 'xxx|fr',
            },
          },
          questionType: 'matrix',
          score: undefined,
        },
        {
          answerChoices: [
            {
              displayValue: {
                translation: {
                  en: '1 en',
                  fr: '1 fr',
                },
              },
              identifier: 'answer 1',
              score: 10,
              textValue: 'answer 1',
            },
            {
              displayValue: {
                translation: {
                  en: '2 en',
                  fr: '2 en',
                },
              },
              identifier: 'answer 2',
              score: 20,
              textValue: 'answer 2',
            },
            {
              displayValue: {
                translation: {
                  en: 'Column 3',
                  fr: 'Column 3',
                },
              },
              identifier: 'Column 3',
              score: null,
              textValue: 'Column 3',
            },
          ],
          identifier: 'question1|Row 2',
          question: {
            translation: {
              en: 'dddd|Row 2',
              fr: 'xxx|Row 2',
            },
          },
          questionType: 'matrix',
          score: undefined,
        },
        {
          answerChoices: [
            {
              displayValue: {
                translation: {
                  en: '1 en',
                  fr: '1 fr',
                },
              },
              identifier: 'answer 1',
              score: 10,
              textValue: 'answer 1',
            },
            {
              displayValue: {
                translation: {
                  en: '2 en',
                  fr: '2 en',
                },
              },
              identifier: 'answer 2',
              score: 20,
              textValue: 'answer 2',
            },
            {
              displayValue: {
                translation: {
                  en: 'Column 3',
                  fr: 'Column 3',
                },
              },
              identifier: 'Column 3',
              score: null,
              textValue: 'Column 3',
            },
          ],
          identifier: 'question1|Row 3',
          question: {
            translation: {
              en: 'dddd|Row 3',
              fr: 'xxx|Row 3',
            },
          },
          questionType: 'matrix',
          score: undefined,
        },
      ]);
    });
    it('extracts for matrixdropdown question type', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.matrixDropdownQuestion;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual(
        [
          {
            identifier: 'question3|Row 1|Column 1',
            questionType: 'matrixdropdown',
            question: {
              translation: {
                en: 'question3|lig 1 en|col 1 en',
                fr: 'question3|lig 1 en|col 1 fr',
              },
            },
            answerChoices: [
              {
                identifier: '1',
                displayValue: {
                  translation: {
                    en: 'val 1 en',
                    fr: 'val fr',
                  },
                },
                textValue: '1',
                score: 15,
                numericValue: 1,
              },
              {
                identifier: '2',
                displayValue: {
                  translation: {
                    en: '2',
                    fr: '2',
                  },
                },
                textValue: '2',
                score: 10,
                numericValue: 2,
              },
              {
                identifier: 'Yep',
                displayValue: {
                  translation: {
                    en: 'Yep',
                    fr: 'Yep',
                  },
                },
                textValue: 'Yep',
                score: 17,
              },
              {
                identifier: '4',
                displayValue: {
                  translation: {
                    en: '4',
                    fr: '4',
                  },
                },
                textValue: '4',
                score: 10,
                numericValue: 4,
              },
              {
                identifier: 'nope',
                displayValue: {
                  translation: {
                    en: 'nope',
                    fr: 'nope',
                  },
                },
                textValue: 'nope',
                score: 10,
              },
            ],
          },
          {
            identifier: 'question3|Row 1|Column 2',
            questionType: 'matrixdropdown',
            question: {
              translation: {
                en: 'question3|lig 1 en|Column 2',
                fr: 'question3|lig 1 en|Column 2',
              },
            },
            answerChoices: [
              {
                identifier: '1',
                displayValue: {
                  translation: {
                    en: 'hello en',
                    fr: 'hello',
                  },
                },
                textValue: '1',
                score: 10,
                numericValue: 1,
              },
              {
                identifier: '2',
                displayValue: {
                  translation: {
                    en: '2',
                    fr: '2',
                  },
                },
                textValue: '2',
                score: 15,
                numericValue: 2,
              },
              {
                identifier: '3',
                displayValue: {
                  translation: {
                    en: '3',
                    fr: '3',
                  },
                },
                textValue: '3',
                score: 10,
                numericValue: 3,
              }, {
                displayValue: {
                  translation: {
                    en: 'Other (describe)zzz',
                    fr: 'autre',
                  },
                },
                identifier: 'other',
                score: 10,
                textValue: 'other',
              },
            ],
          },
          {
            answerChoices: null,
            identifier: 'question3|Row 1|Column 2|Comment',
            question: {
              translation: {
                en: 'question3|lig 1 en|Column 2|Comment',
                fr: 'question3|lig 1 en|Column 2|Commentaires',
              },
            },
            questionType: 'comment',
          },
          {
            identifier: 'question3|Row 1|col3',
            questionType: 'matrixdropdown',
            question: {
              translation: {
                en: 'question3|lig 1 en|col3',
                fr: 'question3|lig 1 en|col 3 fr',
              },
            },
            answerChoices: [
              {
                identifier: '1',
                displayValue: {
                  translation: {
                    en: 'val 1 en',
                    fr: 'val fr',
                  },
                },
                textValue: '1',
                score: 15,
                numericValue: 1,
              },
              {
                identifier: '2',
                displayValue: {
                  translation: {
                    en: '2',
                    fr: '2',
                  },
                },
                textValue: '2',
                score: 10,
                numericValue: 2,
              },
              {
                identifier: 'Yep',
                displayValue: {
                  translation: {
                    en: 'Yep',
                    fr: 'Yep',
                  },
                },
                textValue: 'Yep',
                score: 17,
              },
              {
                identifier: '4',
                displayValue: {
                  translation: {
                    en: '4',
                    fr: '4',
                  },
                },
                textValue: '4',
                score: 10,
                numericValue: 4,
              },
              {
                identifier: 'nope',
                displayValue: {
                  translation: {
                    en: 'nope',
                    fr: 'nope',
                  },
                },
                textValue: 'nope',
                score: 10,
              },
            ],
          },
          {
            identifier: 'question3|Row 2|Column 1',
            questionType: 'matrixdropdown',
            question: {
              translation: {
                en: 'question3|Row 2|col 1 en',
                fr: 'question3|ligne 2|col 1 fr',
              },
            },
            answerChoices: [
              {
                identifier: '1',
                displayValue: {
                  translation: {
                    en: 'val 1 en',
                    fr: 'val fr',
                  },
                },
                textValue: '1',
                score: 25,
                numericValue: 1,
              },
              {
                identifier: '2',
                displayValue: {
                  translation: {
                    en: '2',
                    fr: '2',
                  },
                },
                textValue: '2',
                score: 20,
                numericValue: 2,
              },
              {
                identifier: 'Yep',
                displayValue: {
                  translation: {
                    en: 'Yep',
                    fr: 'Yep',
                  },
                },
                textValue: 'Yep',
                score: 27,
              },
              {
                identifier: '4',
                displayValue: {
                  translation: {
                    en: '4',
                    fr: '4',
                  },
                },
                textValue: '4',
                score: 20,
                numericValue: 4,
              },
              {
                identifier: 'nope',
                displayValue: {
                  translation: {
                    en: 'nope',
                    fr: 'nope',
                  },
                },
                textValue: 'nope',
                score: 20,
              },
            ],
          },
          {
            identifier: 'question3|Row 2|Column 2',
            questionType: 'matrixdropdown',
            question: {
              translation: {
                en: 'question3|Row 2|Column 2',
                fr: 'question3|ligne 2|Column 2',
              },
            },
            answerChoices: [
              {
                identifier: '1',
                displayValue: {
                  translation: {
                    en: 'hello en',
                    fr: 'hello',
                  },
                },
                textValue: '1',
                score: 20,
                numericValue: 1,
              },
              {
                identifier: '2',
                displayValue: {
                  translation: {
                    en: '2',
                    fr: '2',
                  },
                },
                textValue: '2',
                score: 25,
                numericValue: 2,
              },
              {
                identifier: '3',
                displayValue: {
                  translation: {
                    en: '3',
                    fr: '3',
                  },
                },
                textValue: '3',
                score: 20,
                numericValue: 3,
              }, {
                displayValue: {
                  translation: {
                    en: 'Other (describe)zzz',
                    fr: 'autre',
                  },
                },
                identifier: 'other',
                score: 20,
                textValue: 'other',
              },
            ],
          },
          {
            answerChoices: null,
            identifier: 'question3|Row 2|Column 2|Comment',
            question: {
              translation: {
                en: 'question3|Row 2|Column 2|Comment',
                fr: 'question3|ligne 2|Column 2|Commentaires',
              },
            },
            questionType: 'comment',
          },
          {
            identifier: 'question3|Row 2|col3',
            questionType: 'matrixdropdown',
            question: {
              translation: {
                en: 'question3|Row 2|col3',
                fr: 'question3|ligne 2|col 3 fr',
              },
            },
            answerChoices: [
              {
                identifier: '1',
                displayValue: {
                  translation: {
                    en: 'val 1 en',
                    fr: 'val fr',
                  },
                },
                textValue: '1',
                score: 25,
                numericValue: 1,
              },
              {
                identifier: '2',
                displayValue: {
                  translation: {
                    en: '2',
                    fr: '2',
                  },
                },
                textValue: '2',
                score: 20,
                numericValue: 2,
              },
              {
                identifier: 'Yep',
                displayValue: {
                  translation: {
                    en: 'Yep',
                    fr: 'Yep',
                  },
                },
                textValue: 'Yep',
                score: 27,
              },
              {
                identifier: '4',
                displayValue: {
                  translation: {
                    en: '4',
                    fr: '4',
                  },
                },
                textValue: '4',
                score: 20,
                numericValue: 4,
              },
              {
                identifier: 'nope',
                displayValue: {
                  translation: {
                    en: 'nope',
                    fr: 'nope',
                  },
                },
                textValue: 'nope',
                score: 20,
              },
            ],
          },
          {
            identifier: 'question3|Row 3|Column 1',
            questionType: 'matrixdropdown',
            question: {
              translation: {
                en: 'question3|Row 3|col 1 en',
                fr: 'question3|Row 3|col 1 fr',
              },
            },
            answerChoices: [
              {
                identifier: '1',
                displayValue: {
                  translation: {
                    en: 'val 1 en',
                    fr: 'val fr',
                  },
                },
                textValue: '1',
                score: 5,
                numericValue: 1,
              },
              {
                identifier: '2',
                displayValue: {
                  translation: {
                    en: '2',
                    fr: '2',
                  },
                },
                textValue: '2',
                score: null,
                numericValue: 2,
              },
              {
                identifier: 'Yep',
                displayValue: {
                  translation: {
                    en: 'Yep',
                    fr: 'Yep',
                  },
                },
                textValue: 'Yep',
                score: 7,
              },
              {
                identifier: '4',
                displayValue: {
                  translation: {
                    en: '4',
                    fr: '4',
                  },
                },
                textValue: '4',
                score: null,
                numericValue: 4,
              },
              {
                identifier: 'nope',
                displayValue: {
                  translation: {
                    en: 'nope',
                    fr: 'nope',
                  },
                },
                textValue: 'nope',
                score: null,
              },
            ],
          },
          {
            identifier: 'question3|Row 3|Column 2',
            questionType: 'matrixdropdown',
            question: {
              translation: {
                en: 'question3|Row 3|Column 2',
                fr: 'question3|Row 3|Column 2',
              },
            },
            answerChoices: [
              {
                identifier: '1',
                displayValue: {
                  translation: {
                    en: 'hello en',
                    fr: 'hello',
                  },
                },
                textValue: '1',
                score: null,
                numericValue: 1,
              },
              {
                identifier: '2',
                displayValue: {
                  translation: {
                    en: '2',
                    fr: '2',
                  },
                },
                textValue: '2',
                score: 5,
                numericValue: 2,
              },
              {
                identifier: '3',
                displayValue: {
                  translation: {
                    en: '3',
                    fr: '3',
                  },
                },
                textValue: '3',
                score: null,
                numericValue: 3,
              }, {
                displayValue: {
                  translation: {
                    en: 'Other (describe)zzz',
                    fr: 'autre',
                  },
                },
                identifier: 'other',
                score: null,
                textValue: 'other',
              },
            ],
          },
          {
            answerChoices: null,
            identifier: 'question3|Row 3|Column 2|Comment',
            question: {
              translation: {
                en: 'question3|Row 3|Column 2|Comment',
                fr: 'question3|Row 3|Column 2|Commentaires',
              },
            },
            questionType: 'comment',
          },
          {
            identifier: 'question3|Row 3|col3',
            questionType: 'matrixdropdown',
            question: {
              translation: {
                en: 'question3|Row 3|col3',
                fr: 'question3|Row 3|col 3 fr',
              },
            },
            answerChoices: [
              {
                identifier: '1',
                displayValue: {
                  translation: {
                    en: 'val 1 en',
                    fr: 'val fr',
                  },
                },
                textValue: '1',
                score: 5,
                numericValue: 1,
              },
              {
                identifier: '2',
                displayValue: {
                  translation: {
                    en: '2',
                    fr: '2',
                  },
                },
                textValue: '2',
                score: null,
                numericValue: 2,
              },
              {
                identifier: 'Yep',
                displayValue: {
                  translation: {
                    en: 'Yep',
                    fr: 'Yep',
                  },
                },
                textValue: 'Yep',
                score: 7,
              },
              {
                identifier: '4',
                displayValue: {
                  translation: {
                    en: '4',
                    fr: '4',
                  },
                },
                textValue: '4',
                score: null,
                numericValue: 4,
              },
              {
                identifier: 'nope',
                displayValue: {
                  translation: {
                    en: 'nope',
                    fr: 'nope',
                  },
                },
                textValue: 'nope',
                score: null,
              },
            ],
          },
        ],

      );
    });
    it('extracts for rating question type', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.ratingQuestion;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([
        {
          answerChoices: [
            {
              displayValue: {
                translation: {
                  en: '1',
                  fr: '1',
                },
              },
              identifier: '1',
              score: null,
              textValue: '1',
              numericValue: 1,
            },
            {
              displayValue: {
                translation: {
                  en: '2',
                  fr: '2',
                },
              },
              identifier: '2',
              score: null,
              textValue: '2',
              numericValue: 2,
            },
            {
              displayValue: {
                translation: {
                  en: '3',
                  fr: '3',
                },
              },
              identifier: '3',
              score: null,
              textValue: '3',
              numericValue: 3,
            },
          ],
          identifier: 'question5',
          question: {
            translation: {
              en: 'rating with range',
              fr: 'rating with range',
            },
          },
          questionType: 'rating',
        },
        {
          answerChoices: null,
          identifier: 'question5|Comment',
          question: {
            translation: {
              en: 'rating with range|Comment',
              fr: 'rating with range|Commentaires',
            },
          },
          questionType: 'comment',
        },
      ]);
    });
    it('extracts for rating question type with steps', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.ratingQuestionWithStep;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([
        {
          answerChoices: [
            {
              displayValue: {
                translation: {
                  en: '2',
                  fr: '2',
                },
              },
              identifier: '2',
              score: null,
              textValue: '2',
              numericValue: 2,
            },
            {
              displayValue: {
                translation: {
                  en: '4',
                  fr: '4',
                },
              },
              identifier: '4',
              score: null,
              textValue: '4',
              numericValue: 4,
            },
            {
              displayValue: {
                translation: {
                  en: '6',
                  fr: '6',
                },
              },
              identifier: '6',
              score: null,
              textValue: '6',
              numericValue: 6,
            },
            {
              displayValue: {
                translation: {
                  en: '8',
                  fr: '8',
                },
              },
              identifier: '8',
              score: null,
              textValue: '8',
              numericValue: 8,
            },
          ],
          identifier: 'question5',
          question: {
            translation: {
              en: 'rating with range',
              fr: 'rating with range',
            },
          },
          questionType: 'rating',
        },
        {
          answerChoices: null,
          identifier: 'question5|Comment',
          question: {
            translation: {
              en: 'rating with range|Comment',
              fr: 'rating with range|Commentaires',
            },
          },
          questionType: 'comment',
        },
      ]);
    });

    it('extracts for rating question type with choices', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.ratingQuestionWithChoices;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([
        {
          answerChoices: [
            {
              displayValue: {
                translation: {
                  en: 'item1',
                  fr: 'item1',
                },
              },
              identifier: 'item1',
              score: 123,
              textValue: 'item1',
            },
            {
              displayValue: {
                translation: {
                  en: 'snd',
                  fr: '2e',
                },
              },
              identifier: 'item2',
              score: 456,
              textValue: 'item2',
            },
            {
              displayValue: {
                translation: {
                  en: 'trd',
                  fr: 'trd',
                },
              },
              identifier: 'item3',
              score: 4,
              textValue: 'item3',
            },
          ],
          identifier: 'question7',
          question: {
            translation: {
              en: 'rating with choices',
              fr: 'avec choix',
            },
          },
          questionType: 'rating',
        },
      ]);
    });

    it('ignores panels and extracts questions in it', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.panelQuestion;
      const questions = helper.getAssessmentQuestions();
      expect(questions.length).toEqual(1);
      expect(questions[0].questionType).toEqual('rating');
    });

    it('extracts from dynamicPanelQuestion', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.dynamicPanelQuestion;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([
        {
          identifier: 'your name',
          question: {
            translation: {
              en: 'your name',
              fr: 'your name',
            },
          },
          questionType: 'text',
          answerChoices: null,
        },
        {
          identifier: 'additional member panel',
          question: {
            translation: {
              en: 'Add additional members',
              fr: 'Ajouter membres',
            },
          },
          questionType: 'paneldynamic',
          answerChoices: null,
        },
        {
          identifier: 'additional member panel|additional member fname',
          question: {
            translation: {
              en: 'first name',
              fr: 'Prénom',
            },
          },
          questionType: 'text',
          answerChoices: null,
        },
        {
          identifier: 'additional member panel|additional member lname',
          question: {
            translation: {
              en: 'last name',
              fr: 'Nom de famille',
            },
          },
          questionType: 'text',
          answerChoices: null,
        },
        {
          identifier: 'additional member panel|complaint panel',
          question: {
            translation: {
              en: 'every complaint that person has',
              fr: 'Chaque plainte',
            },
          },
          questionType: 'paneldynamic',
          answerChoices: null,
        },
        {
          identifier: 'additional member panel|complaint panel|describe the issue',
          question: {
            translation: {
              en: 'describe the issue',
              fr: 'décrire',
            },
          },
          questionType: 'comment',
          answerChoices: null,
        },
      ]);
    });

    it('extracts from matrixdynamicQuestion', () => {
      helper.initializeSurveyJsCreator('en');
      helper.creator.text = surveyData.matrixdynamicQuestion;
      const questions = helper.getAssessmentQuestions();
      expect(questions).toEqual([
        {
          identifier: 'relativeillness',
          question: {
            translation: {
              en: 'Describe the illness or condition.',
              fr: 'Describe the illness or condition.',
            },
          },
          questionType: 'matrixdynamic',
          answerChoices: null,
        },
        {
          identifier: 'relativeillness|illness',
          question: {
            translation: {
              en: 'Describe the illness or condition.|Illness/Condition',
              fr: 'Describe the illness or condition.|Illness/Condition',
            },
          },
          questionType: 'dropdown',
          answerChoices: [
            {
              displayValue: {
                translation: {
                  en: 'Heart Disease',
                  fr: 'Maladie du coeur',
                },
              },
              identifier: 'Heart Disease',
              score: null,
              textValue: 'Heart Disease',
            },
            {
              displayValue: {
                translation: {
                  en: 'Diabetes type A',
                  fr: 'Diabetes type A',
                },
              },
              identifier: 'Diabetes',
              score: null,
              textValue: 'Diabetes',
            },
            {
              displayValue: {
                translation: {
                  en: 'Stroke en',
                  fr: 'Stroke fr',
                },
              },
              identifier: 'Stroke/TIA',
              score: null,
              textValue: 'Stroke/TIA',
            },
            {
              displayValue: {
                translation: {
                  en: 'High Blood Pressure',
                  fr: 'High Blood Pressure',
                },
              },
              identifier: 'High Blood Pressure',
              score: null,
              textValue: 'High Blood Pressure',
            },
          ],
        },
        {
          identifier: 'relativeillness|really',
          question: {
            translation: {
              en: 'Describe the illness or condition.|reallly ?? en',
              fr: 'Describe the illness or condition.|vraiment ??',
            },
          },
          questionType: 'dropdown',
          answerChoices: [
            {
              displayValue: {
                translation: {
                  en: 'yes en',
                  fr: 'oui',
                },
              },
              identifier: 'yes',
              score: 10,
              textValue: 'yes',
            },
            {
              displayValue: {
                translation: {
                  en: 'en',
                  fr: 'en',
                },
              },
              identifier: 'no',
              score: null,
              textValue: 'no',
            },
            {
              displayValue: {
                translation: {
                  en: 'maybe',
                  fr: 'maybe fr',
                },
              },
              identifier: 'maybe',
              score: 5,
              textValue: 'maybe',
            },
            {
              displayValue: {
                translation: {
                  en: 'Other (describe)',
                  fr: 'Autre (préciser)',
                },
              },
              identifier: 'other',
              score: null,
              textValue: 'other',
            },
            {
              displayValue: {
                translation: {
                  en: 'None',
                  fr: 'Aucun',
                },
              },
              identifier: 'none',
              score: null,
              textValue: 'none',
            },
          ],
        },
        {
          answerChoices: null,
          identifier: 'relativeillness|really|Comment',
          question: {
            translation: {
              en: 'Describe the illness or condition.|reallly ?? en|Comment',
              fr: 'Describe the illness or condition.|vraiment ??|Commentaires',
            },
          },
          questionType: 'comment',
        },
      ]);
    });
  });

  describe('getPropertyAsMultilingual', () => {
    it('returns prop as a multilingual with english as default', () => {
      const result = helper.getPropertyAsMultilingual('english only');
      expect(result).toEqual({
        translation: {
          en: 'english only',
          fr: 'english only',
        },
      });
    });
    it('returns prop with suffix as a multilingual with english as default', () => {
      const result = helper.getPropertyAsMultilingual('english only', 'eng suffix');
      expect(result).toEqual({
        translation: {
          en: 'english only|eng suffix',
          fr: 'english only|eng suffix',
        },
      });
    });
    it('returns prop as a multilingual with eng/fr', () => {
      const result = helper.getPropertyAsMultilingual({ en: 'english', fr: 'fr' });
      expect(result).toEqual({
        translation: {
          en: 'english',
          fr: 'fr',
        },
      });
    });
    it('returns prop with suffix as a multilingual with eng/fr', () => {
      const result = helper.getPropertyAsMultilingual({ en: 'english', fr: 'fr' }, { en: 'eng suffix', fr: 'fr suffix' });
      expect(result).toEqual({
        translation: {
          en: 'english|eng suffix',
          fr: 'fr|fr suffix',
        },
      });
    });
  });

  describe('previewCreated', () => {
    it('sets score to 0 and attaches to onValueChanged', () => {
      const creator = new SurveyCreator();
      creator.survey.onValueChanged.add = jest.fn();
      helper.previewCreated(null, creator as any);
      expect(helper.totalScore).toEqual(0);
      expect((creator.survey as any)._totalScore).toEqual(0);
      expect(creator.survey.onValueChanged.add).toHaveBeenCalledWith(helper.valueChangedNewScore);
    });
  });

  describe('valueChangedNewScore', () => {
    it('gets a new score that sums all answers', () => {
      helper.initializeSurveyJsCreator();
      helper.creator.text = surveyData.complexJson;
      helper.creator.survey.data = {
        Quality: {
          affordable: 1,
          'does what it claims': 4,
          'better then others': 1,
          'easy to use': 2,
        },
        satisfaction: '3',
        suggestions: 'test',
        'price to competitors': 'Less expensive',
        price: 'correct',
        pricelimit: {
          mostamount: '234',
        },
      };

      helper.valueChangedNewScore(helper.creator.survey as any);
      // for now we support price correct (radio) and quality-4 (matrix) to score a 10... more in the future story...
      expect(helper.totalScore).toEqual(20);
    });

    it('gets a new score that sums scores on both rows and columns for matrix', () => {
      helper.initializeSurveyJsCreator();
      helper.creator.text = surveyData.matrixQuestion;
      helper.creator.survey.data = surveyData.matrixAnswer;

      helper.valueChangedNewScore(helper.creator.survey as any);
      expect(helper.totalScore).toEqual(21);
    });

    it('applies also to survey runner', () => {
      helper.initializeSurveyJsRunner('en', surveyData.complexJson);
      helper.survey.data = {
        Quality: {
          affordable: 1,
          'does what it claims': 4,
          'better then others': 1,
          'easy to use': 2,
        },
        satisfaction: '3',
        suggestions: 'test',
        'price to competitors': 'Less expensive',
        price: 'correct',
        pricelimit: {
          mostamount: '234',
        },
      };

      helper.valueChangedNewScore(helper.survey);
      // for now we support price correct (radio) and quality-4 (matrix) to score a 10... more in the future story...
      expect(helper.totalScore).toEqual(20);
    });
  });

  describe('surveyToAssessmentResponse', () => {
    const checkQuestionIdentifiers = (surveyModelData: any, answerData: any) => {
      helper.initializeSurveyJsCreator();
      helper.creator.text = surveyModelData;
      helper.initializeSurveyJsRunner('en', surveyModelData);
      helper.survey.data = answerData;
      const questions = helper.getAssessmentQuestions();
      const answers = helper.surveyToAssessmentResponse(helper.survey);
      expect({ type: questions[0]?.questionType, i: answers.answeredQuestions.map((a) => a.assessmentQuestionIdentifier) })
        .toEqual({ type: questions[0]?.questionType, i: questions.map((q) => q.identifier) });
    };

    const checkQuestionAnswers = (surveyModelData: any, answerData: any, expected: IAnsweredQuestion[]) => {
      helper.initializeSurveyJsCreator();
      helper.creator.text = surveyModelData;
      helper.initializeSurveyJsRunner('fr', surveyModelData);
      helper.survey.data = answerData;
      const questions = helper.getAssessmentQuestions();
      const answers = helper.surveyToAssessmentResponse(helper.survey);
      expect({ type: questions[0]?.questionType, i: answers.answeredQuestions })
        .toEqual({ type: questions[0]?.questionType, i: expected });
    };

    describe('question identifiers', () => {
      it('returns the same list of question identifiers for complexJson', () => {
        checkQuestionIdentifiers(surveyData.complexJson, surveyData.complexJsonAnswers);
      });

      it('returns the same list of question identifiers for textQuestion', () => {
        checkQuestionIdentifiers(surveyData.textQuestion, surveyData.textAnswers);
      });

      it('returns the same list of question identifiers for checkboxQuestion', () => {
        checkQuestionIdentifiers(surveyData.checkboxQuestion, surveyData.checkboxAnswers);
      });

      it('returns the same list of question identifiers for radiogroupQuestion', () => {
        checkQuestionIdentifiers(surveyData.radiogroupQuestion, surveyData.radiogroupAnswers);
      });

      it('returns the same list of question identifiers for dropdownQuestion', () => {
        checkQuestionIdentifiers(surveyData.dropdownQuestion, surveyData.dropdownAnswer);
      });

      it('returns the same list of question identifiers for commentQuestion', () => {
        checkQuestionIdentifiers(surveyData.commentQuestion, surveyData.commentAnswer);
      });

      it('returns the same list of question identifiers for booleanQuestion', () => {
        checkQuestionIdentifiers(surveyData.booleanQuestion, surveyData.booleanAnswer);
      });

      it('returns the same list of question identifiers for yesnoQuestion', () => {
        checkQuestionIdentifiers(surveyData.yesnoQuestion, surveyData.yesnoAnswer);
      });

      it('returns the same list of question identifiers for htmlQuestion', () => {
        checkQuestionIdentifiers(surveyData.htmlQuestion, surveyData.htmlAnswer);
      });

      it('returns the same list of question identifiers for imageQuestion', () => {
        checkQuestionIdentifiers(surveyData.imageQuestion, surveyData.htmlAnswer);
      });

      it('returns the same list of question identifiers for multipleTextQuestion', () => {
        checkQuestionIdentifiers(surveyData.multipleTextQuestion, surveyData.multipleTextAnswer);
      });

      it('returns the same list of question identifiers for matrixQuestion', () => {
        checkQuestionIdentifiers(surveyData.matrixQuestion, surveyData.matrixAnswer);
      });

      it('returns the same list of question identifiers for matrixDropdownQuestion', () => {
        checkQuestionIdentifiers(surveyData.matrixDropdownQuestion, surveyData.matrixDropdownAnswers);
      });

      it('returns the same list of question identifiers for ratingQuestion', () => {
        checkQuestionIdentifiers(surveyData.ratingQuestion, surveyData.ratingAnswer);
      });
    });

    describe('question answers', () => {
      it('returns the answer for complexJson', () => {
        checkQuestionAnswers(surveyData.complexJson, surveyData.complexJsonAnswers, [
          {
            assessmentQuestionIdentifier: 'Quality|affordable',
            responses: [
              {
                displayValue: 'Très en désaccord',
                textValue: '1',
                numericValue: 1,
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'Quality|does what it claims',
            responses: [
              {
                displayValue: 'En désaccord',
                textValue: '2',
                numericValue: 2,
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'Quality|better then others',
            responses: [
              {
                displayValue: 'Neutre',
                textValue: '3',
                numericValue: 3,
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'Quality|easy to use',
            responses: [
              {
                displayValue: 'Très en accord',
                textValue: '5',
                numericValue: 5,
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'satisfaction',
            responses: [
              {
                displayValue: 'val 3',
                textValue: '3',
                numericValue: 3,
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'recommend friends',
            responses: [
              {
                displayValue: '4',
                textValue: '4',
                numericValue: 4,
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'suggestions',
            responses: [
              {
                displayValue: 'tests',
                textValue: 'tests',
                numericValue: null,
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'price to competitors',
            responses: [
              {
                displayValue: 'Priced about the same',
                textValue: 'Priced about the same',
                numericValue: null,
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'price',
            responses: [
              {
                displayValue: 'No, the price is too low for your product',
                textValue: 'low',
                numericValue: null,
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'pricelimit|mostamount',
            responses: [
              {
                displayValue: '124.34',
                textValue: '124.34',
                numericValue: null,
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'pricelimit|leastamount',
            responses: [
              {
                displayValue: '1223$',
                textValue: '1223$',
                numericValue: null,
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'email',
            responses: [
              {
                displayValue: 'mmmm@mail.com',
                textValue: 'mmmm@mail.com',
                numericValue: null,
              },
            ],
          },
        ]);
      });

      it('returns the answer for textQuestion', () => {
        checkQuestionAnswers(surveyData.textQuestion, surveyData.textAnswers, [{
          assessmentQuestionIdentifier: 'question1',
          responses: [{ displayValue: 'test text', textValue: 'test text', numericValue: null }],
        }]);
      });

      it('returns the answer for checkboxQuestion', () => {
        checkQuestionAnswers(surveyData.checkboxQuestion, surveyData.checkboxAnswers, [{
          assessmentQuestionIdentifier: 'question1',
          responses: [{ textValue: 'other', displayValue: 'other fr', numericValue: null },
            { textValue: 'item2', displayValue: 'item 2 fr', numericValue: null }],
        }, {
          assessmentQuestionIdentifier: 'question1|Comment',
          responses: [{ textValue: 'test', displayValue: 'test' }],
        }]);

        checkQuestionAnswers(surveyData.checkboxQuestion, surveyData.checkboxAnswersNoComment, [{
          assessmentQuestionIdentifier: 'question1',
          responses: [{ textValue: 'other', displayValue: 'other fr', numericValue: null },
            { textValue: 'item2', displayValue: 'item 2 fr', numericValue: null }],
        }]);

        checkQuestionAnswers(surveyData.checkboxQuestion, surveyData.checkboxAnswersNone, [{
          assessmentQuestionIdentifier: 'question1',
          responses: [{ textValue: 'none', displayValue: 'Aucun', numericValue: null }],
        }]);
      });

      it('returns the answer for radiogroupQuestion', () => {
        checkQuestionAnswers(surveyData.radiogroupQuestion, surveyData.radiogroupAnswers, [{
          assessmentQuestionIdentifier: 'question1',
          responses: [{ textValue: 'other', displayValue: 'Autre (préciser)', numericValue: null }],
        }, {
          assessmentQuestionIdentifier: 'question1|Comment',
          responses: [{ textValue: 'test', displayValue: 'test' }],
        }]);
      });

      it('returns the answer for dropdownQuestion', () => {
        checkQuestionAnswers(surveyData.dropdownQuestion, surveyData.dropdownAnswer, [{
          assessmentQuestionIdentifier: 'question1',
          responses: [{ textValue: '1', displayValue: '1', numericValue: 1 }],
        }, {
          assessmentQuestionIdentifier: 'question1|Comment',
          responses: [{ textValue: 'zzzzzz', displayValue: 'zzzzzz' }],
        }]);
      });

      it('returns the answer for commentQuestion', () => {
        checkQuestionAnswers(surveyData.commentQuestion, surveyData.commentAnswer, [{
          assessmentQuestionIdentifier: 'question1',
          responses: [{ displayValue: 'fdgdfg\nfdfkdjhgkf\n\n\nfdgdfgdf', textValue: 'fdgdfg\nfdfkdjhgkf\n\n\nfdgdfgdf', numericValue: null }],
        }]);
      });

      it('returns the answer for booleanQuestion', () => {
        checkQuestionAnswers(surveyData.booleanQuestion, surveyData.booleanAnswer, [
          {
            assessmentQuestionIdentifier: 'question1',
            responses: [{ displayValue: 'ouiii', textValue: '123', numericValue: 123 }],
          },
        ]);
        checkQuestionAnswers(surveyData.booleanQuestion, surveyData.booleanAnswerNo, [
          {
            assessmentQuestionIdentifier: 'question1',
            responses: [{ displayValue: 'Non', textValue: 'false', numericValue: null }],
          },
        ]);
      });

      it('returns the answer for yesnoQuestion', () => {
        checkQuestionAnswers(surveyData.yesnoQuestion, surveyData.yesnoAnswer, [
          {
            assessmentQuestionIdentifier: 'question1',
            responses: [{ displayValue: 'Oui', textValue: 'yes', numericValue: null }],
          },
        ]);
        checkQuestionAnswers(surveyData.yesnoQuestion, surveyData.yesnoAnswerNo, [
          {
            assessmentQuestionIdentifier: 'question1',
            responses: [{ displayValue: 'Non', textValue: 'no', numericValue: null }],
          },
        ]);
      });

      it('returns the answer for htmlQuestion', () => {
        checkQuestionAnswers(surveyData.htmlQuestion, surveyData.htmlAnswer, []);
      });

      it('returns the answer for imageQuestion', () => {
        checkQuestionAnswers(surveyData.imageQuestion, surveyData.imageAnswer, []);
      });

      it('returns the answer for multipleTextQuestion', () => {
        checkQuestionAnswers(surveyData.multipleTextQuestion, surveyData.multipleTextAnswer, [
          {
            assessmentQuestionIdentifier: 'question1|sub q 1',
            responses: [{ displayValue: 'sub answer 1', textValue: 'sub answer 1', numericValue: null }],
          },
          {
            assessmentQuestionIdentifier: 'question1|text2',
            responses: [{ displayValue: 'sub answer 2', textValue: 'sub answer 2', numericValue: null }],
          },
        ]);
      });

      it('returns the answer for matrixQuestion', () => {
        checkQuestionAnswers(surveyData.matrixQuestion, surveyData.matrixAnswer, [
          {
            assessmentQuestionIdentifier: 'question1|sub q 1',
            responses: [{ displayValue: '1 fr', textValue: 'answer 1', numericValue: null }],
          },
          {
            assessmentQuestionIdentifier: 'question1|Row 2',
            responses: [{ displayValue: 'Column 3', textValue: 'Column 3', numericValue: null }],
          },
          {
            assessmentQuestionIdentifier: 'question1|Row 3',
            responses: [{ displayValue: '1 fr', textValue: 'answer 1', numericValue: null }],
          },
        ]);
      });

      it('returns the answer for matrixDropdownQuestion', () => {
        checkQuestionAnswers(surveyData.matrixDropdownQuestion, surveyData.matrixDropdownSomeAnswers, [
          {
            assessmentQuestionIdentifier: 'question3|Row 1|Column 1',
            responses: [{ displayValue: '2', textValue: '2', numericValue: 2 }],
          },
          {
            assessmentQuestionIdentifier: 'question3|Row 1|Column 2',
            responses: [{ displayValue: 'autre', textValue: 'other', numericValue: null }],
          },
          {
            assessmentQuestionIdentifier: 'question3|Row 1|Column 2|Comment',
            responses: [{ displayValue: 'etst', textValue: 'etst' }],
          },
          {
            assessmentQuestionIdentifier: 'question3|Row 1|col3',
            responses: [{ displayValue: '2', textValue: '2', numericValue: 2 }],
          },
          {
            assessmentQuestionIdentifier: 'question3|Row 2|Column 2',
            responses: [{ displayValue: '3', textValue: '3', numericValue: 3 }],
          },
          {
            assessmentQuestionIdentifier: 'question3|Row 3|Column 1',
            responses: [{ displayValue: 'Yep', textValue: 'Yep', numericValue: null }],
          },
          {
            assessmentQuestionIdentifier: 'question3|Row 3|col3',
            responses: [{ displayValue: 'nope', textValue: 'nope', numericValue: null }],
          },
        ]);
      });

      it('returns the answer for ratingQuestion', () => {
        checkQuestionAnswers(surveyData.ratingQuestion, surveyData.ratingAnswer, [{
          assessmentQuestionIdentifier: 'question5',
          responses: [{ textValue: '2', displayValue: '2', numericValue: 2 }],
        }, {
          assessmentQuestionIdentifier: 'question5|Comment',
          responses: [{ textValue: 'desc', displayValue: 'desc' }],
        }]);
        checkQuestionAnswers(surveyData.ratingQuestionWithChoices, surveyData.ratingAnswerWithChoices, [{
          assessmentQuestionIdentifier: 'question7',
          responses: [{ textValue: 'item2', displayValue: '2e', numericValue: null }],
        }]);
      });

      it('returns the answer for dynamicPanelQuestion', () => {
        checkQuestionAnswers(surveyData.dynamicPanelQuestion, surveyData.dynamicPanelAnswers, [
          {
            assessmentQuestionIdentifier: 'your name',
            responses: [
              {
                displayValue: 'test',
                numericValue: null,
                textValue: 'test',
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'additional member panel|additional member fname',
            parentIndexPath: 'additional member panel[0]|',
            responses: [
              {
                displayValue: 'Marc-Andre',
                numericValue: null,
                textValue: 'Marc-Andre',
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'additional member panel|additional member lname',
            parentIndexPath: 'additional member panel[0]|',
            responses: [
              {
                displayValue: 'Deschenes',
                numericValue: null,
                textValue: 'Deschenes',
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'additional member panel|complaint panel|describe the issue',
            parentIndexPath: 'additional member panel[0]|complaint panel[0]|',
            responses: [
              {
                displayValue: 'issue 1\ndescription',
                numericValue: null,
                textValue: 'issue 1\ndescription',
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'additional member panel|complaint panel|describe the issue',
            parentIndexPath: 'additional member panel[0]|complaint panel[1]|',
            responses: [
              {
                displayValue: 'issue 2 desc',
                numericValue: null,
                textValue: 'issue 2 desc',
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'additional member panel|additional member fname',
            parentIndexPath: 'additional member panel[1]|',
            responses: [
              {
                displayValue: 'Dana',
                numericValue: null,
                textValue: 'Dana',
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'additional member panel|additional member lname',
            parentIndexPath: 'additional member panel[1]|',
            responses: [
              {
                displayValue: 'Melania',
                numericValue: null,
                textValue: 'Melania',
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'additional member panel|complaint panel|describe the issue',
            parentIndexPath: 'additional member panel[1]|complaint panel[0]|',
            responses: [
              {
                displayValue: 'Complain 1 dana',
                numericValue: null,
                textValue: 'Complain 1 dana',
              },
            ],
          },
          {
            assessmentQuestionIdentifier: 'additional member panel|additional member lname',
            parentIndexPath: 'additional member panel[2]|',
            responses: [
              {
                displayValue: 'last',
                numericValue: null,
                textValue: 'last',
              },
            ],
          },
        ]);
      });
    });

    it('returns the answer for matrixdynamicQuestion', () => {
      checkQuestionAnswers(surveyData.matrixdynamicQuestion, surveyData.matrixdynamicAnswers, [
        {
          assessmentQuestionIdentifier: 'relativeillness|illness',
          parentIndexPath: 'relativeillness[0]|',
          responses: [
            {
              displayValue: 'Diabetes type A',
              numericValue: null,
              textValue: 'Diabetes',
            },
          ],
        },
        {
          assessmentQuestionIdentifier: 'relativeillness|really',
          parentIndexPath: 'relativeillness[0]|',
          responses: [{ displayValue: 'Autre (préciser)', textValue: 'other', numericValue: null }],
        },
        {
          assessmentQuestionIdentifier: 'relativeillness|really|Comment',
          parentIndexPath: 'relativeillness[0]|',
          responses: [
            {
              displayValue: 'zzzz',
              textValue: 'zzzz',
            },
          ],
        },
        {
          assessmentQuestionIdentifier: 'relativeillness|illness',
          parentIndexPath: 'relativeillness[1]|',
          responses: [
            {
              displayValue: 'Maladie du coeur',
              numericValue: null,
              textValue: 'Heart Disease',
            },
          ],
        },
        {
          assessmentQuestionIdentifier: 'relativeillness|really',
          parentIndexPath: 'relativeillness[1]|',
          responses: [
            {
              displayValue: 'oui',
              numericValue: null,
              textValue: 'yes',
            },
          ],
        },
        {
          assessmentQuestionIdentifier: 'relativeillness|illness',
          parentIndexPath: 'relativeillness[2]|',
          responses: [
            {
              displayValue: 'Stroke fr',
              numericValue: null,
              textValue: 'Stroke/TIA',
            },
          ],
        },
        {
          assessmentQuestionIdentifier: 'relativeillness|really',
          parentIndexPath: 'relativeillness[2]|',
          responses: [
            {
              displayValue: 'Aucun',
              numericValue: null,
              textValue: 'none',
            },
          ],
        },
      ]);
    });
  });
});
