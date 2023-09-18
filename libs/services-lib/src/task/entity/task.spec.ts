import { TaskService } from '@/task/entity/task';
import { mockTeamTaskEntity } from '@libs/entities-lib/task';
import { mockHttp } from '../../http-client';

const http = mockHttp();

describe('>>> Teams Service', () => {
    const service = new TaskService(http as never);

  test('createTask is linked to the correct URL', async () => {
    const payload = mockTeamTaskEntity();
    await service.createTask(payload);
    expect(http.post).toHaveBeenCalledWith('/case-file/tasks', payload, { globalHandler: false });
  });

  test('editTask is linked to the correct URL', async () => {
    const payload = mockTeamTaskEntity();
    await service.editTask('mock-task-id-123', payload);
    expect(http.post).toHaveBeenCalledWith('/case-file/tasks/mock-task-id-123/edit', payload, { globalHandler: false });
  });

  describe('parseTaskPayload', () => {
    it('should parse data properly', () => {
      const task = mockTeamTaskEntity();
      task.category.optionItemId = null;
      const parseTask = service.parseTaskPayload(task);
      expect(parseTask.category).toEqual(null);
    });

    it('should not parse data when category optionItemId has value', () => {
      const task = mockTeamTaskEntity();
      task.category.optionItemId = 'mock-id';
      const parseTask = service.parseTaskPayload(task);
      expect(parseTask.category.optionItemId).toEqual('mock-id');
    });
  });
});
