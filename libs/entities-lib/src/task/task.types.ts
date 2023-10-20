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
  Assign = 0,
  ActionCompleted = 1,
  TaskCompleted = 2,
  Reopen = 3,
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
  userWorkingOn: string;
}

export interface ITaskEntity extends ITaskEntityData {
}

export interface ITaskMetadata extends IEntity {
  caseFileId: uuid;
  caseFileNumber: string;
  name: IMultilingual;
  taskCategoryName: IMultilingual;
  nameId: uuid;
  taskStatusName: IMultilingual;
  eventId: uuid;
}

export type ITaskCombined = IEntityCombined<ITaskEntity, ITaskMetadata>;

export type IdParams = { id: uuid, caseFileId: uuid };
