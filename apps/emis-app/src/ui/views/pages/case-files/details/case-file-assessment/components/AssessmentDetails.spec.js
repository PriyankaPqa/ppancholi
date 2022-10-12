/* eslint-disable max-len */
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import routes from '@/constants/routes';
import { mockCombinedEvent, EEventStatus } from '@libs/entities-lib/event';
import Component from './AssessmentDetails.vue';

const localVue = createLocalVue();
let storage = mockStorage();
const mockEvent = mockCombinedEvent();
mockEvent.entity.schedule.status = EEventStatus.Open;

describe('AssessmentDetails.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        id: 'cfId',
        assessmentResponseId: 'assId',
      },
      computed: {
        event() {
          return mockEvent;
        },
      },
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
        $hasRole: (r) => r === hasRole,
        $storage: storage,
      },
      ...additionalOverwrites,
    });

    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    storage = mockStorage();
    jest.clearAllMocks();
  });

  describe('Template', () => {
    describe('data table', () => {
      let dataTable;
      beforeEach(async () => {
        await mountWrapper(true);
        dataTable = wrapper.findDataTest('question-list');
      });

      it('renders when selected tab is Questions', async () => {
        // default
        expect(dataTable.exists()).toBeTruthy();
        await wrapper.setData({ selectedTab: 'Scoring' });
        dataTable = wrapper.findDataTest('question-list');
        expect(dataTable.exists()).toBeFalsy();
        await wrapper.setData({ selectedTab: 'Questions' });
        dataTable = wrapper.findDataTest('question-list');
        expect(dataTable.exists()).toBeTruthy();
      });

      it('displays the correct header values', () => {
        const headers = wrapper.findAll('th');

        expect(headers.length).toBe(2);

        expect(headers.wrappers[0].text()).toBe('assessment.questions');
        expect(headers.wrappers[1].text()).toBe('assessment.responses');
      });

      it('displays the correct row', async () => {
        const tds = wrapper.findAll('td');

        expect(tds.wrappers[0].text()).toBe('question1');
        expect(tds.wrappers[1].text()).toBe('');
        expect(tds.wrappers[2].text()).toBe('question2');
        expect(tds.wrappers[3].text()).toBe('item1, item2');
      });
    });
  });

  describe('Computed', () => {
    describe('canEdit', () => {
      it('returns true if only if level1+ and not readonly', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canEdit).toBeTruthy();
        await mountWrapper(false, null, 'readonly');
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null, 'contributor3');
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, 1, null,
          {
            computed: {
              readonly() {
                return true;
              },
            },
          });
        expect(wrapper.vm.canEdit).toBeFalsy();
      });
    });

    describe('assessmentResponse', () => {
      it('calls storage', async () => {
        await mountWrapper();
        const data = wrapper.vm.assessmentResponse;
        expect(storage.assessmentResponse.getters.get).toHaveBeenCalledWith(wrapper.vm.assessmentResponseId);
        expect(data).toBe(storage.assessmentResponse.getters.get().entity);
      });
    });

    describe('assessmentForm', () => {
      it('calls storage', async () => {
        await mountWrapper();
        const data = wrapper.vm.assessmentForm;
        expect(storage.assessmentForm.getters.get).toHaveBeenCalledWith(wrapper.vm.assessmentResponse.assessmentFormId);
        expect(data).toBe(storage.assessmentForm.getters.get().entity);
      });
    });
    describe('questionsAndAnswers', () => {
      it('should return mapped value', async () => {
        await mountWrapper();
        const data = wrapper.vm.questionsAndAnswers;
        expect(data).toEqual(
          [{
            answer: undefined,
            displayAnswer: '',
            history: undefined,
            question: {
              answerChoices: null, identifier: 'question1', question: { translation: { en: 'question1', fr: 'question1' } }, questionType: 'text',
            },
          }, {
            answer: { assessmentQuestionIdentifier: 'question2', responses: [{ displayValue: 'item1', numericValue: null, textValue: 'item1' }, { displayValue: 'item2', numericValue: null, textValue: 'item2' }] },
            displayAnswer: 'item1, item2',
            history: undefined,
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
            history: undefined,
            question: {
              answerChoices: null, identifier: 'question2|Comment', question: { translation: { en: 'question2|Comment', fr: 'question2|Commentaires' } }, questionType: 'text',
            },
          }, {
            answer: { assessmentQuestionIdentifier: 'question3', responses: [{ displayValue: 'item2', numericValue: null, textValue: 'item2' }] },
            displayAnswer: 'item2',
            history: undefined,
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
            history: undefined,
            question: {
              answerChoices: null, identifier: 'question4', question: { translation: { en: 'question4', fr: 'question4' } }, questionType: 'text',
            },
          }],
        );
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('fetches data', async () => {
        await mountWrapper();
        expect(storage.assessmentResponse.actions.fetch).toHaveBeenCalledWith({ id: wrapper.vm.assessmentResponseId });
        expect(storage.assessmentForm.actions.fetch).toHaveBeenCalledWith({ id: wrapper.vm.assessmentResponse.assessmentFormId });
      });
    });
  });

  describe('methods', () => {
    describe('goToList', () => {
      it('should redirect to the case document home page', async () => {
        mountWrapper();
        wrapper.vm.goToList();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.caseFile.assessments.home.name,
        });
      });
    });
  });
});
