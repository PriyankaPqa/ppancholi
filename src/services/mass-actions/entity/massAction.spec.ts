import { mockHttp } from '@/services/httpClient.mock';
import { MassActionService } from '@/services/mass-actions/entity/massAction';
import { MassActionRunType } from '@/entities/mass-action';

const http = mockHttp();
const service = new MassActionService(http as never);

describe('>>> Mass Action Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('process is linked to the correct URL', async () => {
    const id = '1';
    const runType = MassActionRunType.Process;

    await service.process(id, runType);
    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/${id}/run`, { runType });
  });

  test('update is linked to the correct URL', async () => {
    const id = '1';
    const payload = {
      name: 'name',
      description: 'description',
    };

    await service.update(id, payload);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}`, payload);
  });

  test('getInvalidFile is linked to the correct URL', async () => {
    const massActionId = '1';
    const runId = '1';

    await service.getInvalidFile(massActionId, runId);
    expect(http.getFullResponse).toHaveBeenCalledWith(`${service.baseUrl}/${massActionId}/invalid-file`, {
      params: {
        runId,
      },
    });
  });
});
