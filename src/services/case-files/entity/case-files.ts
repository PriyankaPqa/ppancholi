import {
  ICaseFileActivity, ICaseFileLabel, CaseFileTriage, CaseFileStatus, ICaseFileEntity, IIdentityAuthentication,
  IImpactStatusValidation,
} from '@/entities/case-file';
import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@/services/httpClient';
import { IListOption } from '@/types';
import { ICaseFilesService, ICreateCaseFileRequest } from './case-files.types';

const API_URL_SUFFIX = 'case-file';
const CONTROLLER = 'case-files';

export class CaseFilesService extends DomainBaseService<ICaseFileEntity> implements ICaseFilesService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async fetchCaseFileActivities(id: uuid): Promise<ICaseFileActivity[]> {
    return this.http.get(`${this.baseUrl}/${id}/activities`);
  }

  async setCaseFileStatus(id: uuid, { status, rationale, reason }:
     {status: CaseFileStatus, rationale?: string, reason?: IListOption}): Promise<ICaseFileEntity> {
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

  async setCaseFileAssign(id: uuid, payload: {individuals: uuid[], teams: uuid[]}): Promise<ICaseFileEntity> {
    return this.http.patch<ICaseFileEntity>(`${this.baseUrl}/${id}/assign`, payload);
  }

  async createCaseFile(payload: ICreateCaseFileRequest): Promise<ICaseFileEntity> {
    return this.http.post<ICaseFileEntity>(`${this.baseUrl}`, payload);
  }
}
