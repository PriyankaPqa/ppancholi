import { ICaseFileLabel, mockCaseFilesSearchData } from '@/entities/case-file';
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

  describe('searchCaseFiles', () => {
    it('is linked to the correct URL and params', async () => {
      const params = mockSearchParams;
      await service.searchCaseFiles(params);
      expect(http.get).toHaveBeenCalledWith('/search/case-file-projections', { params, isOData: true });
    });
  });

  describe('setCaseFileTags', () => {
    it('is linked to the correct URL and params', async () => {
      const id = mockCaseFilesSearchData()[0].caseFileId;
      const payload: IListOption[] = [{ optionItemId: 'foo', specifiedOther: null }];

      await service.setCaseFileTags(id, payload);
      expect(http.patch).toHaveBeenCalledWith(`/case-file/case-files/${id}/tags`, { tags: payload });
    });
  });

  describe('setCaseFileLabels', () => {
    it('is linked to the correct URL and params', async () => {
      const id = mockCaseFilesSearchData()[0].caseFileId;
      const payload: ICaseFileLabel[] = [{
        name: 'Label One',
        order: 1,
      }, {
        name: 'Label Two',
        order: 2,
      }];

      await service.setCaseFileLabels(id, payload);
      expect(http.patch).toHaveBeenCalledWith(`/case-file/case-files/${id}/labels`, { labels: payload });
    });
  });

  describe('setCaseFileIsDuplicate', () => {
    it('is linked to the correct URL and params', async () => {
      const id = mockCaseFilesSearchData()[0].caseFileId;
      const isDuplicate = true;

      await service.setCaseFileIsDuplicate(id, isDuplicate);
      expect(http.patch).toHaveBeenCalledWith(`/case-file/case-files/${id}/is-duplicate`, { isDuplicate });
    });
  });
});
