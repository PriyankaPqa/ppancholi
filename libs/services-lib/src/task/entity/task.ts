import { ITaskEntity, ITaskEntityData, IdParams, ITaskMetadata, ActionTaken } from '@libs/entities-lib/task';
import { ICombinedSearchResult, ISearchParams } from '@libs/shared-lib/types';
import { ITaskService } from './task.types';
import { GlobalHandler, IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';

const API_URL_SUFFIX = 'case-file/case-files/{caseFileId}';
const CONTROLLER = 'tasks';

export class TaskService extends DomainBaseService<ITaskEntity, IdParams> implements ITaskService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async createTask(task: ITaskEntityData): Promise<ITaskEntityData> {
    const parseTask = this.parseTaskPayload(task);
    return this.http.post(this.getItemUrl(`${this.baseUrl}`, task), parseTask, { globalHandler: GlobalHandler.Partial });
  }

  async editTask(taskId: uuid, task: ITaskEntityData): Promise<ITaskEntityData> {
    const parseTask = this.parseTaskPayload(task);
    return this.http.patch(this.getItemUrl(`${this.baseUrl}/${taskId}`, task), parseTask, { globalHandler: GlobalHandler.Partial });
  }

  async setWorkingOn(id: uuid, caseFileId: uuid, userId: string): Promise<ITaskEntityData> {
    return this.http.patch(this.getItemUrl(`${this.baseUrl}/{id}/set-working-on`, { id, caseFileId }), { userWorkingOn: userId });
  }

  async completeTask(id: uuid, caseFileId: uuid, rationale: string): Promise<ITaskEntityData> {
    return this.http.patch(this.getItemUrl(`${this.baseUrl}/{id}/complete`, { id, caseFileId }), { rationale });
  }

  async cancelTask(id: uuid, caseFileId: uuid, rationale: string): Promise<ITaskEntityData> {
    return this.http.patch(this.getItemUrl(`${this.baseUrl}/{id}/cancel`, { id, caseFileId }), { rationale });
  }

  async setTaskActionTaken(id: uuid, caseFileId: uuid, params: { actionTaken: ActionTaken, rationale: string, teamId: uuid }): Promise<ITaskEntityData> {
    return this.http.patch(this.getItemUrl(`${this.baseUrl}/{id}/set-action-taken`, { id, caseFileId }), params);
  }

  async search(params: ISearchParams):
    Promise<ICombinedSearchResult<ITaskEntityData, ITaskMetadata>> {
    return this.http.get('case-file/search/tasksV2', { params, isOData: true });
  }

  async getByIds(ids: uuid[]): Promise<ITaskEntity[]> {
    return this.http.get('case-file/tasks', {
      params: {
        ids,
      },
      paramsSerializer: {
        indexes: null,
      },
    });
  }

  /** Private methods * */

  parseTaskPayload(task: ITaskEntityData): ITaskEntityData {
    if (!task?.subCategory?.optionItemId) {
      task.subCategory = null;
    }
    task.dueDate = task.dueDate ? new Date(task.dueDate).toISOString() : null;
    return { ...task };
  }
}
