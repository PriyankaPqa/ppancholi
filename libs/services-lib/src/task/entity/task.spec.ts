import { TaskService } from '@/task/entity/task';
import { ActionTaken, mockTeamTaskEntity } from '@libs/entities-lib/task';
import { mockHttp, GlobalHandler } from '../../http-client';

const http = mockHttp();

describe('>>> Tasks Service', () => {
    const service = new TaskService(http as never);

  test('createTask is linked to the correct URL', async () => {
    const entity = mockTeamTaskEntity();
    entity.caseFileId = 'mock-case-file-id-1';
    await service.createTask(entity);
    expect(http.post).toHaveBeenCalledWith('www.test.com/case-file/case-files/mock-case-file-id-1/tasks', entity, { globalHandler: GlobalHandler.Partial });
  });

  test('editTask is linked to the correct URL', async () => {
    const payload = mockTeamTaskEntity();
    await service.editTask('mock-task-id-123', payload);
    expect(http.post).toHaveBeenCalledWith('www.test.com/case-file/case-files/mock-case-file-id-1/tasks', payload, { globalHandler: GlobalHandler.Partial });
  });

  test('setWorkingOn is linked to the correct URL', async () => {
    await service.setWorkingOn('mock-task-id-123', 'mock-case-file-id-1', 'mock-user-id-1');
    expect(http.patch).toHaveBeenCalledWith('www.test.com/case-file/case-files/mock-case-file-id-1/tasks/mock-task-id-123/set-working-on', { userWorkingOn: 'mock-user-id-1' });
  });

  test('completeTask is linked to the correct URL', async () => {
    await service.completeTask('mock-task-id-123', 'mock-case-file-id-1', 'mock-rationale-123');
    expect(http.patch).toHaveBeenCalledWith('www.test.com/case-file/case-files/mock-case-file-id-1/tasks/mock-task-id-123/complete', { rationale: 'mock-rationale-123' });
  });

  test('setTaskActionTaken is linked to the correct URL', async () => {
    await service.setTaskActionTaken('mock-task-id-123', 'mock-case-file-id-1', { actionTaken: ActionTaken.Assign, rationale: 'mock-rationale-123', teamId: 'mock-team-id-1' });
    expect(http.patch).toHaveBeenCalledWith(
      'www.test.com/case-file/case-files/mock-case-file-id-1/tasks/mock-task-id-123/set-action-taken',
      { actionTaken: ActionTaken.Assign, rationale: 'mock-rationale-123', teamId: 'mock-team-id-1' },
    );
  });

  describe('search', () => {
    it('should call the proper endpoint', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('case-file/search/tasksV2', { params, isOData: true });
    });
  });

  describe('getByIds', () => {
    it('should call the proper endpoint', async () => {
      await service.getByIds(['1', '2', '3']);
      expect(http.get).toHaveBeenCalledWith('case-file/tasks', { params: { ids: ['1', '2', '3'] }, paramsSerializer: { indexes: null } });
    });
  });

  describe('parseTaskPayload', () => {
    it('should parse data properly', () => {
      const task = mockTeamTaskEntity();
      task.category.optionItemId = null;
      task.dueDate = '2024-01-10';
      const parseTask = service.parseTaskPayload(task);
      expect(parseTask.category).toEqual(null);
    });

    it('should parse data properly for date', () => {
      const task = mockTeamTaskEntity();
      task.category.optionItemId = null;
      task.dueDate = '2024-01-10';
      const parseTask = service.parseTaskPayload(task);
      expect(parseTask.dueDate).toEqual('2024-01-10T00:00:00.000Z');
    });

    it('should not parse data when category optionItemId has value', () => {
      const task = mockTeamTaskEntity();
      task.category.optionItemId = 'mock-id';
      const parseTask = service.parseTaskPayload(task);
      expect(parseTask.category.optionItemId).toEqual('mock-id');
    });
  });
});
