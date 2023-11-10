import { IListOption } from '@libs/shared-lib/types';
import { ActionStatus, ITaskEntity, ITaskEntityData, ITaskActionHistory, TaskStatus, TaskType } from './task.types';
import { BaseEntity } from '../base';

export class TaskEntity extends BaseEntity implements ITaskEntity {
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

  actionTaken: ActionStatus;

  taskActionHistories: ITaskActionHistory[];

  constructor(data?: ITaskEntityData) {
    if (data) {
      super(data);
      this.name = data.name ? { ...data.name } : { optionItemId: null, specifiedOther: null };
      this.caseFileId = data.caseFileId || '';
      this.isUrgent = data.isUrgent || false;
      this.category = data.category ? { ...data.category } : { optionItemId: null, specifiedOther: null };
      this.description = data.description || '';
      this.assignedTeamId = data.assignedTeamId || '';
      this.taskStatus = data.taskStatus || null;
      this.taskType = data.taskType || null;
      this.dateAdded = data.dateAdded || '';
      this.dueDate = data.dueDate || '';
      this.userWorkingOn = data.userWorkingOn || null;
      this.actionTaken = data.actionTaken;
      this.taskActionHistories = data.taskActionHistories;
    } else {
      super();
      this.name = { optionItemId: null, specifiedOther: null };
      this.caseFileId = '';
      this.isUrgent = false;
      this.category = { optionItemId: null, specifiedOther: null };
      this.description = '';
      this.assignedTeamId = '';
      this.taskStatus = null;
      this.taskType = null;
      this.dateAdded = '';
      this.dueDate = '';
      this.userWorkingOn = null;
      this.actionTaken = null;
      this.taskActionHistories = [];
    }
  }
}
