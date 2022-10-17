/* eslint-disable max-len */
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import { mockAssessmentResponseEntity, mockAssessmentFormEntity } from '@libs/entities-lib/assessment-template';
import Component from './QuestionTab.vue';

const localVue = createLocalVue();
let storage = mockStorage();
let mockResponse = mockAssessmentResponseEntity();
let mockForm = mockAssessmentFormEntity();
let canEdit = true;

describe('QuestionTab.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        assessmentResponse: mockResponse,
        assessmentForm: mockForm,
        canEdit,
      },
      mocks: {
        $storage: storage,
      },
      ...additionalOverwrites,
    });

    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    storage = mockStorage();
    mockResponse = mockAssessmentResponseEntity();
    mockForm = mockAssessmentFormEntity();
    canEdit = false;
    jest.clearAllMocks();
  });

  describe('Template', () => {
    describe('data table', () => {
      beforeEach(async () => {
        await mountWrapper(true);
      });

      it('displays the correct header values depending on editing', async () => {
        let headers = wrapper.findAll('th');

        expect(headers.length).toBe(2);

        expect(headers.wrappers[0].text()).toBe('assessment.questions');
        expect(headers.wrappers[1].text()).toBe('assessment.responses');

        await wrapper.setProps({ canEdit: true });
        headers = wrapper.findAll('th');

        expect(headers.length).toBe(3);
        expect(headers.wrappers[2].text()).toBe('');
      });

      it('displays the correct row depending on editing', async () => {
        let tds = wrapper.findAll('td');

        expect(tds.wrappers[0].text()).toBe('question1');
        expect(tds.wrappers[1].text()).toBe('');
        expect(tds.wrappers[2].text()).toBe('question2');
        expect(tds.wrappers[3].text()).toBe('item1, item2');

        await wrapper.setProps({ canEdit: true });
        tds = wrapper.findAll('td');

        expect(tds.wrappers[0].text()).toBe('question1');
        expect(tds.wrappers[1].text()).toBe('');
        expect(tds.wrappers[2].text()).toBe('');
        expect(tds.wrappers[3].text()).toBe('question2');
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
            answer: undefined,
            displayAnswer: '',
            history: [],
            isMultiple: false,
            question: {
              answerChoices: null, identifier: 'question1', question: { translation: { en: 'question1', fr: 'question1' } }, questionType: 'text',
            },
          }, {
            answer: { assessmentQuestionIdentifier: 'question2', responses: [{ displayValue: 'item1', numericValue: null, textValue: 'item1' }, { displayValue: 'item2', numericValue: null, textValue: 'item2' }] },
            displayAnswer: 'item1, item2',
            history: [],
            isMultiple: true,
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
              identifier: 'question2',
              question: { translation: { en: 'question2', fr: 'question2' } },
              questionType: 'checkbox',
            },
          }, {
            answer: undefined,
            displayAnswer: '',
            history: [],
            isMultiple: false,
            question: {
              answerChoices: null, identifier: 'question2|Comment', question: { translation: { en: 'question2|Comment', fr: 'question2|Commentaires' } }, questionType: 'text',
            },
          }, {
            answer: { assessmentQuestionIdentifier: 'question3', responses: [{ displayValue: 'item2', numericValue: null, textValue: 'item2' }] },
            displayAnswer: 'item2',
            history: [],
            isMultiple: true,
            question: {
              answerChoices: [{
                displayValue: { translation: { en: 'item1', fr: 'item1' } }, identifier: 'item1', score: null, textValue: 'item1',
              }, {
                displayValue: { translation: { en: 'item2', fr: 'item2' } }, identifier: 'item2', score: null, textValue: 'item2',
              }, {
                displayValue: { translation: { en: 'item3', fr: 'item3' } }, identifier: 'item3', score: null, textValue: 'item3',
              }],
              identifier: 'question3',
              question: { translation: { en: 'question3', fr: 'question3' } },
              questionType: 'checkbox',
            },
          }, {
            answer: undefined,
            displayAnswer: '',
            history: [],
            isMultiple: false,
            question: {
              answerChoices: null, identifier: 'question4', question: { translation: { en: 'question4', fr: 'question4' } }, questionType: 'text',
            },
          }],
        );
      });

      it('sets history when response is completed', async () => {
        mockResponse.dateCompleted = '2022-10-11T17:20:35.568709Z';
        mockResponse.answeredQuestionsHistory = [{
          assessmentQuestionIdentifier: 'question2',
          answeredOn: '2022-10-11T17:20:35.568709Z',
          crcUserName: 'myuser',
          responses: [{ displayValue: 'item1', numericValue: null, textValue: 'item1' }],
        },
        {
          assessmentQuestionIdentifier: 'question2',
          answeredOn: '2022-10-11T17:25:35.568709Z',
          crcUserName: 'myuser2',
          responses: [{ displayValue: 'item1', numericValue: null, textValue: 'item1' }, { displayValue: 'item2', numericValue: null, textValue: 'item2' }],
        },
        {
          assessmentQuestionIdentifier: 'question4',
          answeredOn: '2022-10-11T17:20:35.568709Z',
          crcUserName: 'myuser',
          responses: [{ displayValue: 'my typed text', numericValue: null, textValue: 'my typed text' }],
        }];
        mockResponse.answeredQuestions.push({ assessmentQuestionIdentifier: 'question4', responses: [{ displayValue: 'my typed text', numericValue: null, textValue: 'my typed text' }] });

        await mountWrapper();
        const data = wrapper.vm.questionsAndAnswers;

        expect(data).toEqual(
          [{
            answer: undefined,
            displayAnswer: '',
            history: [{ assessmentQuestionIdentifier: 'question1', displayAnswer: '', responses: [] }],
            isMultiple: false,
            question: {
              answerChoices: null, identifier: 'question1', question: { translation: { en: 'question1', fr: 'question1' } }, questionType: 'text',
            },
          }, {
            answer: { assessmentQuestionIdentifier: 'question2', responses: [{ displayValue: 'item1', numericValue: null, textValue: 'item1' }, { displayValue: 'item2', numericValue: null, textValue: 'item2' }] },
            displayAnswer: 'item1, item2',
            history: [{
              assessmentQuestionIdentifier: 'question2',
              answeredOn: '2022-10-11T17:20:35.568709Z',
              crcUserName: 'myuser',
              displayAnswer: 'item1',
              responses: [{ displayValue: 'item1', numericValue: null, textValue: 'item1' }],
            },
            {
              assessmentQuestionIdentifier: 'question2',
              answeredOn: '2022-10-11T17:25:35.568709Z',
              crcUserName: 'myuser2',
              displayAnswer: 'item1, item2',
              responses: [{ displayValue: 'item1', numericValue: null, textValue: 'item1' }, { displayValue: 'item2', numericValue: null, textValue: 'item2' }],
            }],
            isMultiple: true,
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
              identifier: 'question2',
              question: { translation: { en: 'question2', fr: 'question2' } },
              questionType: 'checkbox',
            },
          }, {
            answer: undefined,
            displayAnswer: '',
            history: [{ assessmentQuestionIdentifier: 'question2|Comment', displayAnswer: '', responses: [] }],
            isMultiple: false,
            question: {
              answerChoices: null, identifier: 'question2|Comment', question: { translation: { en: 'question2|Comment', fr: 'question2|Commentaires' } }, questionType: 'text',
            },
          }, {
            answer: { assessmentQuestionIdentifier: 'question3', responses: [{ displayValue: 'item2', numericValue: null, textValue: 'item2' }] },
            displayAnswer: 'item2',
            history: [{ assessmentQuestionIdentifier: 'question3', displayAnswer: '', responses: [] }],
            isMultiple: true,
            question: {
              answerChoices: [{
                displayValue: { translation: { en: 'item1', fr: 'item1' } }, identifier: 'item1', score: null, textValue: 'item1',
              }, {
                displayValue: { translation: { en: 'item2', fr: 'item2' } }, identifier: 'item2', score: null, textValue: 'item2',
              }, {
                displayValue: { translation: { en: 'item3', fr: 'item3' } }, identifier: 'item3', score: null, textValue: 'item3',
              }],
              identifier: 'question3',
              question: { translation: { en: 'question3', fr: 'question3' } },
              questionType: 'checkbox',
            },
          }, {
            answer: { assessmentQuestionIdentifier: 'question4', responses: [{ displayValue: 'my typed text', numericValue: null, textValue: 'my typed text' }] },
            displayAnswer: 'my typed text',
            history: [{
              assessmentQuestionIdentifier: 'question4', answeredOn: '2022-10-11T17:20:35.568709Z', displayAnswer: 'my typed text', crcUserName: 'myuser', responses: [{ displayValue: 'my typed text', numericValue: null, textValue: 'my typed text' }],
            }],
            isMultiple: false,
            question: {
              answerChoices: null, identifier: 'question4', question: { translation: { en: 'question4', fr: 'question4' } }, questionType: 'text',
            },
          }],
        );
      });
    });

    describe('answerHasntChanged', () => {
      it('compares arrays without order', async () => {
        await mountWrapper();
        await wrapper.setData({ currentAnswer: ['item1', 'item2'], editedAnswer: ['item1', 'item2'] });
        expect(wrapper.vm.answerHasntChanged).toBeTruthy();
        await wrapper.setData({ currentAnswer: ['item1'], editedAnswer: ['item1', 'item2'] });
        expect(wrapper.vm.answerHasntChanged).toBeFalsy();
        await wrapper.setData({ currentAnswer: ['item2', 'item1'], editedAnswer: ['item1', 'item2'] });
        expect(wrapper.vm.answerHasntChanged).toBeTruthy();
        await wrapper.setData({ currentAnswer: ['item3', 'item1'], editedAnswer: ['item1', 'item2'] });
        expect(wrapper.vm.answerHasntChanged).toBeFalsy();
        await wrapper.setData({ currentAnswer: [], editedAnswer: [] });
        expect(wrapper.vm.answerHasntChanged).toBeTruthy();
      });
    });
  });

  describe('methods', () => {
    describe('editQuestion', () => {
      it('sets variables to edit', async () => {
        await mountWrapper();
        const q = wrapper.vm.questionsAndAnswers[1];
        wrapper.vm.editQuestion(q);

        expect(wrapper.vm.editedQuestion).toBe(q);
        expect(wrapper.vm.currentAnswer).toEqual(['item1', 'item2']);
        expect(wrapper.vm.editedAnswer).toEqual(['item1', 'item2']);
      });
    });
    describe('cancelEdit', () => {
      it('resets variables from edit', async () => {
        await mountWrapper();
        const q = wrapper.vm.questionsAndAnswers[1];
        wrapper.vm.editQuestion(q);
        wrapper.vm.cancelEdit();

        expect(wrapper.vm.editedQuestion).toBeNull();
        expect(wrapper.vm.currentAnswer).toEqual([]);
        expect(wrapper.vm.editedAnswer).toEqual([]);
      });
    });
    describe('applyEdit', () => {
      it('calls storage with formatted new data', async () => {
        await mountWrapper();
        const q = wrapper.vm.questionsAndAnswers[1];
        wrapper.vm.editQuestion(q);

        await wrapper.vm.applyEdit();
        expect(storage.assessmentResponse.actions.editAssessmentAnsweredQuestion).toHaveBeenCalledWith({
          id: wrapper.vm.assessmentResponse.id, responses: [{ displayValue: 'item1', numericValue: null, textValue: 'item1' }, { displayValue: 'item2', numericValue: null, textValue: 'item2' }], assessmentQuestionIdentifier: 'question2',
        });
        expect(wrapper.vm.editedQuestion).toEqual(null);

        wrapper.vm.editQuestion(q);
        await wrapper.setData({ editedAnswer: ['item1'] });

        await wrapper.vm.applyEdit();
        expect(storage.assessmentResponse.actions.editAssessmentAnsweredQuestion).toHaveBeenCalledWith({
          id: wrapper.vm.assessmentResponse.id, responses: [{ displayValue: 'item1', numericValue: null, textValue: 'item1' }], assessmentQuestionIdentifier: 'question2',
        });
        expect(wrapper.vm.editedQuestion).toEqual(null);

        wrapper.vm.editQuestion(q);
        await wrapper.setData({ editedAnswer: [null] });

        await wrapper.vm.applyEdit();
        expect(storage.assessmentResponse.actions.editAssessmentAnsweredQuestion).toHaveBeenCalledWith({
          id: wrapper.vm.assessmentResponse.id, responses: [], assessmentQuestionIdentifier: 'question2',
        });
        expect(wrapper.vm.editedQuestion).toEqual(null);
      });
    });
  });
});
