import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { Entity } from '@/pinia/task/task';
import { ActionStatus, IdParams, mockTaskEntities, mockTeamTaskEntity, TaskActionTaken } from '@libs/entities-lib/task';
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

    describe('getTaskCategories', () => {
      it('returns the sorted types, filter out hidden', () => {
        const store = createTestStore();
        store.taskCategories = [mockOptionItem({ id: '111', isHidden: true }), mockOptionItem({ id: '222', isHidden: false })];
        const res = store.getTaskCategories(true, false);
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
        const res = store.getTaskCategories(false, false);
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

      it('should call service setTaskActionStatus when actionType is Assign', () => {
        const store = createTestStore();
        entityService.setTaskActionStatus = jest.fn();
        store.taskAction('mock-task-id-1', 'mock-case-file-id-1', { actionType: TaskActionTaken.Assign, rationale: 'mock-rationale', teamId: 'mock-team-id-1' });
        expect(entityService.setTaskActionStatus).toHaveBeenCalledWith(
          'mock-task-id-1',
          'mock-case-file-id-1',
          { actionStatus: ActionStatus.Assign, rationale: 'mock-rationale', teamId: 'mock-team-id-1' },
        );
      });

      it('should call service setTaskActionStatus when actionType is ActionCompleted', () => {
        const store = createTestStore();
        entityService.setTaskActionStatus = jest.fn();
        store.taskAction('mock-task-id-1', 'mock-case-file-id-1', { actionType: TaskActionTaken.ActionCompleted, rationale: 'mock-rationale', teamId: 'mock-team-id-1' });
        expect(entityService.setTaskActionStatus).toHaveBeenCalledWith(
          'mock-task-id-1',
          'mock-case-file-id-1',
          { actionStatus: ActionStatus.Completed, rationale: 'mock-rationale', teamId: 'mock-team-id-1' },
        );
      });

      it('should call service setTaskActionStatus when actionType is Reopen', () => {
        const store = createTestStore();
        entityService.setTaskActionStatus = jest.fn();
        store.taskAction('mock-task-id-1', 'mock-case-file-id-1', { actionType: TaskActionTaken.Reopen, rationale: 'mock-rationale', teamId: 'mock-team-id-1' });
        expect(entityService.setTaskActionStatus).toHaveBeenCalledWith(
          'mock-task-id-1',
          'mock-case-file-id-1',
          { actionStatus: ActionStatus.Reopen, rationale: 'mock-rationale', teamId: 'mock-team-id-1' },
        );
      });
    });
});
