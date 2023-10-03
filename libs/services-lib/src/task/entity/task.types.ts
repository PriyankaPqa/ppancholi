import { IdParams, ITaskEntity, ITaskEntityData } from '@libs/entities-lib/task';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface ITaskService extends IDomainBaseService<ITaskEntity, IdParams> {
  createTask(task: ITaskEntity): Promise<ITaskEntity>;
  editTask(taskId: uuid, task: ITaskEntity): Promise<ITaskEntity>;
}

export interface ITaskServiceMock extends IDomainBaseServiceMock<ITaskEntity> {
  createTask: jest.Mock <ITaskEntityData>;
  editTask: jest.Mock <ITaskEntityData>;
}
