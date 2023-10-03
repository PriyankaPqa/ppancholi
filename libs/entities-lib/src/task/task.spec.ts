import { TaskEntity } from '@/task/task';
import { mockTeamTaskEntity } from '@/task/task.mock';
import { TaskStatus, TaskType } from '@/task/task.types';

const mockTaskData = mockTeamTaskEntity();

describe('>>> Task', () => {
  describe('>> constructor', () => {
    it('should instantiate id', () => {
      const task = new TaskEntity({ ...mockTaskData, id: '***' });
      expect(task.id).toBe('***');
    });

    it('should instantiate name', () => {
      const task = new TaskEntity({
        ...mockTaskData,
        name: {
          optionItemId: '986192ea-3f7b-4539-8a65-214161aea367',
          specifiedOther: '',
        } });
      expect(task.name).toEqual({
        optionItemId: '986192ea-3f7b-4539-8a65-214161aea367',
          specifiedOther: '',
      });
    });

    it('should instantiate caseFileId', () => {
      const task = new TaskEntity({ ...mockTaskData, caseFileId: '***' });
      expect(task.caseFileId).toBe('***');
    });

    it('should instantiate isUrgent', () => {
      const task = new TaskEntity({ ...mockTaskData, isUrgent: true });
      expect(task.isUrgent).toBe(true);
    });

    it('should instantiate category', () => {
      const task = new TaskEntity({
        ...mockTaskData,
        category: {
          optionItemId: '986192ea-3f7b-4539-8a65-214161aea367',
          specifiedOther: '',
        },
      });
      expect(task.category).toEqual(
        {
          optionItemId: '986192ea-3f7b-4539-8a65-214161aea367',
          specifiedOther: '',
        },
        );
    });

    it('should instantiate description', () => {
      const task = new TaskEntity({ ...mockTaskData, description: '***' });
      expect(task.description).toBe('***');
    });

    it('should instantiate assignedTeamId', () => {
      const task = new TaskEntity({ ...mockTaskData, assignedTeamId: '***' });
      expect(task.assignedTeamId).toBe('***');
    });

    it('should instantiate taskStatus', () => {
      const task = new TaskEntity({ ...mockTaskData, taskStatus: TaskStatus.Completed });
      expect(task.taskStatus).toBe(TaskStatus.Completed);
    });

    it('should instantiate taskType', () => {
      const task = new TaskEntity({ ...mockTaskData, taskType: TaskType.Personal });
      expect(task.taskType).toBe(TaskType.Personal);
    });

    it('should instantiate dateAdded', () => {
      const task = new TaskEntity({ ...mockTaskData, dateAdded: '2023-08-01' });
      expect(task.dateAdded).toBe('2023-08-01');
    });

    it('should instantiate dueDate', () => {
      const task = new TaskEntity({ ...mockTaskData, dueDate: '2023-08-01' });
      expect(task.dueDate).toBe('2023-08-01');
    });

    it('should instantiate properties with proper data when no params', () => {
      const task = new TaskEntity();
      expect(task.id).toBe('');
      expect(task.name).toEqual({ optionItemId: null, specifiedOther: null });
      expect(task.taskType).toBe(null);
      expect(task.caseFileId).toBe('');
      expect(task.isUrgent).toBe(false);
      expect(task.category).toEqual({ optionItemId: null, specifiedOther: null });
      expect(task.description).toBe('');
      expect(task.dateAdded).toBe('');
      expect(task.dueDate).toBe('');
      expect(task.taskStatus).toBe(null);
      expect(task.assignedTeamId).toBe('');
    });
  });
});
