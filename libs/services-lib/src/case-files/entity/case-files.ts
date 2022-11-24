import {
  ICaseFileActivity, ICaseFileLabel, CaseFileTriage, CaseFileStatus, ICaseFileEntity, IIdentityAuthentication,
  IImpactStatusValidation,
  ICaseFileCount,
  ICaseFileDetailedCount, IAssignedTeamMembers,
} from '@libs/entities-lib/case-file';
import { IAzureCombinedSearchResult, IListOption } from '@libs/shared-lib/types';
import { ICaseFileMetadata } from '@libs/entities-lib/src/case-file/case-file.types';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
import { ICaseFilesService, ICreateCaseFileRequest } from './case-files.types';

const API_URL_SUFFIX = 'case-file';
const CONTROLLER = 'case-files';

export class CaseFilesService extends DomainBaseService<ICaseFileEntity, uuid> implements ICaseFilesService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async fetchCaseFileActivities(id: uuid): Promise<ICaseFileActivity[]> {
    return this.http.get(`${this.baseUrl}/${id}/activities`);
  }

  async setCaseFileStatus(id: uuid, { status, rationale, reason }:
     { status: CaseFileStatus, rationale?: string, reason?: IListOption }): Promise<ICaseFileEntity> {
    if (status === CaseFileStatus.Open) {
      return this.http.patch(`${this.baseUrl}/${id}/reopen`, {
        rationale,
      });
    }

    if (status === CaseFileStatus.Closed) {
      return this.http.patch(`${this.baseUrl}/${id}/close`, {
        reason,
        rationale,
      });
    }

    if (status === CaseFileStatus.Inactive) {
      return this.http.patch(`${this.baseUrl}/${id}/deactivate`, {
        reason,
        rationale,
      });
    }

    if (status === CaseFileStatus.Archived) {
      return this.http.patch(`${this.baseUrl}/${id}/archive`, {});
    }

    throw new Error('Invalid status');
  }

  async setCaseFileTags(id: uuid, payload: IListOption[]): Promise<ICaseFileEntity> {
    return this.http.patch<ICaseFileEntity>(`${this.baseUrl}/${id}/tags`, { tags: payload });
  }

  async setCaseFileLabels(id: uuid, labels: ICaseFileLabel[]): Promise<ICaseFileEntity> {
    return this.http.patch<ICaseFileEntity>(`${this.baseUrl}/${id}/labels`, { labels });
  }

  async setCaseFileIsDuplicate(id: uuid, isDuplicate: boolean): Promise<ICaseFileEntity> {
    return this.http.patch<ICaseFileEntity>(`${this.baseUrl}/${id}/is-duplicate`, { isDuplicate });
  }

  async setCaseFileIdentityAuthentication(id: uuid, identityAuthentication: IIdentityAuthentication): Promise<ICaseFileEntity> {
    return this.http.patch(`/case-file/case-files/${id}/authentication-of-identity`, identityAuthentication);
  }

  async setCaseFileTriage(id: uuid, triage: CaseFileTriage): Promise<ICaseFileEntity> {
    return this.http.patch<ICaseFileEntity>(`${this.baseUrl}/${id}/triage`, { triage });
  }

  async setCaseFileValidationOfImpact(id: uuid, impactStatusValidation: IImpactStatusValidation): Promise<ICaseFileEntity> {
    return this.http.patch(`/case-file/case-files/${id}/validation-of-impact-status`, { ...impactStatusValidation });
  }

  // TODO: Remove all references to setCaseFileAssign when EMISV2-4373
  async setCaseFileAssign(id: uuid, payload: { individuals: uuid[], teams: uuid[] }): Promise<ICaseFileEntity> {
    return this.http.patch<ICaseFileEntity>(`${this.baseUrl}/${id}/assign`, payload);
  }

  async createCaseFile(payload: ICreateCaseFileRequest): Promise<ICaseFileEntity> {
    return this.http.post<ICaseFileEntity>(`${this.baseUrl}`, payload);
  }

  async getCaseFileAssignedCounts(params: { eventId: uuid, teamId: uuid }): Promise<ICaseFileCount> {
    return this.http.get('case-file/case-files/assigned-counts', { params });
  }

  async fetchCaseFileDetailedCounts(eventId: uuid): Promise<ICaseFileDetailedCount> {
    return this.http.get(`${this.baseUrl}/detailed-assigned-counts`, { params: { eventId } });
  }

  async assignCaseFile(id: uuid, payload: { teamMembers: IAssignedTeamMembers[], teams: uuid[] }): Promise<ICaseFileEntity> {
    return this.http.patch<ICaseFileEntity>(`${this.baseUrl}/${id}/assign-case-file-teams-and-team-members`, payload);
  }

  async getSummary(id: uuid): Promise<ICaseFileEntity> {
    return this.http.get<ICaseFileEntity>(`${this.baseUrl}/${id}/summary`);
  }

  async getAssignedCaseFiles(teamMemberId: uuid): Promise<IAzureCombinedSearchResult<ICaseFileEntity, ICaseFileMetadata>> {
    return this.http.get('/case-file/case-files/get-assigned-case-files', { params: { teamMemberId } });
  }

  async getAllCaseFilesRelatedToHouseholdId(householdId: uuid): Promise<ICaseFileEntity[]> {
    return this.http.get('/case-file/case-files/get-all-case-files-related-to-household-id', { params: { householdId } });
  }
}
