import { ERegistrationMethod } from '@crctech/registration-lib/src/types';
import {
  ICaseFileActivity, ICaseFileLabel, CaseFileTriage, CaseFileStatus, ICaseFileEntity, IIdentityAuthentication,
  IImpactStatusValidation,
  ICaseFileCount,
  ICaseFileDetailedCount,
} from '@/entities/case-file';
import { IListOption } from '@/types';

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

export interface ICaseFilesService {
  fetchCaseFileActivities(id: uuid): Promise<ICaseFileActivity[]>;
  setCaseFileTags(id: uuid, payload: IListOption[]): Promise<ICaseFileEntity>;
  setCaseFileStatus(id: uuid, { status, rationale, reason }:{status: CaseFileStatus, rationale?: string, reason?: IListOption})
  : Promise<ICaseFileEntity>;
  setCaseFileLabels(id: uuid, labels: ICaseFileLabel[]): Promise<ICaseFileEntity>;
  setCaseFileIsDuplicate(id: uuid, isDuplicate: boolean): Promise<ICaseFileEntity>;
  setCaseFileTriage(id: uuid, triage: CaseFileTriage): Promise<ICaseFileEntity>;
  setCaseFileAssign(id: uuid, payload: {individuals: uuid[], teams: uuid[]}): Promise<ICaseFileEntity>;
  createCaseFile(payload: ICreateCaseFileRequest): Promise<ICaseFileEntity>;
  setCaseFileIdentityAuthentication(id: uuid, identityAuthentication: IIdentityAuthentication): Promise<ICaseFileEntity>;
  setCaseFileValidationOfImpact(id: uuid, impactStatusValidation: IImpactStatusValidation): Promise<ICaseFileEntity>;
  getCaseFileAssignedCounts(params: {eventId: uuid, teamId: uuid}): Promise<ICaseFileCount>;
  fetchCaseFileDetailedCounts(eventId: uuid): Promise<ICaseFileDetailedCount>;
}

export interface ICaseFilesServiceMock {
  fetchCaseFileActivities: jest.Mock<ICaseFileActivity[]>;
  setCaseFileTags: jest.Mock<ICaseFileEntity>;
  setCaseFileStatus: jest.Mock<ICaseFileEntity>;
  setCaseFileLabels: jest.Mock<ICaseFileEntity>;
  setCaseFileIsDuplicate: jest.Mock<ICaseFileEntity>;
  setCaseFileTriage: jest.Mock<ICaseFileEntity>;
  setCaseFileAssign: jest.Mock<ICaseFileEntity>;
  createCaseFile: jest.Mock<ICaseFileEntity>;
  setCaseFileValidationOfImpact: jest.Mock<ICaseFileEntity>;
  getCaseFileAssignedCounts: jest.Mock<ICaseFileCount>;
  // todo add mock from api response here for getCaseFileAssignedCounts
  fetchCaseFileDetailedCounts: jest.Mock<ICaseFileDetailedCount>;
}
