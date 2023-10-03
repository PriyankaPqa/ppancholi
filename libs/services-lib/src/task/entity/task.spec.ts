import { TaskService } from '@/task/entity/task';
import { mockTeamTaskEntity } from '@libs/entities-lib/task';
import { mockHttp } from '../../http-client';

const http = mockHttp();

describe('>>> Tasks Service', () => {
    const service = new TaskService(http as never);

  test('createTask is linked to the correct URL', async () => {
    const entity = mockTeamTaskEntity();
    entity.caseFileId = 'mock-case-file-id-1';
    await service.createTask(entity);
    expect(http.post).toHaveBeenCalledWith('www.test.com/case-file/case-files/mock-case-file-id-1/tasks', entity, { globalHandler: false });
  });

  test('editTask is linked to the correct URL', async () => {
    const payload = mockTeamTaskEntity();
    await service.editTask('mock-task-id-123', payload);
    expect(http.post).toHaveBeenCalledWith('/case-file/tasks/mock-task-id-123/edit', payload, { globalHandler: false });
  });

  describe('search', () => {
    it('should call the proper endpoint if a searchEndpoint parameter is passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      const searchEndpoint = 'mock-endpoint';
      await service.search(params, searchEndpoint);
      expect(http.get).toHaveBeenCalledWith(`case-file/search/${searchEndpoint}`, { params, isOData: true });
    });

    it('should call the proper endpoint if a searchEndpoint parameter is not passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('case-file/search/tasks', { params, isOData: true });
    });
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
