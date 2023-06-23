import { ERegistrationMethod, IAzureCombinedSearchResult, IListOption } from '@libs/shared-lib/types';
import {
  ICaseFileActivity, ICaseFileLabel, CaseFileTriage, CaseFileStatus, ICaseFileEntity, IIdentityAuthentication,
  IImpactStatusValidation,
  ICaseFileCount,
  ICaseFileDetailedCount, IAssignedTeamMembers, ICaseFileMetadata,
} from '@libs/entities-lib/case-file';
import { IDetailedRegistrationResponse } from '@libs/entities-lib/src/household';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface ICreateCaseFileRequest {
  householdId: uuid;
  eventId: uuid;
  consentInformation: {
    registrationMethod: ERegistrationMethod;
    registrationLocationId: uuid;
    crcUserName: string,
    privacyDateTimeConsent: string;
  }
}

export interface ICaseFilesService extends IDomainBaseService<ICaseFileEntity, uuid> {
  fetchCaseFileActivities(id: uuid): Promise<ICaseFileActivity[]>;
  setCaseFileTags(id: uuid, payload: IListOption[]): Promise<ICaseFileEntity>;
  setCaseFileStatus(id: uuid, { status, rationale, reason }:{ status: CaseFileStatus, rationale?: string, reason?: IListOption })
  : Promise<ICaseFileEntity>;
  setCaseFileLabels(id: uuid, labels: ICaseFileLabel[]): Promise<ICaseFileEntity>;
  setCaseFileIsDuplicate(id: uuid, isDuplicate: boolean): Promise<ICaseFileEntity>;
  setCaseFileTriage(id: uuid, triage: CaseFileTriage): Promise<ICaseFileEntity>;
  createCaseFile(payload: ICreateCaseFileRequest, publicMode: boolean): Promise<IDetailedRegistrationResponse>;
  setCaseFileIdentityAuthentication(id: uuid, identityAuthentication: IIdentityAuthentication): Promise<ICaseFileEntity>;
  setCaseFileValidationOfImpact(id: uuid, impactStatusValidation: IImpactStatusValidation): Promise<ICaseFileEntity>;
  getCaseFileAssignedCounts(params: { eventId: uuid, teamId: uuid }): Promise<ICaseFileCount>;
  fetchCaseFileDetailedCounts(eventId: uuid): Promise<ICaseFileDetailedCount>;
  assignCaseFile(id: uuid, payload: { teamMembers: IAssignedTeamMembers[], teams: uuid[] }): Promise<ICaseFileEntity>
  getSummary(id: uuid): Promise<ICaseFileEntity>;
  getAssignedCaseFiles(teamMemberId: uuid): Promise<IAzureCombinedSearchResult<ICaseFileEntity, ICaseFileMetadata>>;
  getAllCaseFilesRelatedToHouseholdId(householdId: uuid): Promise<ICaseFileEntity[]>;
  setPersonReceiveAssistance(caseFileId: uuid, params: { receiveAssistance: boolean, personId: string, rationale: string }): Promise<ICaseFileEntity>;
}

export interface ICaseFilesServiceMock extends IDomainBaseServiceMock<ICaseFileEntity> {
  fetchCaseFileActivities: jest.Mock<ICaseFileActivity[]>;
  setCaseFileTags: jest.Mock<ICaseFileEntity>;
  setCaseFileStatus: jest.Mock<ICaseFileEntity>;
  setCaseFileLabels: jest.Mock<ICaseFileEntity>;
  setCaseFileIsDuplicate: jest.Mock<ICaseFileEntity>;
  setCaseFileTriage: jest.Mock<ICaseFileEntity>;
  setCaseFileIdentityAuthentication: jest.Mock<ICaseFileEntity>;
  createCaseFile: jest.Mock<IDetailedRegistrationResponse>;
  setCaseFileValidationOfImpact: jest.Mock<ICaseFileEntity>;
  getCaseFileAssignedCounts: jest.Mock<ICaseFileCount>;
  fetchCaseFileDetailedCounts: jest.Mock<ICaseFileDetailedCount>;
  assignCaseFile: jest.Mock<ICaseFileEntity>;
  getSummary: jest.Mock<ICaseFileEntity>;
  getAssignedCaseFiles: jest.Mock<IAzureCombinedSearchResult<ICaseFileEntity, ICaseFileMetadata>>;
  getAllCaseFilesRelatedToHouseholdId: jest.Mock<ICaseFileEntity[]>;
  setPersonReceiveAssistance: jest.Mock<ICaseFileEntity>;
}
