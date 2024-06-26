import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { Entity } from '@/pinia/task/task';
import { ActionTaken, IdParams, ITaskEntityData, mockPersonalTaskEntity, mockTaskEntities, mockTeamTaskEntity, TaskActionTaken, TaskStatus } from '@libs/entities-lib/task';
import { createTestingPinia } from '@pinia/testing';
import { defineStore, setActivePinia } from 'pinia';

import { mockTaskService } from '@libs/services-lib/task/entity';
import { getExtensionComponents } from '@/pinia/task/task-extension';
import { mockOptionItemsService } from '@libs/services-lib/optionItems';
import { EOptionLists, mockOptionItem, mockOptionItemData, OptionItem } from '@libs/entities-lib/optionItem';
import _sortBy from 'lodash/sortBy';

const entityService = mockTaskService();
const optionsService = mockOptionItemsService();
const baseComponents = getBaseStoreComponents<Entity, IdParams>(entityService);

const getPinia = () => {
  const pinia = createTestingPinia({
    initialState: {
      'test-team': {
        items: mockTaskEntities(),
      },
    },
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useTaskTestStore = (opts = {}) => {
  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService, optionsService);

  const useTaskStore = defineStore('test-task', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useTaskStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  const store = useTaskTestStore(bComponents);
  return store;
};

describe('Task Store', () => {
    describe('createTask', () => {
      it('should call the service createTask with right params', async () => {
        const bComponents = { ...baseComponents, addNewlyCreatedId: jest.fn(), set: jest.fn() };
        const store = createTestStore(bComponents);
        const payload = mockTeamTaskEntity({ id: '' });
        const res = mockTeamTaskEntity({ id: 'mock-id-1' });
        entityService.createTask = jest.fn(() => res);
        await store.createTask(payload);
        expect(entityService.createTask).toHaveBeenCalledWith(payload);
        expect(bComponents.addNewlyCreatedId).toBeCalledWith(res);
        expect(bComponents.set).toBeCalledWith(res);
      });
    });

    describe('editTask', () => {
      it('should call the service editTask with right params', async () => {
        const store = createTestStore();
        entityService.editTask = jest.fn();
        const taskId = '4321';
        const task = mockTeamTaskEntity();
        await store.editTask(taskId, task);
        expect(entityService.editTask).toHaveBeenCalledWith(taskId, task);
      });
    });

    describe('fetchTaskCategories', () => {
      it('should call optionItemService getOptionList and commit the result', async () => {
        const store = createTestStore();
        const res = mockOptionItemData();
        optionsService.getOptionList = jest.fn(() => res);
        await store.fetchTaskCategories();

        expect(optionsService.getOptionList).toBeCalledWith(EOptionLists.TaskCategories);
        expect(store.taskCategories).toEqual(res);
        expect(store.taskCategoriesFetched).toEqual(true);
      });
    });

    describe('getTaskName', () => {
      it('returns the sorted types, filter out hidden', () => {
        const store = createTestStore();
        store.taskCategories = [mockOptionItem({ id: '111', isHidden: true }), mockOptionItem({ id: '222', isHidden: false })];
        const res = store.getTaskCategory(true, false);
        expect(res).toEqual(
          _sortBy(
            [mockOptionItem({ id: '222', isHidden: false })].map((e) => new OptionItem(e)),
            'orderRank',
          ),
        );
      });

      it('returns the sorted types, with hidden', () => {
        const store = createTestStore();
        store.taskCategories = [mockOptionItem({ id: '111', isHidden: true }), mockOptionItem({ id: '222', isHidden: false })];
        const res = store.getTaskCategory(false, false);
        expect(res).toEqual(
          _sortBy(
            [mockOptionItem({ id: '111', isHidden: true }), mockOptionItem({ id: '222', isHidden: false })].map((e) => new OptionItem(e)),
            'orderRank',
          ),
        );
      });
    });

    describe('taskAction', () => {
      it('should call service completeTask when actionType is TaskCompleted', () => {
        const store = createTestStore();
        entityService.completeTask = jest.fn();
        store.taskAction('mock-task-id-1', 'mock-case-file-id-1', { actionType: TaskActionTaken.TaskCompleted, rationale: 'mock-rationale' });
        expect(entityService.completeTask).toHaveBeenCalledWith('mock-task-id-1', 'mock-case-file-id-1', 'mock-rationale');
      });

      it('should call service setTaskActionTaken when actionType is Assign', () => {
        const store = createTestStore();
        entityService.setTaskActionTaken = jest.fn();
        store.taskAction('mock-task-id-1', 'mock-case-file-id-1', { actionType: TaskActionTaken.Assign, rationale: 'mock-rationale', teamId: 'mock-team-id-1' });
        expect(entityService.setTaskActionTaken).toHaveBeenCalledWith(
          'mock-task-id-1',
          'mock-case-file-id-1',
          { actionTaken: ActionTaken.Assign, rationale: 'mock-rationale', teamId: 'mock-team-id-1' },
        );
      });

      it('should call service setTaskActionTaken when actionType is ActionCompleted', () => {
        const store = createTestStore();
        entityService.setTaskActionTaken = jest.fn();
        store.taskAction('mock-task-id-1', 'mock-case-file-id-1', { actionType: TaskActionTaken.ActionCompleted, rationale: 'mock-rationale', teamId: 'mock-team-id-1' });
        expect(entityService.setTaskActionTaken).toHaveBeenCalledWith(
          'mock-task-id-1',
          'mock-case-file-id-1',
          { actionTaken: ActionTaken.Completed, rationale: 'mock-rationale', teamId: 'mock-team-id-1' },
        );
      });

      it('should call service setTaskActionTaken when actionType is Reopen', () => {
        const store = createTestStore();
        entityService.setTaskActionTaken = jest.fn();
        store.taskAction('mock-task-id-1', 'mock-case-file-id-1', { actionType: TaskActionTaken.Reopen, rationale: 'mock-rationale', teamId: 'mock-team-id-1' });
        expect(entityService.setTaskActionTaken).toHaveBeenCalledWith(
          'mock-task-id-1',
          'mock-case-file-id-1',
          { actionTaken: ActionTaken.Reopen, rationale: 'mock-rationale', teamId: 'mock-team-id-1' },
        );
      });
    });

    describe('getNotificationHelperView', () => {
      const today = new Date();
      const yesterday = new Date(new Date().setDate(today.getDate() - 1));
      const tomorrow = new Date(new Date().setDate(today.getDate() + 1));
      const taskMap = new Map<string, ITaskEntityData>();
      taskMap.set('yesterday', mockPersonalTaskEntity({ id: 'yesterday', dueDate: yesterday, isUrgent: true }));
      taskMap.set('completedYesterday', mockPersonalTaskEntity({ id: 'completedYesterday', dueDate: yesterday, taskStatus: TaskStatus.Completed }));
      taskMap.set('today', mockPersonalTaskEntity({ id: 'today', dueDate: today, isUrgent: false }));
      taskMap.set('completedToday', mockPersonalTaskEntity({ id: 'completedToday', dueDate: today, taskStatus: TaskStatus.Completed }));
      taskMap.set('tomorrow', mockPersonalTaskEntity({ id: 'tomorrow', dueDate: tomorrow }));
      taskMap.set('team', mockTeamTaskEntity());
      const bComponents = {
        ...baseComponents,
        getById: jest.fn((id) => taskMap.get(id)),
      };
      const store = createTestStore(bComponents);
      describe('isUrgent', () => {
        it('is true when task is urgent', () => {
          expect(store.getNotificationHelperView('yesterday').isUrgent).toBeTruthy();
        });
        it('is false when task is not urgent', () => {
          expect(store.getNotificationHelperView('today').isUrgent).toBeFalsy();
        });
      });
      describe('isDueToday', () => {
        it('is true when task due date is today', () => {
          expect(store.getNotificationHelperView('today').isDueToday).toBeTruthy();
        });
        it('is false when task due date is yesterday', () => {
          expect(store.getNotificationHelperView('yesterday').isDueToday).toBeFalsy();
        });
        it('is false when task due date is tomorrow', () => {
          expect(store.getNotificationHelperView('tomorrow').isDueToday).toBeFalsy();
        });
        it('is false when task due date is today for a completed item', () => {
          expect(store.getNotificationHelperView('completedToday').isDueToday).toBeFalsy();
        });
      });
      describe('isOverdue', () => {
        it('is true when task due date is yesterday', () => {
          expect(store.getNotificationHelperView('yesterday').isOverdue).toBeTruthy();
        });
        it('is false when task due date is today', () => {
          expect(store.getNotificationHelperView('today').isOverdue).toBeFalsy();
        });
        it('is false when task due date is tomorrow', () => {
          expect(store.getNotificationHelperView('tomorrow').isOverdue).toBeFalsy();
        });
        it('is false when task due date is yesterday for a completed item', () => {
          expect(store.getNotificationHelperView('completedYesterday').isOverdue).toBeFalsy();
        });
      });
      describe('icon', () => {
        it('is set for personal tasks', () => {
          expect(store.getNotificationHelperView('today').icon).toBeTruthy();
        });
        it('is not set for team tasks', () => {
          expect(store.getNotificationHelperView('team').icon).toBeFalsy();
        });
      });
      describe('targetLink', () => {
        it('has parameters set correctly', () => {
          const link = store.getNotificationHelperView('today').targetLink as any;
          expect(link.name).toBeTruthy();
          expect(link.params.id).toEqual(taskMap.get('today').caseFileId);
          expect(link.params.taskId).toEqual(taskMap.get('today').id);
        });
      });
    });
});
