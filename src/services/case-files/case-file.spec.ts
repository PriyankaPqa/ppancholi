import { mockCaseFilesSearchData } from '@/entities/case-file';
import { mockHttp } from '@/services/httpClient.mock';
import { mockSearchParams } from '@/test/helpers';
import { IListOption } from '@/types';
import { CaseFilesService } from './case-files';

const http = mockHttp();

describe('>>> Case File Service', () => {
  const service = new CaseFilesService(http as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('searchEvents is linked to the correct URL and params', async () => {
    const params = mockSearchParams;
    await service.searchCaseFiles(params);
    expect(http.get).toHaveBeenCalledWith('/search/case-file-projections', { params, isOData: true });
  });

  test('setCaseFileTags is linked to the correct URL and params', async () => {
    const id = mockCaseFilesSearchData()[0].caseFileId;
    const payload: IListOption[] = [{ optionItemId: 'foo', specifiedOther: null }];

    await service.setCaseFileTags(id, payload);
    expect(http.patch).toHaveBeenCalledWith(`/case-file/case-files/${id}/tags`, { tags: payload });
  });
});
