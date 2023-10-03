import { IEntity, mockBaseData, mockBaseMetadata } from '../base';
import { ITaskEntity, ITaskEntityData, ITaskMetadata, TaskStatus, TaskType, ITaskCombined } from './task.types';

const mockBaseTaskEntityData = (force? : Partial<IEntity>): ITaskEntityData => ({
  ...mockBaseData(),
  id: '',
  name: {
    optionItemId: '',
    specifiedOther: '',
  },
  caseFileId: 'mock-case-file-id-1',
  isUrgent: false,
  category: {
    optionItemId: '',
    specifiedOther: '',
  },
  description: 'mock-description',
  assignedTeamId: 'mock-team-id-1',
  taskStatus: TaskStatus.InProgress,
  taskType: null,
  dateAdded: '2020-02-01T00:00:00Z',
  dueDate: '',
  ...force,
});

export const mockTeamTaskEntity = (force? : Partial<IEntity>): ITaskEntityData => ({
  ...mockBaseTaskEntityData(),
  id: 'mock-team-task-id-1',
  taskType: TaskType.Team,
  name: {
    optionItemId: '986192ea-3f7b-4539-8a65-214161aea367',
    specifiedOther: '',
  },
  category: {
    optionItemId: '7eb37c59-4947-4edf-8146-c2458bd2b6f6',
    specifiedOther: '',
  },
  ...force,
});

export const mockPersonalTaskEntity = (force? : Partial<IEntity>): ITaskEntityData => ({
  ...mockBaseTaskEntityData(),
  id: 'mock-personal-task-id-1',
  name: {
    optionItemId: '986192ea-3f7b-4539-8a65-214161aea367',
    specifiedOther: '',
  },
  category: {
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

export const mockTaskMetadata = (force? : Partial<IEntity>): ITaskMetadata => ({
  ...mockBaseMetadata(),
  caseFileNmuber: 'mock-case-file-number-1',
  ...force,
});

export const mockTaskMetadatum = (force? : Partial<IEntity>): ITaskMetadata[] => [
  mockTaskMetadata(force),
];

export const mockCombinedTaskData = (): ITaskCombined[] => ([
  {
    entity: mockTeamTaskEntity({ id: '1' }),
    metadata: mockTaskMetadata({ id: '1' }),
    pinned: false,
  },
  {
    entity: mockTeamTaskEntity({ id: '2' }),
    metadata: mockTaskMetadata({ id: '2' }),
    pinned: false,
  },
]);
