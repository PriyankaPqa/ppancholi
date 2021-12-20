/**
 * @group services
 */

import {
  ICaseFileLabel, mockCaseFileEntity, CaseFileTriage, CaseFileStatus,
} from '@/entities/case-file';
import { IHttpMock, mockHttp } from '@/services/httpClient.mock';
import { IListOption } from '@/types';
import { CaseFilesService } from './case-files';

describe('>>> Case File Service', () => {
  let http: IHttpMock;
  let service: CaseFilesService;

  beforeEach(() => {
    jest.clearAllMocks();
    http = mockHttp();
    service = new CaseFilesService(http as never);
  });

  describe('fetchCaseFileActivities', () => {
    it('is linked to the correct URL and params', async () => {
      const id = 'MOCK_ID';
      await service.fetchCaseFileActivities(id);
      expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/${id}/activities`);
    });
  });

  describe('setCaseFileTags', () => {
    it('is linked to the correct URL and params', async () => {
      const { id } = mockCaseFileEntity();
      const payload: IListOption[] = [{ optionItemId: 'foo', specifiedOther: null }];

      await service.setCaseFileTags(id, payload);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/tags`, { tags: payload });
    });
  });

  describe('setCaseFileStatus', () => {
    describe('inactive', () => {
      it('is linked to the correct URL and params', async () => {
        const { id } = mockCaseFileEntity();
        const status: CaseFileStatus = CaseFileStatus.Inactive;
        const rationale = 'Some rationale';
        const reason: IListOption = { optionItemId: 'foo', specifiedOther: null };

        await service.setCaseFileStatus(id, { status, rationale, reason });
        expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/deactivate`, { reason, rationale });
      });
    });

    describe('archive', () => {
      it('is linked to the correct URL and params', async () => {
        const { id } = mockCaseFileEntity();
        const status: CaseFileStatus = CaseFileStatus.Archived;

        await service.setCaseFileStatus(id, { status, rationale: null, reason: null });
        expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/archive`, {});
      });
    });

    describe('reopen', () => {
      it('is linked to the correct URL and params', async () => {
        const { id } = mockCaseFileEntity();
        const status: CaseFileStatus = CaseFileStatus.Open;
        const rationale = 'Some rationale';

        await service.setCaseFileStatus(id, { status, rationale, reason: null });
        expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/reopen`, { rationale });
      });
    });

    describe('close', () => {
      it('is linked to the correct URL and params', async () => {
        const { id } = mockCaseFileEntity();
        const status: CaseFileStatus = CaseFileStatus.Closed;
        const rationale = 'Some rationale';
        const reason: IListOption = { optionItemId: 'foo', specifiedOther: null };

        await service.setCaseFileStatus(id, { status, rationale, reason });
        expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/close`, { rationale, reason });
      });
    });
  });

  describe('setCaseFileLabels', () => {
    it('is linked to the correct URL and params', async () => {
      const { id } = mockCaseFileEntity();
      const payload: ICaseFileLabel[] = [
        {
          name: 'Label One',
          order: 1,
        },
        {
          name: 'Label Two',
          order: 2,
        },
      ];

      await service.setCaseFileLabels(id, payload);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/labels`, { labels: payload });
    });
  });

  describe('setCaseFileIsDuplicate', () => {
    it('is linked to the correct URL and params', async () => {
      const { id } = mockCaseFileEntity();
      const isDuplicate = true;

      await service.setCaseFileIsDuplicate(id, isDuplicate);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/is-duplicate`, { isDuplicate });
    });
  });

  describe('setCaseFileIdentityAuthentication', () => {
    it('is linked to the correct URL and params', async () => {
      const { id, identityAuthentication } = mockCaseFileEntity();

      await service.setCaseFileIdentityAuthentication(id, identityAuthentication);
      expect(http.patch).toHaveBeenCalledWith(`/case-file/case-files/${id}/authentication-of-identity`, identityAuthentication);
    });
  });

  describe('setCaseFileValidationOfImpact', () => {
    it('is linked to the correct URL and params', async () => {
      const { id, impactStatusValidation } = mockCaseFileEntity();

      await service.setCaseFileValidationOfImpact(id, impactStatusValidation);
      expect(http.patch).toHaveBeenCalledWith(`/case-file/case-files/${id}/validation-of-impact-status`, { ...impactStatusValidation });
    });
  });

  describe('setCaseFileTriage', () => {
    it('is linked to the correct URL and params', async () => {
      const { id } = mockCaseFileEntity();
      const triage = CaseFileTriage.Tier1;

      await service.setCaseFileTriage(id, triage);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/triage`, { triage });
    });
  });

  describe('setCaseFileAssign', () => {
    it('is linked to the correct URL and params', async () => {
      const { id } = mockCaseFileEntity();
      const individuals = ['mock-individual-id'];
      const teams = ['mock-teams-id'];
      const payload = { individuals, teams };

      await service.setCaseFileAssign(id, payload);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/assign`, payload);
    });
  });

  describe('createCaseFile', () => {
    it('is linked to the correct URL and params', async () => {
      const payload = {
        householdId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        eventId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        consentInformation: {
          registrationMethod: 1,
          registrationLocationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          crcUserName: 'string',
          privacyDateTimeConsent: '2021-07-06T19:37:10.185Z',
        },
      };

      await service.createCaseFile(payload);
      expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}`, payload);
    });
  });

  describe('getCaseFileDetailedCounts', () => {
    it('is linked to the correct URL and params', async () => {
      const eventId = '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c3';

      await service.fetchCaseFileDetailedCounts(eventId);

      expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/detailed-assigned-counts`, { params: { eventId } });
    });
  });
});
