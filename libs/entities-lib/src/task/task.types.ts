import { IListOption, IMultilingual, IUserInformation } from '@libs/shared-lib/types';
import { IEntity, IEntityCombined } from '../base';

export enum TaskType {
  Team = 1,
  Personal = 2,
}

export enum TaskStatus {
  New = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4,
}

// used in the FE
export enum TaskActionTaken {
  Assign = 0,
  ActionCompleted = 1,
  TaskCompleted = 2,
  Reopen = 3,
  Cancelled = 4,
}

export enum ActionTaken {
  Create = 1,
  Assign = 2,
  Completed = 3,
  Reopen = 4,
  Cancelled = 5,
}

// used for history action type
export enum TaskActivityType {
  Create = 1,
  Assign = 2,
  Completed = 3,
  Reopen = 4,
  Cancelled = 5,
  WorkingOn = 6,
  UrgentStatusTagUpdated = 7,
  FinancialAssistancePaymentUpdated = 8,
  TaskDetailsUpdated = 9,
}

export interface ITaskEntityData extends IEntity {
  category: IListOption;
  caseFileId: string;
  isUrgent: boolean;
  subCategory: IListOption;
  description: string;
  assignedTeamId: string;
  taskStatus: TaskStatus;
  taskType: TaskType;
  dateAdded: Date | string;
  dueDate: Date | string;
  userWorkingOn: string;
  actionTaken: ActionTaken;
  taskActionHistories: ITaskActionHistory[];
  financialAssistancePaymentId: string;
}

export interface ITaskEntity extends ITaskEntityData {
}

export interface ITaskActionHistory {
  activityType: TaskActivityType,
  taskStatus: TaskStatus,
  currentTeamId: uuid,
  currentTeamName: string,
  previousTeamId: uuid,
  previousTeamName: string,
  rationale: string,
  timestamp: string,
  userInformation: IUserInformation,
  financialAssistancePaymentName: string,
  financialAssistancePaymentId: uuid,
  currentUserWorkingOn: uuid,
  isUrgent: boolean,
}

export interface ITaskMetadata extends IEntity {
  caseFileNumber: string;
  eventId: uuid;
  userWorkingOnName: string;
  userWorkingOnRole: IMultilingual;
}

export interface IUpdateTaskRequest {
  category: IListOption;
  caseFileId: string;
  isUrgent: boolean;
  subCategory: IListOption;
  description: string;
  assignedTeamId: string;
  financialAssistancePaymentId: string;
  dueDate: Date | string;
}

export type ITaskCombined = IEntityCombined<ITaskEntity, ITaskMetadata>;

export type IdParams = { id: uuid, caseFileId: uuid };
