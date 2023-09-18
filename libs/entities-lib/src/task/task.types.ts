import { IListOption } from '@libs/shared-lib/types';
import { IUser } from '../user';
import { ITeamEntity } from '../team';
import { IEntity } from '../base';

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
}

export interface ITaskHistoryItem {
  actionTaken: TaskActionTaken;
  rationale: string;
  editedBy: {
    user: IUser;
    team: ITeamEntity;
  };
  dateOfChange: Date | string;
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
  taskHistory: ITaskHistoryItem[];
}

export interface ITaskEntity extends ITaskEntityData {
}

export interface ITeamMetadata extends IEntity {
  caseFileNumber: string;
}

export type IdParams = uuid;
