/* eslint-disable max-len */
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { EEventStatus, mockEventEntity } from '@libs/entities-lib/event';
import {
  CompletionStatus,
} from '@libs/entities-lib/assessment-template';
import { useMockAssessmentFormStore } from '@/pinia/assessment-form/assessment-form.mock';
import { useMockAssessmentResponseStore } from '@/pinia/assessment-response/assessment-response.mock';
import { createTestingPinia } from '@pinia/testing';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { UserRoles } from '@libs/entities-lib/user';
import Component from './AssessmentDetails.vue';

const localVue = createLocalVue();
const mockEvent = mockEventEntity();
mockEvent.schedule.status = EEventStatus.Open;
let pinia = createTestingPinia({ stubActions: false });
let assessmentFormStore = useMockAssessmentFormStore(pinia).assessmentFormStore;
let assessmentResponseStore = useMockAssessmentResponseStore(pinia).assessmentResponseStore;
const assessment = assessmentResponseStore.getById();

describe('AssessmentDetails.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
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
      },
      ...additionalOverwrites,
    });

    await wrapper.setData({ $route: { name: routes.caseFile.assessments.edit.name } });
    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    pinia = createTestingPinia({ stubActions: false });
    assessmentFormStore = useMockAssessmentFormStore(pinia).assessmentFormStore;
    assessmentResponseStore = useMockAssessmentResponseStore(pinia).assessmentResponseStore;
    useMockCaseFileStore(pinia);
    assessmentResponseStore.getById = jest.fn(() => assessment);
    assessment.completionStatus = CompletionStatus.Completed;
    jest.clearAllMocks();
  });

  describe('Template', () => {
    describe('question-tab', () => {
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
    });
  });

  describe('Computed', () => {
    describe('canEdit', () => {
      it('returns false if route is not edit', async () => {
        await mountWrapper(false, 3);
        expect(wrapper.vm.canEdit).toBeTruthy();

        await wrapper.setData({ $route: { name: routes.caseFile.assessments.details.name } });
        expect(wrapper.vm.canEdit).toBeFalsy();
      });
      it('returns false if response is not completed', async () => {
        await mountWrapper(false, 3);
        expect(wrapper.vm.canEdit).toBeTruthy();

        assessment.completionStatus = CompletionStatus.Partial;
        await mountWrapper(false, 3);
        expect(wrapper.vm.canEdit).toBeFalsy();
      });
      it('returns true if only if level3+ and not readonly', async () => {
        await mountWrapper(false, 3);
        expect(wrapper.vm.canEdit).toBeTruthy();
        await mountWrapper(false, 2);
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null, UserRoles.readonly);
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null, UserRoles.contributor3);
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(
          false,
          3,
          null,
          {
            computed: {
              readonly() {
                return true;
              },
            },
          },
        );
        expect(wrapper.vm.canEdit).toBeFalsy();
      });
    });

    describe('assessmentResponse', () => {
      it('calls the store', async () => {
        await mountWrapper();
        const data = wrapper.vm.assessmentResponse;
        expect(assessmentResponseStore.getById).toHaveBeenCalledWith(wrapper.vm.assessmentResponseId);
        expect(data).toBe(assessmentResponseStore.getById());
      });
    });

    describe('assessmentForm', () => {
      it('calls the store', async () => {
        await mountWrapper();
        const data = wrapper.vm.assessmentForm;
        expect(assessmentFormStore.getById).toHaveBeenCalledWith(wrapper.vm.assessmentResponse.assessmentFormId);
        expect(data).toBe(assessmentFormStore.getById());
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('fetches data', async () => {
        await mountWrapper();
        expect(assessmentResponseStore.fetch).toHaveBeenCalledWith({ id: wrapper.vm.assessmentResponseId });
        expect(assessmentFormStore.fetch).toHaveBeenCalledWith({ id: wrapper.vm.assessmentResponse.assessmentFormId });
      });
    });
  });

  describe('beforeRouteLeave', () => {
    let next;
    beforeEach(async () => {
      next = jest.fn(() => {});
      await mountWrapper();
    });

    it('calls next if the confirmation dialog returns true', async () => {
      await wrapper.setData({ hasPendingChanges: true });
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).toBeCalled();
    });

    it('does not call next if the confirmation dialog returns false', async () => {
      await wrapper.setData({ hasPendingChanges: true });
      wrapper.vm.$confirm = jest.fn(() => false);
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).not.toBeCalled();
    });

    it('calls next if dirty is false', async () => {
      await wrapper.setData({ hasPendingChanges: false });
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).toBeCalled();
    });
  });

  describe('methods', () => {
    describe('goToList', () => {
      it('should redirect to the case document home page', async () => {
        await mountWrapper();
        wrapper.vm.goToList();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.caseFile.assessments.home.name,
        });
      });
    });
  });
});
