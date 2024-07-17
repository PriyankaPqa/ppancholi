import { INotificationHelperView } from '../notification';
import { IEntity, mockBaseData, mockBaseMetadata } from '../base';
import { ActionTaken, ITaskActionHistory, ITaskCombined, ITaskEntity, ITaskEntityData, ITaskMetadata, TaskStatus, TaskType } from './task.types';

export const mockTaskActionHistories = (): ITaskActionHistory[] => ([
  {
    actionTaken: ActionTaken.Create,
    taskStatus: TaskStatus.InProgress,
    currentTeamId: 'mock-team-id-1',
    currentTeamName: 'mock-team-1',
    previousTeamId: '',
    previousTeamName: '',
    rationale: 'create task',
    timestamp: '2023-01-01',
        userInformation: {
      userId: 'mock-user-id-1',
      userName: 'mock-user-name',
      roleId: 'mock-role-id-1',
          roleName: {
            translation: {
              en: 'mock-role-name en',
              fr: 'mock-role-name fr',
            },
          } },
  },
  {
    actionTaken: ActionTaken.Assign,
    taskStatus: TaskStatus.InProgress,
    currentTeamId: 'mock-team-id-2',
    currentTeamName: 'mock-team-2',
    previousTeamId: 'mock-team-id-1',
    previousTeamName: 'mock-team-1',
    rationale: 'assign task to team 2',
    timestamp: '2023-01-01',
    userInformation: {
      userId: 'mock-user-id-1',
      userName: 'mock-user-name',
      roleId: 'mock-role-id-1',
      roleName: {
        translation: {
          en: 'mock-role-name en',
          fr: 'mock-role-name fr',
        },
      } },
  },
  {
    actionTaken: ActionTaken.Completed,
    taskStatus: TaskStatus.InProgress,
    currentTeamId: 'mock-team-id-3',
    previousTeamId: 'mock-team-id-2',
    currentTeamName: 'mock-team-3',
    previousTeamName: 'mock-team-2',
    rationale: 'team 2 finish action, assign to team 3',
    timestamp: '2023-01-02',
    userInformation: {
      userId: 'mock-user-id-1',
      userName: 'mock-user-name',
      roleId: 'mock-role-id-1',
      roleName: {
        translation: {
          en: 'mock-role-name en',
          fr: 'mock-role-name fr',
        },
      } },
  },
  {
    actionTaken: ActionTaken.Completed,
    taskStatus: TaskStatus.Completed,
    currentTeamId: 'mock-team-id-3',
    previousTeamId: 'mock-team-id-3',
    currentTeamName: 'mock-team-3',
    previousTeamName: 'mock-team-3',
    rationale: 'team 3 complete task',
    timestamp: '2023-01-03',
    userInformation: {
      userId: 'mock-user-id-1',
      userName: 'mock-user-name',
      roleId: 'mock-role-id-1',
      roleName: {
        translation: {
          en: 'mock-role-name en',
          fr: 'mock-role-name fr',
        },
      },
    },
  },
  {
    actionTaken: ActionTaken.Reopen,
    taskStatus: TaskStatus.InProgress,
    currentTeamId: 'mock-team-id-3',
    previousTeamId: 'mock-team-id-3',
    currentTeamName: 'mock-team-3',
    previousTeamName: 'mock-team-3',
    rationale: 'team 3 re-open task',
    timestamp: '2023-01-03',
    userInformation: {
      userId: 'mock-user-id-1',
      userName: 'mock-user-name',
      roleId: 'mock-role-id-1',
      roleName: {
        translation: {
          en: 'mock-role-name en',
          fr: 'mock-role-name fr',
        },
      } },
  },
  {
    actionTaken: null,
    taskStatus: TaskStatus.Completed,
    currentTeamId: '',
    previousTeamId: '',
    currentTeamName: '',
    previousTeamName: '',
    rationale: 'Personal task completed',
    timestamp: '2023-01-03',
    userInformation: {
      userId: 'mock-user-id-1',
      userName: 'mock-user-name',
      roleId: 'mock-role-id-1',
      roleName: {
        translation: {
          en: 'mock-role-name en',
          fr: 'mock-role-name fr',
        },
      } },
  },
  {
    actionTaken: ActionTaken.Cancelled,
    taskStatus: TaskStatus.Cancelled,
    currentTeamId: '',
    previousTeamId: '',
    currentTeamName: '',
    previousTeamName: '',
    rationale: 'Personal task cancelled',
    timestamp: '2023-01-03',
    userInformation: {
      userId: 'mock-user-id-1',
      userName: 'mock-user-name',
      roleId: 'mock-role-id-1',
      roleName: {
        translation: {
          en: 'mock-role-name en',
          fr: 'mock-role-name fr',
        },
      } },
  },
]);

const mockBaseTaskEntityData = (force? : Partial<ITaskEntityData>): ITaskEntityData => ({
  ...mockBaseData(),
  id: '',
  category: {
    optionItemId: '',
    specifiedOther: '',
  },
  caseFileId: 'mock-case-file-id-1',
  isUrgent: false,
  subCategory: {
    optionItemId: '',
    specifiedOther: '',
  },
  description: 'mock-description',
  assignedTeamId: 'mock-team-id-1',
  taskStatus: TaskStatus.InProgress,
  taskType: null,
  dateAdded: '2020-02-01T00:00:00Z',
  dueDate: '',
  userWorkingOn: '',
  actionTaken: ActionTaken.Assign,
  taskActionHistories: mockTaskActionHistories(),
  financialAssistancePaymentId: '',
  ...force,
});

export const mockTeamTaskEntity = (force? : Partial<ITaskEntityData>): ITaskEntityData => ({
  ...mockBaseTaskEntityData(),
  id: 'mock-team-task-id-1',
  taskType: TaskType.Team,
  category: {
    optionItemId: '986192ea-3f7b-4539-8a65-214161aea367',
    specifiedOther: '',
  },
  subCategory: {
    optionItemId: '7eb37c59-4947-4edf-8146-c2458bd2b6f6',
    specifiedOther: '',
  },
  ...force,
});

export const mockPersonalTaskEntity = (force? : Partial<ITaskEntityData>): ITaskEntityData => ({
  ...mockBaseTaskEntityData(),
  id: 'mock-personal-task-id-1',
  category: {
    optionItemId: '986192ea-3f7b-4539-8a65-214161aea367',
    specifiedOther: '',
  },
  subCategory: {
    optionItemId: '986192ea-3f7b-4539-8a65-214161aea123',
    specifiedOther: '',
  },
  taskType: TaskType.Personal,
  dueDate: '2023-08-01',
  ...force,
});

export const mockTaskEntities = (): ITaskEntity[] => [
  mockTeamTaskEntity({ id: '1' }),
  mockPersonalTaskEntity({ id: '2' }),
];

export const mockTaskMetadata = (force? : Partial<ITaskMetadata>): ITaskMetadata => ({
  ...mockBaseMetadata(),
  caseFileNumber: 'mock-case-file-number-1',
  eventId: 'mock-event-id-1',
  assignedTeamId: 'mock-team-id-1',
  assignedTeamName: 'mock-team-name-1',
  userWorkingOnId: 'mock-user-id-1',
  userWorkingOnName: 'mock-user-name-1',
  userWorkingOnRole: {
    translation: {
      en: 'system admin en',
      fr: 'system admin fr',
    },
  },
  caseFileId: 'mock-case-file-id-1',
  ...force,
});

export const mockTaskMetadatum = (force? : Partial<IEntity>): ITaskMetadata[] => [
  mockTaskMetadata(force),
];

export const mockCombinedTaskData = (): ITaskCombined[] => ([
  {
    entity: mockTeamTaskEntity({ id: '1' }),
    metadata: mockTaskMetadata({ id: '1', eventId: 'mock-event-id-1' }),
    pinned: false,
  },
  {
    entity: mockTeamTaskEntity({ id: '2' }),
    metadata: mockTaskMetadata({ id: '2', eventId: 'mock-event-id-2' }),
    pinned: false,
  },
]);

export const mockNotificationHelperView = (force? : Partial<INotificationHelperView>): INotificationHelperView => ({
  isDueToday: false,
  isOverdue: false,
  isUrgent: false,
  icon: '',
  targetLink: {
    name: 'taskRoute',
    params: {
      id: '1',
      taskId: '2',
    },
  },
  ...force,
});
