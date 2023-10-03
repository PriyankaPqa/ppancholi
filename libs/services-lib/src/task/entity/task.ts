import { ITaskEntity, ITaskEntityData, IdParams } from '@libs/entities-lib/task';
import { ITaskService } from './task.types';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';

const API_URL_SUFFIX = 'case-file/case-files/{caseFileId}';
const CONTROLLER = 'tasks';

export class TaskService extends DomainBaseService<ITaskEntity, IdParams> implements ITaskService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async createTask(task: ITaskEntityData): Promise<ITaskEntityData> {
    const parseTask = this.parseTaskPayload(task);
    return this.http.post(this.getItemUrl(`${this.baseUrl}`, task), parseTask, { globalHandler: false });
  }

  async editTask(taskId: uuid, task: ITaskEntityData): Promise<ITaskEntityData> {
    return this.http.post(`/case-file/tasks/${taskId}/edit`, task, { globalHandler: false });
  }

  /** Private methods * */

  parseTaskPayload(task: ITaskEntityData): ITaskEntityData {
    if (!task?.category?.optionItemId) {
      task.category = null;
    }
    return { ...task };
  }
}
