/* eslint-disable max-len */
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import routes from '@/constants/routes';
import { mockCombinedEvent, EEventStatus } from '@libs/entities-lib/event';
import {
  CompletionStatus,
} from '@libs/entities-lib/assessment-template';
import Component from './AssessmentDetails.vue';

const localVue = createLocalVue();
let storage = mockStorage();
const mockEvent = mockCombinedEvent();
mockEvent.entity.schedule.status = EEventStatus.Open;
const assessment = storage.assessmentResponse.getters.get();

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

    await wrapper.setData({ $route: { name: routes.caseFile.assessments.edit.name } });
    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    storage = mockStorage();
    storage.assessmentResponse.getters.get = jest.fn(() => assessment);
    assessment.entity.completionStatus = CompletionStatus.Completed;
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

        assessment.entity.completionStatus = CompletionStatus.Partial;
        await mountWrapper(false, 3);
        expect(wrapper.vm.canEdit).toBeFalsy();
      });
      it('returns true if only if level3+ and not readonly', async () => {
        await mountWrapper(false, 3);
        expect(wrapper.vm.canEdit).toBeTruthy();
        await mountWrapper(false, 2);
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null, 'readonly');
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null, 'contributor3');
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
