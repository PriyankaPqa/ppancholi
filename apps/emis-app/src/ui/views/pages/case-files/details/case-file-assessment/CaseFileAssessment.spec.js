import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import { EEventStatus, mockEventEntity } from '@libs/entities-lib/event';
import {
  AssociationType, AssessmentFrequencyType, CompletionStatus, PublishStatus,
} from '@libs/entities-lib/assessment-template';
import { Status } from '@libs/entities-lib/base';
import routes from '@/constants/routes';
import Component from './CaseFileAssessment.vue';

const localVue = createLocalVue();
let storage = mockStorage();
const mockEvent = mockEventEntity();
mockEvent.schedule.status = EEventStatus.Open;

const mockMappedAssessments = [
  {
    id: 'resp-1',
    formId: 'form-1',
    name: 'Name completed',
    nameLowerCase: 'name completed',
    dateAssigned: new Date(2020, 1, 1),
    dateAssignedFormatted: 'Sep 9, 2020',
    dateModified: new Date(2021, 9, 9),
    dateModifiedFormatted: 'Sep 9, 2021',
    dateCompleted: new Date(2021, 1, 1),
    dateCompletedFormatted: 'Sep 9, 2022',
    completionStatus: CompletionStatus.Completed,
    formFrequency: AssessmentFrequencyType.OneTime,
    pinned: false,
    canEdit: false,
    canCopy: false,
    canLaunch: false,
  },
  {
    id: 'resp-2',
    formId: 'form-2',
    name: 'Name partial',
    nameLowerCase: 'name partial',
    dateAssigned: new Date(2020, 1, 1),
    dateAssignedFormatted: 'Sep 9, 2020',
    dateModified: new Date(2021, 9, 9),
    dateModifiedFormatted: 'Sep 9, 2021',
    dateCompleted: new Date(2021, 1, 1),
    dateCompletedFormatted: 'Sep 9, 2022',
    completionStatus: CompletionStatus.Partial,
    formFrequency: AssessmentFrequencyType.OneTime,
    pinned: false,
    canEdit: false,
    canCopy: false,
    canLaunch: false,
  },
  {
    id: 'resp-3',
    formId: 'form-3',
    name: 'Name Pending',
    nameLowerCase: 'Name Pending',
    dateAssigned: new Date(2020, 1, 1),
    dateAssignedFormatted: 'Sep 9, 2020',
    dateModified: new Date(2021, 9, 9),
    dateModifiedFormatted: 'Sep 9, 2021',
    dateCompleted: new Date(2021, 1, 1),
    dateCompletedFormatted: 'Sep 9, 2022',
    completionStatus: CompletionStatus.Pending,
    formFrequency: AssessmentFrequencyType.Multiple,
    pinned: false,
    canEdit: false,
    canCopy: false,
    canLaunch: false,
  },
  {
    id: 'resp-4',
    formId: 'form-4',
    name: 'AAa name Pending',
    nameLowerCase: 'aaa name Pending',
    dateAssigned: new Date(2020, 1, 1),
    dateAssignedFormatted: 'Sep 9, 2020',
    dateModified: new Date(2021, 9, 9),
    dateModifiedFormatted: 'Sep 9, 2021',
    dateCompleted: new Date(2021, 1, 1),
    dateCompletedFormatted: 'Sep 9, 2022',
    completionStatus: CompletionStatus.Pending,
    formFrequency: AssessmentFrequencyType.Multiple,
    pinned: false,
    canEdit: false,
    canCopy: false,
    canLaunch: false,
  },
];

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
        await mountWrapper(
          false,
          1,
          null,
          {
            computed: {
              readonly() {
                return true;
              },
            },
          },
        );
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

    describe('canDelete', () => {
      it('returns true for level1+ when not readonly', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canDelete).toBeTruthy();
        await mountWrapper(
          false,
          1,
          null,
          {
            computed: {
              readonly() {
                return true;
              },
            },
          },
        );
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null);
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null, 'readonly');
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null, 'contributor3');
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null, 'contributorFinance');
        expect(wrapper.vm.canDelete).toBeFalsy();
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
        expect(params[1].onlyActive).toBeFalsy();
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

        await mountWrapper(false, 1, null, {
          computed: {
            assessments() {
              return mockMappedAssessments;
            },
          },
        });
        expect(wrapper.vm.oneTimeAssessmentsIds).toEqual(['form-1', 'form-2']);
      });
    });

    describe('pendingAssessments', () => {
      it('should filter by name and order', async () => {
        await mountWrapper(false, 1, null, {
          computed: {
            assessments() {
              return mockMappedAssessments;
            },
          },
        });
        expect(wrapper.vm.pendingAssessments).toEqual([mockMappedAssessments[3], mockMappedAssessments[2]]);

        await wrapper.setData({
          pendingOptions: {
            search: 'aaa',
            sortBy: ['name'],
            sortDesc: [false],
          },
        });
        expect(wrapper.vm.pendingAssessments).toEqual([mockMappedAssessments[3]]);

        await wrapper.setData({
          pendingOptions: {
            search: '',
            sortBy: ['name'],
            sortDesc: [true],
          },
        });
        expect(wrapper.vm.pendingAssessments).toEqual([mockMappedAssessments[2], mockMappedAssessments[3]]);
      });
    });

    describe('completedAssessments', () => {
      it('should filter by name and order', async () => {
        await mountWrapper(false, 1, null, {
          computed: {
            assessments() {
              return mockMappedAssessments;
            },
          },
        });
        expect(wrapper.vm.completedAssessments).toEqual([mockMappedAssessments[0], mockMappedAssessments[1]]);

        await wrapper.setData({
          completedOptions: {
            search: 'parti',
            sortBy: ['name'],
            sortDesc: [false],
          },
        });
        expect(wrapper.vm.completedAssessments).toEqual([mockMappedAssessments[1]]);

        await wrapper.setData({
          completedOptions: {
            search: '',
            sortBy: ['name'],
            sortDesc: [true],
          },
        });
        expect(wrapper.vm.completedAssessments).toEqual([mockMappedAssessments[1], mockMappedAssessments[0]]);
      });
    });

    describe('pendingAssessmentsHeaders', () => {
      it('contains the right items', async () => {
        await mountWrapper();
        expect(wrapper.vm.pendingAssessmentsHeaders.map((h) => h.text))
          .toEqual(['common.name', 'assessmentResponse.dateAssigned', 'common.status', '', '']);
        expect(wrapper.vm.pendingAssessmentsHeaders.filter((h) => h.sortable !== false).map((h) => h.text))
          .toEqual(['common.name', 'assessmentResponse.dateAssigned']);
      });
    });

    describe('completedAssessmentsHeaders', () => {
      it('contains the right items', async () => {
        await mountWrapper();
        expect(wrapper.vm.completedAssessmentsHeaders.map((h) => h.text))
          .toEqual(['common.name', 'assessmentResponse.dateAssigned', 'assessmentResponse.dateModified', 'assessmentResponse.dateCompleted', 'common.status', '', '']);
        expect(wrapper.vm.completedAssessmentsHeaders.filter((h) => h.sortable !== false).map((h) => h.text))
          .toEqual(['common.name', 'assessmentResponse.dateAssigned', 'assessmentResponse.dateModified', 'assessmentResponse.dateCompleted']);
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
    describe('mapAssessments', () => {
      it('returns mapped data', async () => {
        await mountWrapper();
        const form = storage.assessmentForm.getters.getByIds()[0].entity;
        const response = storage.assessmentResponse.getters.getByIds()[0];
        response.entity.timestamp = new Date('2022-09-09T16:33:11.700Z');

        expect(wrapper.vm.mapAssessments([{ form, response }])).toEqual([{
          canEdit: false,
          canLaunch: true,
          canCopy: true,
          completionStatus: 2,
          dateAssigned: new Date('2022-09-09T16:33:11.700Z'),
          dateAssignedFormatted: 'Sep 9, 2022',
          dateModified: new Date('2022-09-09T16:33:11.700Z'),
          dateModifiedFormatted: 'Sep 9, 2022',
          formFrequency: 2,
          formId: '1',
          id: '1',
          name: 'Assessment Floods 2021',
          nameLowerCase: 'assessment floods 2021',
          pinned: undefined,
          dateCompleted: new Date(1950, 0, 1),
          dateCompletedFormatted: '',
        }]);

        form.status = Status.Inactive;
        expect(wrapper.vm.mapAssessments([{ form, response }])).toEqual([{
          canEdit: false,
          canLaunch: true,
          canCopy: false,
          completionStatus: 2,
          dateAssigned: new Date('2022-09-09T16:33:11.700Z'),
          dateAssignedFormatted: 'Sep 9, 2022',
          dateModified: new Date('2022-09-09T16:33:11.700Z'),
          dateModifiedFormatted: 'Sep 9, 2022',
          formFrequency: 2,
          formId: '1',
          id: '1',
          name: 'Assessment Floods 2021',
          nameLowerCase: 'assessment floods 2021',
          pinned: undefined,
          dateCompleted: new Date(1950, 0, 1),
          dateCompletedFormatted: '',
        }]);

        form.status = Status.Active;
        response.entity.dateCompleted = new Date('2022-09-09T16:33:11.700Z');
        response.pinned = true;
        response.entity.id = '2';
        response.entity.completionStatus = CompletionStatus.Completed;
        form.publishStatus = PublishStatus.Unpublished;

        expect(wrapper.vm.mapAssessments([{ form, response }])).toEqual([{
          canEdit: true,
          canLaunch: false,
          canCopy: false,
          completionStatus: 3,
          dateAssigned: new Date('2022-09-09T16:33:11.700Z'),
          dateAssignedFormatted: 'Sep 9, 2022',
          dateModified: new Date('2022-09-09T16:33:11.700Z'),
          dateModifiedFormatted: 'Sep 9, 2022',
          formFrequency: 2,
          formId: '1',
          id: '2',
          name: 'Assessment Floods 2021',
          nameLowerCase: 'assessment floods 2021',
          pinned: true,
          dateCompleted: new Date('2022-09-09T16:33:11.700Z'),
          dateCompletedFormatted: 'Sep 9, 2022',
        }]);

        await mountWrapper(false, null, 'readonly');
        expect(wrapper.vm.mapAssessments([{ form, response }])).toEqual([{
          canEdit: false,
          canCopy: false,
          canLaunch: false,
          completionStatus: 3,
          dateAssigned: new Date('2022-09-09T16:33:11.700Z'),
          dateAssignedFormatted: 'Sep 9, 2022',
          dateModified: new Date('2022-09-09T16:33:11.700Z'),
          dateModifiedFormatted: 'Sep 9, 2022',
          formFrequency: 2,
          formId: '1',
          id: '2',
          name: 'Assessment Floods 2021',
          nameLowerCase: 'assessment floods 2021',
          pinned: true,
          dateCompleted: new Date('2022-09-09T16:33:11.700Z'),
          dateCompletedFormatted: 'Sep 9, 2022',
        }]);
      });
    });

    describe('addAssessment', () => {
      it('showAddPopup', async () => {
        await mountWrapper();
        expect(wrapper.vm.showAddPopup).toEqual(false);
        await wrapper.vm.addAssessment();
        expect(wrapper.vm.showAddPopup).toEqual(true);
      });
    });

    describe('updateSearch', () => {
      it('sets quicksearch', async () => {
        await mountWrapper();
        wrapper.vm.updateSearch('newSearch');
        expect(wrapper.vm.pendingOptions.search).toEqual('newSearch');
        expect(wrapper.vm.completedOptions.search).toEqual('newSearch');
      });
    });

    describe('launchAssessment', () => {
      it('should open new tab to editor page', async () => {
        await mountWrapper();
        window.open = jest.fn();
        wrapper.vm.launchAssessment(mockMappedAssessments[0]);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.resolve).toHaveBeenCalledWith({
          name: routes.events.assessments.complete.name,
          params: {
            assessmentTemplateId: mockMappedAssessments[0].formId,
            id: wrapper.vm.event.id,
            assessmentResponseId: mockMappedAssessments[0].id,
          },
        });
        expect(window.open).toHaveBeenCalledWith(wrapper.vm.$router.resolve().href, '_blank');
      });
    });

    describe('editAssessment', () => {
      it('should redirect to the edit page', async () => {
        mountWrapper();
        wrapper.vm.editAssessment({ id: 'myid' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.caseFile.assessments.edit.name,
          params: { assessmentResponseId: 'myid' },
        });
      });
    });

    describe('copyLink', () => {
      it('should copy the url by fetching all the right parameters', async () => {
        navigator.clipboard = { writeText: jest.fn() };
        const item = storage.assessmentResponse.getters.getByIds()[0];
        await mountWrapper();
        wrapper.vm.$storage.tenantSettings.getters.currentTenantSettings = jest.fn(() => ({ registrationDomain: { translation: { fr: 'test.com' } } }));
        wrapper.vm.$storage.household.getters.get = jest.fn(() => ({ entity: { primaryBeneficiary: 'benefId' } }));
        wrapper.vm.$services.households.getPerson = jest.fn(() => ({ contactInformation: { preferredLanguage: { optionItemId: 'frId' } } }));
        wrapper.vm.$storage.registration.actions.fetchPreferredLanguages = jest.fn(() => ([{ id: 'frId', languageCode: 'fr' }]));
        wrapper.vm.copyLink({ id: item.entity.id });
        await wrapper.vm.$nextTick();
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://test.com/fr/assessment/1dea3c36-d6a5-4e6c-ac36-078677b7da5f0/044fcd68-3d70-4a3a-b5c8-22da9e01730f/1');
        expect(wrapper.vm.$storage.tenantSettings.getters.currentTenantSettings).toHaveBeenCalled();
        expect(wrapper.vm.$storage.household.getters.get).toHaveBeenCalledWith(wrapper.vm.caseFile.entity.householdId);
        expect(wrapper.vm.$services.households.getPerson).toHaveBeenCalledWith('benefId');
        expect(wrapper.vm.$storage.registration.actions.fetchPreferredLanguages).toHaveBeenCalled();
      });
    });

    describe('fetchAssessments', () => {
      it('searches storage', async () => {
        await mountWrapper();
        await wrapper.vm.fetchAssessments();
        expect(storage.assessmentForm.actions.search).toHaveBeenCalledWith({
          filter: { 'Entity/Id': { searchIn_az: wrapper.vm.items.map((i) => i.entity.assessmentFormId) } },
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

    describe('deleteAssessment', () => {
      it('calls deactivate after confirmation', async () => {
        mountWrapper();
        wrapper.vm.$toasted.global.success = jest.fn();
        const response = {};
        await wrapper.vm.deleteAssessment(response);
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'assessmentResponse.confirm.delete.title',
          messages: 'assessmentResponse.confirm.delete.message',
        });
        expect(storage.assessmentResponse.actions.deactivate).toHaveBeenCalledWith(response);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalled();
      });
      it('doesnt call deactivate if no confirmation', async () => {
        mountWrapper();
        wrapper.vm.$confirm = jest.fn(() => false);
        wrapper.vm.$toasted.global.success = jest.fn();
        const response = {};
        await wrapper.vm.deleteAssessment(response);
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'assessmentResponse.confirm.delete.title',
          messages: 'assessmentResponse.confirm.delete.message',
        });
        expect(storage.assessmentResponse.actions.deactivate).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$toasted.global.success).not.toHaveBeenCalled();
      });
    });
  });
});
