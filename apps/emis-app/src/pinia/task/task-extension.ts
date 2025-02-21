import { BaseStoreComponents, filterAndSortActiveItems, filterAndSortActiveSubItems } from '@libs/stores-lib/base';
import { ActionTaken, IdParams, ITaskEntity, ITaskEntityData, IUpdateTaskRequest, TaskActionTaken, TaskStatus, TaskType } from '@libs/entities-lib/task';
import { TaskService } from '@libs/services-lib/task/entity/task';
import { ITaskServiceMock } from '@libs/services-lib/task/entity';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { IOptionItemsServiceMock, OptionItemsService } from '@libs/services-lib/optionItems';
import { EOptionLists, IOptionItem } from '@libs/entities-lib/optionItem';
import { Ref, ref } from 'vue';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers/helpers';

import { INotificationHelperView } from '@libs/entities-lib/notification';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<ITaskEntity, IdParams>,
  entityService: TaskService | ITaskServiceMock,
  optionService: OptionItemsService | IOptionItemsServiceMock,
) {
  const taskCategoriesFetched = ref(false);
  const taskCategories = ref([]) as Ref<IOptionItem[]>;

  function getTaskCategory(filterOutHidden = true, filterOutInactive = true, actualValue?: string[] | string) {
    const items = filterAndSortActiveItems(taskCategories.value, filterOutInactive, actualValue);
    return filterOutHidden ? items.filter((i) => !i.isHidden) : items;
  }

  async function fetchTaskCategories() {
    if (!taskCategoriesFetched.value) {
      const data = await optionService.getOptionList(EOptionLists.TaskCategories);
      taskCategories.value = data;
      taskCategoriesFetched.value = true;
    }

    return getTaskCategory();
  }

  async function createTask(task: ITaskEntityData) {
    try {
      const res = await entityService.createTask(task);
      if (res) {
        baseComponents.addNewlyCreatedId(res);
        baseComponents.set(res);
      }
      return res;
    } catch (e) {
      applicationInsights.trackException(e, {}, 'module.taskEntity', 'createTask');
      return null;
    }
  }

  async function editTask(taskId: uuid, task: IUpdateTaskRequest) {
    try {
      const res = await entityService.editTask(taskId, task);
      if (res) {
        baseComponents.set(res);
      }
      return res;
    } catch (e) {
      applicationInsights.trackException(e, {}, 'module.taskEntity', 'editTask');
      return null;
    }
  }

  async function setWorkingOn(id: uuid, caseFileId: uuid, userId: string) {
    try {
      const res = await entityService.setWorkingOn(id, caseFileId, userId);
      if (res) {
        baseComponents.set(res);
      }
      return res;
    } catch (e) {
      applicationInsights.trackException(e, {}, 'module.taskEntity', 'setWorkingOn');
      return null;
    }
  }

  async function taskAction(id: uuid, caseFileId: uuid, params: { actionType: TaskActionTaken, rationale: string, teamId?: uuid, taskStatus: TaskStatus }) {
    const { actionType, rationale, teamId, taskStatus } = params;
    const actionServices : { [index: number ]: () => ITaskEntityData | Promise<ITaskEntityData> } = {
      [TaskActionTaken.Assign]: () => entityService.setTaskActionTaken(id, caseFileId, { rationale, actionTaken: ActionTaken.Assign, teamId }),
      [TaskActionTaken.ActionCompleted]: () => entityService.setTaskActionTaken(id, caseFileId, { rationale, actionTaken: ActionTaken.Completed, teamId }),
      [TaskActionTaken.TaskCompleted]: () => entityService.completeTask(id, caseFileId, rationale),
      [TaskActionTaken.Reopen]: taskStatus === TaskStatus.Completed
        ? () => entityService.setTaskActionTaken(id, caseFileId, { rationale, actionTaken: ActionTaken.Reopen, teamId })
        : () => entityService.reopenCanceledTask(id, caseFileId, { rationale, teamId }),
      [TaskActionTaken.Cancelled]: () => entityService.cancelTask(id, caseFileId, rationale),
    };

    try {
      const res = await actionServices[actionType]();
      if (res) {
        baseComponents.set(res);
      }
      return res;
    } catch (e) {
      applicationInsights.trackException(e, {}, 'module.taskEntity', 'taskAction');
      return null;
    }
  }

  function getNotificationHelperView(id: uuid) : INotificationHelperView {
    const task = baseComponents.getById(id);
    if (JSON.stringify(task) === '{}') {
      return null;
    }

    const dueDateLocal = task.dueDate ? helpers.getLocalStringDate(task.dueDate, 'Task.dueDate') : null;
    const today = helpers.getLocalStringDate(new Date(), 'local');

    return {
      isUrgent: task.isUrgent,
      isDueToday: task.taskStatus === TaskStatus.InProgress && dueDateLocal && dueDateLocal === today,
      isOverdue: task.taskStatus === TaskStatus.InProgress && dueDateLocal && dueDateLocal < today,
      icon: task.taskType === TaskType.Personal ? 'mdi-account-check' : '',
      targetLink: {
        name: routes.caseFile.task.details.name,
        params: {
          id: task.caseFileId,
          taskId: task.id,
        },
      },
    };
  }

  return {
    taskCategoriesFetched,
    taskCategories,
    createTask,
    editTask,
    fetchTaskCategories,
    getTaskCategory,
    setWorkingOn,
    taskAction,
    getNotificationHelperView,
    filterAndSortActiveSubItems,
  };
}
