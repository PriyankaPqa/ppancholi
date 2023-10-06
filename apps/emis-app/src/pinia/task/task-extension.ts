import { BaseStoreComponents, filterAndSortActiveItems } from '@libs/stores-lib/base';
import { IdParams, ITaskEntity, ITaskEntityData } from '@libs/entities-lib/task';
import { TaskService } from '@libs/services-lib/task/entity/task';
import { ITaskServiceMock } from '@libs/services-lib/task/entity';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { IOptionItemsServiceMock, OptionItemsService } from '@libs/services-lib/optionItems';
import { EOptionLists, IOptionItem } from '@libs/entities-lib/optionItem';
import { Ref, ref } from 'vue';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<ITaskEntity, IdParams>,
  entityService: TaskService | ITaskServiceMock,
  optionService: OptionItemsService | IOptionItemsServiceMock,
) {
  const taskCategoriesFetched = ref(false);
  const taskCategories = ref([]) as Ref<IOptionItem[]>;

  function getTaskCategories(filterOutHidden = true, filterOutInactive = true, actualValue?: string[] | string) {
    const items = filterAndSortActiveItems(taskCategories.value, filterOutInactive, actualValue);
    return filterOutHidden ? items.filter((i) => !i.isHidden) : items;
  }

  async function fetchTaskCategories() {
    if (!taskCategoriesFetched.value) {
      const data = await optionService.getOptionList(EOptionLists.TaskCategories);
      taskCategories.value = data;
      taskCategoriesFetched.value = true;
    }

    return getTaskCategories();
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

  async function editTask(taskId: uuid, task: ITaskEntityData) {
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

  return {
    taskCategoriesFetched,
    taskCategories,
    createTask,
    editTask,
    fetchTaskCategories,
    getTaskCategories,
  };
}
