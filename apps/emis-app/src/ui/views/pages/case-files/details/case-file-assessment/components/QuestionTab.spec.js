/* eslint-disable max-len */
import _cloneDeep from 'lodash/cloneDeep';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import {
  mockAssessmentResponseEntity, mockAssessmentFormEntity, mockAssessmentResponseEntityWithPanels, mockAssessmentFormEntityWithPanels,
} from '@libs/entities-lib/assessment-template';
import { createTestingPinia } from '@pinia/testing';
import Component from './QuestionTab.vue';

const localVue = createLocalVue();
let mockResponse = mockAssessmentResponseEntity();
let mockForm = mockAssessmentFormEntity();
let pinia = createTestingPinia({ stubActions: false });

describe('QuestionTab.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        assessmentResponse: mockResponse,
        assessmentForm: mockForm,
      },
      mocks: {
      },
      ...additionalOverwrites,
    });

    await wrapper.vm.$nextTick();
  };

  beforeEach(() => {
    pinia = createTestingPinia({ stubActions: false });
    mockResponse = mockAssessmentResponseEntity();
    mockForm = mockAssessmentFormEntity();
    jest.clearAllMocks();
  });

  describe('Template', () => {
    describe('data table', () => {
      beforeEach(async () => {
        await mountWrapper(true);
      });

      it('displays the correct header values', async () => {
        const headers = wrapper.findAll('th');

        expect(headers.length).toBe(2);

        expect(headers.wrappers[0].text()).toBe('assessment.questions');
        expect(headers.wrappers[1].text()).toBe('assessment.responses');
      });

      it('displays the correct row (no empty)', async () => {
        const tds = wrapper.findAll('td');

        expect(tds.wrappers[0].text()).toBe('question2');
        expect(tds.wrappers[1].text()).toBe('item1, item2');
      });
    });
  });

  describe('Computed', () => {
    describe('questionsAndAnswers', () => {
      it('should return mapped value', async () => {
        await mountWrapper();
        const data = wrapper.vm.questionsAndAnswers;
        expect(data).toEqual(
          [{
            answer: {
              assessmentQuestionIdentifier: 'question2',
              questionId: 'question2id',
              responses: [{ displayValue: 'item1', numericValue: null, textValue: 'item1' }, { displayValue: 'item2', numericValue: null, textValue: 'item2' }],
            },
            displayAnswer: 'item1, item2',
            history: [],
            isMultiple: true,
            path: null,
            isDynamicRoot: false,
            childEntryIndexes: [],
            question: {
              answerChoices: [{
                displayValue: { translation: { en: 'item1', fr: 'item1' } }, identifier: 'item1', score: null, textValue: 'item1',
              }, {
                displayValue: { translation: { en: 'item2', fr: 'item2' } }, identifier: 'item2', score: null, textValue: 'item2',
              }, {
                displayValue: { translation: { en: 'item3', fr: 'item3' } }, identifier: 'item3', score: null, textValue: 'item3',
              }, {
                displayValue: { translation: { en: 'Other (describe)', fr: 'Autre (préciser)' } }, identifier: 'other', score: null, textValue: 'other',
              }],
              childEntryIndexes: [],
              path: null,
              identifier: 'question2',
              id: 'question2id',
              question: { translation: { en: 'question2', fr: 'question2' } },
              questionType: 'checkbox',
            },
          }, {
            answer: { assessmentQuestionIdentifier: 'question3', questionId: 'question3id', responses: [{ displayValue: 'item2', numericValue: null, textValue: 'item2' }] },
            displayAnswer: 'item2',
            history: [],
            isMultiple: true,
            path: null,
            isDynamicRoot: false,
            childEntryIndexes: [],
            question: {
              answerChoices: [{
                displayValue: { translation: { en: 'item1', fr: 'item1' } }, identifier: 'item1', score: null, textValue: 'item1',
              }, {
                displayValue: { translation: { en: 'item2', fr: 'item2' } }, identifier: 'item2', score: null, textValue: 'item2',
              }, {
                displayValue: { translation: { en: 'item3', fr: 'item3' } }, identifier: 'item3', score: null, textValue: 'item3',
              }],
              childEntryIndexes: [],
              path: null,
              identifier: 'question3',
              id: 'question3id',
              question: { translation: { en: 'question3', fr: 'question3' } },
              questionType: 'checkbox',
            },
          }],
        );
      });

      it('sets history when response is completed', async () => {
        mockResponse.dateCompleted = '2022-10-11T17:20:35.568709Z';
        mockResponse.answeredQuestionsHistory = [{
          assessmentQuestionIdentifier: 'question2',
          questionId: 'question2id',
          answeredOn: '2022-10-11T17:20:35.568709Z',
          crcUserName: 'myuser',
          responses: [{ displayValue: 'item1', numericValue: null, textValue: 'item1' }],
        },
        {
          assessmentQuestionIdentifier: 'question2',
          questionId: 'question2id',
          answeredOn: '2022-10-11T17:25:35.568709Z',
          crcUserName: 'myuser2',
          responses: [{ displayValue: 'item1', numericValue: null, textValue: 'item1' }, { displayValue: 'item2', numericValue: null, textValue: 'item2' }],
        },
        {
          assessmentQuestionIdentifier: 'question4',
          questionId: 'question4id',
          answeredOn: '2022-10-11T17:20:35.568709Z',
          crcUserName: 'myuser',
          responses: [{ displayValue: 'my typed text', numericValue: null, textValue: 'my typed text' }],
        }];
        mockResponse.answeredQuestions.push({
          assessmentQuestionIdentifier: 'question4',
          questionId: 'question4id',
          responses: [{ displayValue: 'my typed text', numericValue: null, textValue: 'my typed text' }],
        });

        await mountWrapper();
        const data = wrapper.vm.questionsAndAnswers;

        expect(data).toEqual(
          [{
            answer: {
              assessmentQuestionIdentifier: 'question2',
              questionId: 'question2id',
              responses: [{ displayValue: 'item1', numericValue: null, textValue: 'item1' }, { displayValue: 'item2', numericValue: null, textValue: 'item2' }],
            },
            displayAnswer: 'item1, item2',
            history: [{
              assessmentQuestionIdentifier: 'question2',
              questionId: 'question2id',
              answeredOn: '2022-10-11T17:20:35.568709Z',
              crcUserName: 'myuser',
              displayAnswer: 'item1',
              responses: [{ displayValue: 'item1', numericValue: null, textValue: 'item1' }],
            },
            {
              assessmentQuestionIdentifier: 'question2',
              questionId: 'question2id',
              answeredOn: '2022-10-11T17:25:35.568709Z',
              crcUserName: 'myuser2',
              displayAnswer: 'item1, item2',
              responses: [{ displayValue: 'item1', numericValue: null, textValue: 'item1' }, { displayValue: 'item2', numericValue: null, textValue: 'item2' }],
            }],
            isMultiple: true,
            path: null,
            isDynamicRoot: false,
            childEntryIndexes: [],
            question: {
              answerChoices: [{
                displayValue: { translation: { en: 'item1', fr: 'item1' } }, identifier: 'item1', score: null, textValue: 'item1',
              }, {
                displayValue: { translation: { en: 'item2', fr: 'item2' } }, identifier: 'item2', score: null, textValue: 'item2',
              }, {
                displayValue: { translation: { en: 'item3', fr: 'item3' } }, identifier: 'item3', score: null, textValue: 'item3',
              }, {
                displayValue: { translation: { en: 'Other (describe)', fr: 'Autre (préciser)' } }, identifier: 'other', score: null, textValue: 'other',
              }],
              childEntryIndexes: [],
              path: null,
              identifier: 'question2',
              id: 'question2id',
              question: { translation: { en: 'question2', fr: 'question2' } },
              questionType: 'checkbox',
            },
          }, {
            answer: { assessmentQuestionIdentifier: 'question3', questionId: 'question3id', responses: [{ displayValue: 'item2', numericValue: null, textValue: 'item2' }] },
            displayAnswer: 'item2',
            history: [{
              assessmentQuestionIdentifier: 'question3', questionId: 'question3id', displayAnswer: '', responses: [],
            }],
            isMultiple: true,
            path: null,
            isDynamicRoot: false,
            childEntryIndexes: [],
            question: {
              answerChoices: [{
                displayValue: { translation: { en: 'item1', fr: 'item1' } }, identifier: 'item1', score: null, textValue: 'item1',
              }, {
                displayValue: { translation: { en: 'item2', fr: 'item2' } }, identifier: 'item2', score: null, textValue: 'item2',
              }, {
                displayValue: { translation: { en: 'item3', fr: 'item3' } }, identifier: 'item3', score: null, textValue: 'item3',
              }],
              childEntryIndexes: [],
              path: null,
              identifier: 'question3',
              id: 'question3id',
              question: { translation: { en: 'question3', fr: 'question3' } },
              questionType: 'checkbox',
            },
          }, {
            answer: {
              assessmentQuestionIdentifier: 'question4',
              questionId: 'question4id',
              responses: [{ displayValue: 'my typed text', numericValue: null, textValue: 'my typed text' }],
            },
            displayAnswer: 'my typed text',
            history: [{
              assessmentQuestionIdentifier: 'question4',
              questionId: 'question4id',
              answeredOn: '2022-10-11T17:20:35.568709Z',
              displayAnswer: 'my typed text',
              crcUserName: 'myuser',
              responses: [{ displayValue: 'my typed text', numericValue: null, textValue: 'my typed text' }],
            }],
            isMultiple: false,
            path: null,
            isDynamicRoot: false,
            childEntryIndexes: [],
            question: {
              // eslint-disable-next-line vue/max-len
              answerChoices: null, childEntryIndexes: [], path: null, identifier: 'question4', id: 'question4id', question: { translation: { en: 'question4', fr: 'question4' } }, questionType: 'text',
            },
          }],
        );
      });
    });

    describe('questionGroups', () => {
      it('groups details according to question end date', async () => {
        const basicQuestion = {
          answer: undefined,
          displayAnswer: '',
          history: [],
          isMultiple: false,
          path: null,
          isDynamicRoot: false,
          childEntryIndexes: [],
          question: {
            // eslint-disable-next-line vue/max-len
            answerChoices: null, childEntryIndexes: [], path: null, identifier: 'question2|Comment', id: 'question2|Commentid', question: { translation: { en: 'question2|Comment', fr: 'question2|Commentaires' } }, questionType: 'text',
          },
        };
        let questions = [_cloneDeep(basicQuestion), _cloneDeep(basicQuestion), _cloneDeep(basicQuestion)];
        questions[0].question.endDate = new Date();
        questions[1].question.endDate = null;
        questions[2].question.endDate = new Date();
        await mountWrapper(false, {
          computed: {
            questionsAndAnswers: () => questions,
          },
        });
        expect(wrapper.vm.questionGroups).toEqual([[questions[1]], [questions[0], questions[2]]]);

        questions = [questions[1]];
        await mountWrapper(false, {
          computed: {
            questionsAndAnswers: () => questions,
          },
        });
        expect(wrapper.vm.questionGroups).toEqual([questions]);
      });
    });
  });

  describe('methods', () => {
    describe('regroupQuestions', () => {
      it('groups dynamic panels and multiplies questions by the number of panels', async () => {
        await mountWrapper();
        mockForm = mockAssessmentFormEntityWithPanels();
        mockResponse = mockAssessmentResponseEntityWithPanels();
        const vm = wrapper.vm;

        const result = vm.regroupQuestions(mockForm, mockResponse);

        expect(result.filter((q) => !q.path).length).toBe(2);
        expect(result.filter((q) => q.path && q.path.indexOf('panel1[0]') > -1).length).toBe(4);
        expect(result.filter((q) => q.path && q.path.indexOf('panel1[0]|question1[0]') > -1).length).toBe(0);
        expect(result.filter((q) => q.path && q.path.indexOf('panel1[1]|question1[0]') > -1).length).toBe(2);
        expect(result.filter((q) => q.path && q.path.indexOf('panel1[1]|question1[1]') > -1).length).toBe(2);

        expect(result).toEqual(
          [
            {
              answerChoices: null,
              identifier: 'panel1',
              id: 'panel1id',
              path: null,
              childEntryIndexes: [],
              question: {
                translation: {
                  en: 'panel 1 title en',
                  fr: 'panel 1 title en',
                },
              },
              questionType: 'paneldynamic',
              score: null,
            },
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
                  numericValue: null,
                  score: 1,
                  textValue: 'item1',
                },
                {
                  displayValue: {
                    translation: {
                      en: 'item2',
                      fr: 'item2',
                    },
                  },
                  identifier: 'item2',
                  numericValue: null,
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
                  numericValue: null,
                  score: 3,
                  textValue: 'item3',
                },
                {
                  displayValue: {
                    translation: {
                      en: 'None',
                      fr: 'Aucun',
                    },
                  },
                  identifier: 'none',
                  numericValue: null,
                  score: null,
                  textValue: 'none',
                },
              ],
              identifier: 'panel1|ddq',
              id: 'panel1|ddqid',
              path: 'panel1[0]',
              childEntryIndexes: [0],
              question: {
                translation: {
                  en: 'ddq',
                  fr: 'ddq',
                },
              },
              questionType: 'dropdown',
              score: null,
            },
            {
              answerChoices: null,
              identifier: 'panel1|ddq|Comment',
              id: 'panel1|ddq|Commentid',
              path: 'panel1[0]',
              childEntryIndexes: [0],
              question: {
                translation: {
                  en: 'ddq|Comment',
                  fr: 'ddq|Commentaires',
                },
              },
              questionType: 'comment',
              score: null,
            },
            {
              answerChoices: null,
              identifier: 'panel1|question4',
              id: 'panel1|question4id',
              path: 'panel1[0]',
              childEntryIndexes: [0],
              question: {
                translation: {
                  en: 'question4',
                  fr: 'question4',
                },
              },
              questionType: 'text',
              score: null,
            },
            {
              answerChoices: null,
              identifier: 'panel1|question1',
              id: 'panel1|question1id',
              path: 'panel1[0]',
              childEntryIndexes: [0],
              question: {
                translation: {
                  en: 'question1',
                  fr: 'question1',
                },
              },
              questionType: 'paneldynamic',
              score: null,
            },
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
                  numericValue: null,
                  score: 1,
                  textValue: 'item1',
                },
                {
                  displayValue: {
                    translation: {
                      en: 'item2',
                      fr: 'item2',
                    },
                  },
                  identifier: 'item2',
                  numericValue: null,
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
                  numericValue: null,
                  score: 3,
                  textValue: 'item3',
                },
                {
                  displayValue: {
                    translation: {
                      en: 'None',
                      fr: 'Aucun',
                    },
                  },
                  identifier: 'none',
                  numericValue: null,
                  score: null,
                  textValue: 'none',
                },
              ],
              identifier: 'panel1|ddq',
              id: 'panel1|ddqid',
              path: 'panel1[1]',
              childEntryIndexes: [1],
              question: {
                translation: {
                  en: 'ddq',
                  fr: 'ddq',
                },
              },
              questionType: 'dropdown',
              score: null,
            },
            {
              answerChoices: null,
              identifier: 'panel1|ddq|Comment',
              id: 'panel1|ddq|Commentid',
              path: 'panel1[1]',
              childEntryIndexes: [1],
              question: {
                translation: {
                  en: 'ddq|Comment',
                  fr: 'ddq|Commentaires',
                },
              },
              questionType: 'comment',
              score: null,
            },
            {
              answerChoices: null,
              identifier: 'panel1|question4',
              id: 'panel1|question4id',
              path: 'panel1[1]',
              childEntryIndexes: [1],
              question: {
                translation: {
                  en: 'question4',
                  fr: 'question4',
                },
              },
              questionType: 'text',
              score: null,
            },
            {
              answerChoices: null,
              identifier: 'panel1|question1',
              id: 'panel1|question1id',
              path: 'panel1[1]',
              childEntryIndexes: [1],
              question: {
                translation: {
                  en: 'question1',
                  fr: 'question1',
                },
              },
              questionType: 'paneldynamic',
              score: null,
            },
            {
              answerChoices: [
                {
                  displayValue: {
                    translation: {
                      en: 'nom en',
                      fr: 'nopm fr',
                    },
                  },
                  identifier: 'item1',
                  numericValue: null,
                  score: 10,
                  textValue: 'item1',
                },
                {
                  displayValue: {
                    translation: {
                      en: 'item2',
                      fr: 'item2',
                    },
                  },
                  identifier: 'item2',
                  numericValue: null,
                  score: 20,
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
                  numericValue: null,
                  score: 30,
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
                  numericValue: null,
                  score: null,
                  textValue: 'other',
                },
              ],
              identifier: 'panel1|question1|question2',
              id: 'panel1|question1|question2id',
              path: 'panel1[1]|question1[0]',
              childEntryIndexes: [1, 0],
              question: {
                translation: {
                  en: 'question2',
                  fr: 'question2',
                },
              },
              questionType: 'checkbox',
              score: null,
            },
            {
              answerChoices: null,
              identifier: 'panel1|question1|question2|Comment',
              id: 'panel1|question1|question2|Commentid',
              path: 'panel1[1]|question1[0]',
              childEntryIndexes: [1, 0],
              question: {
                translation: {
                  en: 'question2|Comment',
                  fr: 'question2|Commentaires',
                },
              },
              questionType: 'comment',
              score: null,
            },
            {
              answerChoices: [
                {
                  displayValue: {
                    translation: {
                      en: 'nom en',
                      fr: 'nopm fr',
                    },
                  },
                  identifier: 'item1',
                  numericValue: null,
                  score: 10,
                  textValue: 'item1',
                },
                {
                  displayValue: {
                    translation: {
                      en: 'item2',
                      fr: 'item2',
                    },
                  },
                  identifier: 'item2',
                  numericValue: null,
                  score: 20,
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
                  numericValue: null,
                  score: 30,
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
                  numericValue: null,
                  score: null,
                  textValue: 'other',
                },
              ],
              identifier: 'panel1|question1|question2',
              id: 'panel1|question1|question2id',
              path: 'panel1[1]|question1[1]',
              childEntryIndexes: [1, 1],
              question: {
                translation: {
                  en: 'question2',
                  fr: 'question2',
                },
              },
              questionType: 'checkbox',
              score: null,
            },
            {
              answerChoices: null,
              identifier: 'panel1|question1|question2|Comment',
              id: 'panel1|question1|question2|Commentid',
              path: 'panel1[1]|question1[1]',
              childEntryIndexes: [1, 1],
              question: {
                translation: {
                  en: 'question2|Comment',
                  fr: 'question2|Commentaires',
                },
              },
              questionType: 'comment',
              score: null,
            },
            {
              answerChoices: [
                {
                  displayValue: {
                    translation: {
                      en: 'Yes',
                      fr: 'Oui',
                    },
                  },
                  identifier: 'true',
                  numericValue: null,
                  score: null,
                  textValue: 'true',
                },
                {
                  displayValue: {
                    translation: {
                      en: 'No',
                      fr: 'Non',
                    },
                  },
                  identifier: 'false',
                  numericValue: null,
                  score: null,
                  textValue: 'false',
                },
              ],
              identifier: 'question3',
              id: 'question3id',
              path: null,
              childEntryIndexes: [],
              question: {
                translation: {
                  en: 'question3',
                  fr: 'question3',
                },
              },
              questionType: 'boolean',
              score: null,
            },
          ],
        );
      });
    });
  });
});
