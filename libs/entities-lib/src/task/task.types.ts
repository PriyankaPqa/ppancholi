import { IListOption, IMultilingual } from '@libs/shared-lib/types';
import { IEntity, IEntityCombined } from '../base';

export enum TaskType {
  Team = 1,
  Personal = 2,
}

export enum TaskStatus {
  InProgress = 1,
  Completed = 2,
}

export enum TaskActionTaken {
  Assign = 1,
  ActionCompleted = 2,
  TaskCompleted = 3,
  Reopen = 4,
}

export interface ITaskEntityData extends IEntity {
  name: IListOption;
  caseFileId: string;
  isUrgent: boolean;
  category: IListOption;
  description: string;
  assignedTeamId: string;
  taskStatus: TaskStatus;
  taskType: TaskType;
  dateAdded: Date | string;
  dueDate: Date | string;
}

export interface ITaskEntity extends ITaskEntityData {
}

export interface ITaskMetadata extends IEntity {
  caseFileId: uuid;
  caseFileNumber: string;
  name: IMultilingual;
  nameId: uuid;
  taskStatusName: IMultilingual;
}

export type ITaskCombined = IEntityCombined<ITaskEntity, ITaskMetadata>;

export type IdParams = { id: uuid, caseFileId: uuid };
