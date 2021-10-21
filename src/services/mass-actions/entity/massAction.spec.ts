import { mockHttp } from '@/services/httpClient.mock';
import { MassActionService } from '@/services/mass-actions/entity/massAction';
import { MassActionRunType, MassActionType } from '@/entities/mass-action';
import { mockMassActionCreatePayload } from '@/services/mass-actions/entity/massAction.mock';

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

  test('create is linked to the correct URL', async () => {
    const urlSuffix = 'financial-assistance-from-list';
    const payload = mockMassActionCreatePayload();

    await service.create(urlSuffix, payload);

    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/${urlSuffix}`, payload);
  });

  describe('exportList', () => {
    it('should be linked to correct URL for financial assistance mass action', async () => {
      const urlSuffix = 'export-financial-assistance-records';
      const payload = { filter: 'filter', search: 'search' };

      await service.exportList(MassActionType.FinancialAssistance, payload);

      expect(http.postFullResponse).toHaveBeenCalledWith(`${service.baseUrl}/${urlSuffix}`, payload);
    });
  });
});
