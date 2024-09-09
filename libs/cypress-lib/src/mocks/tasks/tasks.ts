import { ActionTaken, ITaskEntity, TaskStatus, TaskType } from '@libs/entities-lib/task';
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

export const mockCreateTeamTaskRequest = (force?: Partial<ITaskEntity>): ITaskEntity => ({
  ...mockBaseData(),
  category: {
    optionItemId: 'b8ce7629-5e6c-4663-9c2c-180c2e1b9fbc',
    specifiedOther: null,
  },
  caseFileId: 'cfb5e8d7-5aa1-4b19-971f-eef0ebc4055',
  isUrgent: true,
  subCategory: {
    optionItemId: '9f10b2ef-27a0-41ed-ab08-e5a07467a8c5',
    specifiedOther: null,
  },
  description: 'Test Team Task Description',
  assignedTeamId: 'fd89b9ef-da43-4be5-9a7c-30589a2be135',
  taskStatus: TaskStatus.InProgress,
  taskType: TaskType.Team,
  dateAdded: '',
  dueDate: null,
  userWorkingOn: null,
  actionTaken: null,
  taskActionHistories: [],
  financialAssistancePaymentId: null,
  ...force,
});

export const mockSetTaskActionTakenRequest = (actionTaken: ActionTaken, teamId: string) => ({
  actionTaken,
  rationale: 'Rationale test assign team task through api',
  teamId,
});
