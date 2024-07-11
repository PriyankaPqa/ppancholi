import {
  ICaseFileLabel, mockCaseFileEntity, CaseFileTriage, CaseFileStatus, mockAssignedTeamMembers, ITier2Request, IRecoveryPlan,
} from '@libs/entities-lib/case-file';
import { IListOption } from '@libs/shared-lib/types';
import { ICaseFileIndividualCreateRequest } from '@libs/entities-lib/case-file-individual';
import { IHttpMock, mockHttp } from '../../http-client';
import { CaseFilesService } from './case-files';

const ORCHESTRATION_CONTROLLER = 'orchestration/orchestration-households';

describe('>>> Case File Service', () => {
  let http: IHttpMock;
  let service: CaseFilesService;

  beforeEach(() => {
    jest.clearAllMocks();
    http = mockHttp();
    service = new CaseFilesService(http as never);
  });

  describe('tier2ProcessStart', () => {
    it('tier2ProcessStart is linked to the correct URL', async () => {
      const payload = {} as ITier2Request;
      await service.tier2ProcessStart(payload);
      expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/public/${payload.id}/start-customer-identity-verification-tier-2`, payload, { globalHandler: 'Partial' });
    });
  });

  describe('getTier2Result', () => {
    it('getTier2Result is linked to the correct URL', async () => {
      await service.getTier2Result('someid', true);
      expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/public/customer-identity-verification-tier-2-result/someid?addCaseFileActivity=true`);
    });
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
        individuals: [] as ICaseFileIndividualCreateRequest[],
      };

      await service.createCaseFile(payload, false);
      expect(http.post).toHaveBeenCalledWith(`${http.baseUrl}/${ORCHESTRATION_CONTROLLER}/case-file`, payload);
      await service.createCaseFile(payload, true);
      expect(http.post).toHaveBeenCalledWith(`${http.baseUrl}/${ORCHESTRATION_CONTROLLER}/public/case-file`, payload);
    });
  });

  describe('getCaseFileDetailedCounts', () => {
    it('is linked to the correct URL and params', async () => {
      const eventId = '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c3';

      await service.fetchCaseFileDetailedCounts(eventId);

      expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/detailed-assigned-counts`, { params: { eventId } });
    });
  });

  describe('search', () => {
    it('should call the proper endpoint', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('case-file/search/case-filesV2', { params, isOData: true });
    });
  });

  describe('assignCaseFile', () => {
    it('is linked to the correct URL and params', async () => {
      const { id } = mockCaseFileEntity();
      const teamMembers = mockAssignedTeamMembers();
      const teams = ['mock-teams-id'];
      const payload = { teamMembers, teams };

      await service.assignCaseFile(id, payload);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/assign-case-file-teams-and-team-members`, payload);
    });
  });

  describe('getSummary', () => {
    it('is linked to the correct URL and params', async () => {
      const id = '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c3';

      await service.getSummary(id);

      expect(http.get).toHaveBeenCalledWith('case-file/search/casefile-summaries', { params: { filter: { id: { value: id, type: 'guid' } } }, isOData: true });
    });
  });

  describe('searchSummaries', () => {
    it('is linked to the correct URL and params', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.searchSummaries(params);
      expect(http.get).toHaveBeenCalledWith('case-file/search/casefile-summaries', { params, isOData: true });
    });
  });

  describe('getAllCaseFilesRelatedToHouseholdId', () => {
    it('is linked to the correct URL and params', async () => {
      const id = '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c3';
      await service.getAllCaseFilesRelatedToHouseholdId(id);
      expect(http.get).toHaveBeenCalledWith('/case-file/case-files/get-all-case-files-related-to-household-id', { params: { householdId: id } });
    });
  });

  describe('setPersonReceiveAssistance', () => {
    it('is linked to the correct URL and params', async () => {
      const id = '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c3';
      const params = { receiveAssistance: false, personId: '1ea8ebda-d0c8-4482-85cb-6f5f4447d3c3', rationale: 'mock-rationale' };
      await service.setPersonReceiveAssistance(id, params);
      expect(http.patch).toHaveBeenCalledWith(`/case-file/case-files/${id}/receive-assistance`, params);
    });
  });

  describe('getExceptionalTypeCounts', () => {
    it('is linked to the correct URL and params', async () => {
      const eventId = '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c3';
      await service.getExceptionalTypeCounts(eventId);
      expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/exceptional-type-counts`, { params: { eventId } });
    });
  });

  describe('editRecoveryPlan', () => {
    it('is linked to the correct URL and params', async () => {
      const recoveryPlan: IRecoveryPlan = {
        hasRecoveryPlan: true,
        crcProvided: true,
        startDate: '2023-11-16',
      };
      await service.editRecoveryPlan('mock-id-1', recoveryPlan);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/mock-id-1/recovery-plan`, recoveryPlan);
    });
  });

  describe('getRecentlyViewed', () => {
    it('is linked to the correct URL and params', async () => {
      await service.getRecentlyViewed();
      expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/recently-viewed`);
    });
  });

  describe('addRecentlyViewed', () => {
    it('is linked to the correct URL and params', async () => {
      await service.addRecentlyViewed('mock-id-1');
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/recently-viewed`, { id: 'mock-id-1' });
    });
  });
});
