import { MassActionService } from '@/mass-actions/entity/massAction';
import { MassActionDataCorrectionType, MassActionRunType, MassActionType } from '@libs/entities-lib/mass-action';
import { mockMassActionCreatePayload } from '@/mass-actions/entity/massAction.mock';
import { mockHttp } from '../../http-client';

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
    const language = 'en';

    await service.getInvalidFile({ massActionId, runId, language });
    expect(http.getFullResponse).toHaveBeenCalledWith(`${service.baseUrl}/${massActionId}/invalid-file`, {
      params: {
        runId,
        language,
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
      const payload = { filter: 'filter', search: 'search', language: 'en' };

      await service.exportList(MassActionType.FinancialAssistance, payload);

      expect(http.postFullResponse).toHaveBeenCalledWith(`${service.baseUrl}/${urlSuffix}`, payload, { timeout: 600000 });
    });

    it('should be linked to correct URL for export validation of impact status mass action', async () => {
      const urlSuffix = 'export-validation-of-impact-records';
      const payload = { filter: 'filter', search: 'search', language: 'en' };

      await service.exportList(MassActionType.ExportValidationOfImpactStatus, payload);

      expect(http.postFullResponse).toHaveBeenCalledWith(`${service.baseUrl}/${urlSuffix}`, payload, { timeout: 600000 });
    });
  });

  test('getValidFile is linked to the correct URL', async () => {
    const massActionId = '1';
    const runId = '1';
    const language = 'en';

    await service.getValidFile({ massActionId, runId, language });
    expect(http.getFullResponse).toHaveBeenCalledWith(`${service.baseUrl}/${massActionId}/valid-file`, {
      params: {
        runId,
        language,
      },
    });
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
      expect(http.get).toHaveBeenCalledWith('case-file/search/mass-actions', { params, isOData: true });
    });
  });

  test('downloadTemplate should call the endpoint with expected values', async () => {
    const maType = MassActionDataCorrectionType.FinancialAssistance;
    await service.downloadTemplate(maType);
    expect(http.getFullResponse).toHaveBeenCalledWith(`${service.baseUrl}/templates`, {
      responseType: 'blob',
      params: {
        MassActionType: maType,
      },
    });
  });
});
