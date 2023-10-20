import { mockTeamTaskEntity } from '@libs/entities-lib/task';
import { mockDomainBaseService } from '../../base';
import { ITaskServiceMock } from './task.types';

export const mockTaskService = (): ITaskServiceMock => ({
  ...mockDomainBaseService([mockTeamTaskEntity()]),
  createTask: jest.fn(() => mockTeamTaskEntity()),
  editTask: jest.fn(() => mockTeamTaskEntity()),
  setWorkingOn: jest.fn(() => mockTeamTaskEntity()),
  completeTask: jest.fn(() => mockTeamTaskEntity()),
});
