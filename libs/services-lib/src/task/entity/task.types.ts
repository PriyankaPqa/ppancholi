import { ActionStatus, IdParams, ITaskEntity, ITaskEntityData } from '@libs/entities-lib/task';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface ITaskService extends IDomainBaseService<ITaskEntity, IdParams> {
  createTask(task: ITaskEntity): Promise<ITaskEntity>;
  editTask(taskId: uuid, task: ITaskEntity): Promise<ITaskEntity>;
  setWorkingOn(id: uuid, caseFileId: uuid, userId: string): Promise<ITaskEntity>;
  completeTask(id: uuid, caseFileId: uuid, rationale: string): Promise<ITaskEntityData>;
  setTaskActionStatus(id: uuid, caseFileId: uuid, params: { rationale: string, actionStatus: ActionStatus, teamId: uuid }): Promise<ITaskEntityData>;
}

export interface ITaskServiceMock extends IDomainBaseServiceMock<ITaskEntity> {
  createTask: jest.Mock <ITaskEntityData>;
  editTask: jest.Mock <ITaskEntityData>;
  setWorkingOn: jest.Mock <ITaskEntityData>;
  completeTask: jest.Mock <ITaskEntityData>;
  setTaskActionStatus: jest.Mock <ITaskEntityData>;
}
