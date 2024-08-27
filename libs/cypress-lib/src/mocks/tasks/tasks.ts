import { ITaskEntity, TaskStatus, TaskType } from '@libs/entities-lib/task';
import { mockBaseData } from '@libs/entities-lib/base';
import { today } from '@libs/cypress-lib/helpers';

export const mockCreatePersonalTaskRequest = (force?: Partial<ITaskEntity>): ITaskEntity => ({
  ...mockBaseData(),
  category: {
    optionItemId: '528c07fc-193d-4d1a-ae2f-766f6e6468c2',
    specifiedOther: 'Test Personal Task',
  },
  caseFileId: 'cfb5e8d7-5aa1-4b19-971f-eef0ebc4055',
  isUrgent: false,
  subCategory: null,
  description: 'Test Personal Task Description',
  assignedTeamId: '',
  taskStatus: TaskStatus.InProgress,
  taskType: TaskType.Personal,
  dateAdded: '',
  dueDate: today,
  userWorkingOn: null,
  actionTaken: null,
  taskActionHistories: [],
  financialAssistancePaymentId: '',
  ...force,
  });
