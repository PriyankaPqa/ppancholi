import { IListOption } from '@libs/shared-lib/types';
import { ActionTaken, ITaskEntity, ITaskEntityData, ITaskActionHistory, TaskStatus, TaskType } from './task.types';
import { BaseEntity } from '../base';

export class TaskEntity extends BaseEntity implements ITaskEntity {
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

  constructor(data?: ITaskEntityData) {
    if (data) {
      super(data);
      this.category = data.category ? { ...data.category } : { optionItemId: null, specifiedOther: null };
      this.caseFileId = data.caseFileId || '';
      this.isUrgent = data.isUrgent || false;
      this.subCategory = data.subCategory ? { ...data.subCategory } : { optionItemId: null, specifiedOther: null };
      this.description = data.description || '';
      this.assignedTeamId = data.assignedTeamId || '';
      this.taskStatus = data.taskStatus || null;
      this.taskType = data.taskType || null;
      this.dateAdded = data.dateAdded || '';
      this.dueDate = data.dueDate || '';
      this.userWorkingOn = data.userWorkingOn || null;
      this.actionTaken = data.actionTaken;
      this.taskActionHistories = data.taskActionHistories;
      this.financialAssistancePaymentId = data.financialAssistancePaymentId;
    } else {
      super();
      this.category = { optionItemId: null, specifiedOther: null };
      this.caseFileId = '';
      this.isUrgent = false;
      this.subCategory = { optionItemId: null, specifiedOther: null };
      this.description = '';
      this.assignedTeamId = '';
      this.taskStatus = null;
      this.taskType = null;
      this.dateAdded = '';
      this.dueDate = '';
      this.userWorkingOn = null;
      this.actionTaken = null;
      this.taskActionHistories = [];
      this.financialAssistancePaymentId = '';
    }
  }
}
