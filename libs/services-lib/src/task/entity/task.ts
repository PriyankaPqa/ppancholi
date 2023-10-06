import { ITaskEntity, ITaskEntityData, IdParams, ITaskMetadata } from '@libs/entities-lib/task';
import { IAzureCombinedSearchResult, IAzureSearchParams } from '@libs/shared-lib/types';
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
    const parseTask = this.parseTaskPayload(task);
    return this.http.patch(this.getItemUrl(`${this.baseUrl}/${taskId}`, task), parseTask, { globalHandler: false });
  }

  async search(params: IAzureSearchParams, searchEndpoint: string = null):
    Promise<IAzureCombinedSearchResult<ITaskEntityData, ITaskMetadata>> {
    return this.http.get(`case-file/search/${searchEndpoint ?? 'tasks'}`, { params, isOData: true });
  }

  /** Private methods * */

  parseTaskPayload(task: ITaskEntityData): ITaskEntityData {
    if (!task?.category?.optionItemId) {
      task.category = null;
    }
    return { ...task };
  }
}
