import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import { mockCombinedEvent, EEventStatus } from '@libs/entities-lib/event';
import { Status } from '@libs/entities-lib/base';
import {
  AssociationType, AssessmentFrequencyType,
} from '@libs/entities-lib/assessment-template';
import Component from './CaseFileAssessment.vue';

const localVue = createLocalVue();
let storage = mockStorage();
const mockEvent = mockCombinedEvent();
mockEvent.entity.schedule.status = EEventStatus.Open;

describe('CaseFileAssessment.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        id: 'cfId',
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

  describe('Computed', () => {
    describe('canAdd', () => {
      it('returns true for level1+ when not readonly', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canAdd).toBeTruthy();
        await mountWrapper(false, 1, null,
          {
            computed: {
              readonly() {
                return true;
              },
            },
          });
        expect(wrapper.vm.canAdd).toBeFalsy();
        await mountWrapper(false, null);
        expect(wrapper.vm.canAdd).toBeFalsy();
        await mountWrapper(false, null, 'readonly');
        expect(wrapper.vm.canAdd).toBeFalsy();
        await mountWrapper(false, null, 'contributor3');
        expect(wrapper.vm.canAdd).toBeFalsy();
        await mountWrapper(false, null, 'contributorFinance');
        expect(wrapper.vm.canAdd).toBeFalsy();
      });
    });

    describe('items', () => {
      it('should call getById', async () => {
        await mountWrapper();
        await wrapper.setData({ searchResultIds: ['abc'] });
        const data = wrapper.vm.items;

        expect(storage.assessmentResponse.getters.getByIds).toHaveBeenCalled();

        const params = storage.assessmentResponse.getters.getByIds.mock.calls[storage.assessmentResponse.getters.getByIds.mock.calls.length - 1];
        expect(params[0]).toEqual(['abc']);
        expect(params[1].onlyActive).toBeTruthy();
        expect(params[1].baseDate).toEqual(wrapper.vm.searchExecutionDate);
        expect(params[1].prependPinnedItems).toBeTruthy();
        expect(params[1].parentId).toEqual({ 'association.id': 'cfId' });
        expect(data.length).toBe(storage.assessmentResponse.getters.getByIds().length);
      });
    });

    describe('assessments', () => {
      it('should call getById for ids in items', async () => {
        await mountWrapper();
        const items = wrapper.vm.items;
        const data = wrapper.vm.assessments;

        expect(storage.assessmentForm.getters.getByIds).toHaveBeenCalled();

        const params = storage.assessmentForm.getters.getByIds.mock.calls[storage.assessmentForm.getters.getByIds.mock.calls.length - 1];
        expect(params[0]).toEqual(items.map((i) => i.entity.assessmentFormId));
        expect(params[1].onlyActive).toBeTruthy();
        expect(params[1].baseDate).toBeFalsy();
        expect(params[1].prependPinnedItems).toBeFalsy();
        expect(params[1].parentId).toBeFalsy();
        expect(data.length).toBe(storage.assessmentForm.getters.getByIds().length);
      });
    });

    describe('oneTimeAssessmentsIds', () => {
      it('should filter for items one-time', async () => {
        await mountWrapper();
        expect(wrapper.vm.oneTimeAssessmentsIds).toEqual([]);

        const assessments = storage.assessmentForm.getters.getByIds();
        assessments[0].entity.frequency = AssessmentFrequencyType.OneTime;

        storage.assessmentForm.getters.getByIds = jest.fn(() => assessments);
        storage.assessmentResponse.getters.getByIds = jest.fn(() => assessments.map((a) => ({ entity: { assessmentFormId: a.entity.id } })));
        await mountWrapper();

        expect(wrapper.vm.oneTimeAssessmentsIds).toEqual([assessments[0].entity.id]);
      });
    });
  });

  describe('watch', () => {
    describe('items', () => {
      it('launches fetchAssessments', async () => {
        await mountWrapper();
        wrapper.vm.fetchAssessments = jest.fn();
        jest.clearAllMocks();
        await wrapper.setData({ searchResultIds: 'hello' });
        expect(wrapper.vm.fetchAssessments).toHaveBeenCalled();
      });
    });
  });

  describe('methods', () => {
    describe('addAssessment', () => {
      it('showAddPopup', async () => {
        await mountWrapper();
        expect(wrapper.vm.showAddPopup).toEqual(false);
        await wrapper.vm.addAssessment();
        expect(wrapper.vm.showAddPopup).toEqual(true);
      });
    });

    describe('fetchAssessments', () => {
      it('searches storage', async () => {
        await mountWrapper();
        await wrapper.vm.fetchAssessments();
        expect(storage.assessmentForm.actions.search).toHaveBeenCalledWith({
          filter: { 'Entity/Status': Status.Active, 'Entity/Id': { searchIn_az: wrapper.vm.items.map((i) => i.entity.assessmentFormId) } },
          top: 999,
          queryType: 'full',
          searchMode: 'all',
        }, null, true);
      });
    });

    describe('fetchData', () => {
      it('searches storage', async () => {
        await mountWrapper();
        await wrapper.vm.fetchData({});
        expect(storage.assessmentResponse.actions.search).toHaveBeenCalledWith({
          filter: {
            'Entity/Association/Id': 'cfId',
            'Entity/Association/Type': AssociationType.CaseFile,
          },
          top: 999,
          count: true,
          queryType: 'full',
          searchMode: 'all',
        }, null, true);
      });
    });
  });
});
