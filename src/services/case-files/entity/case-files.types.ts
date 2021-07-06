import {
  ICaseFileActivity, ICaseFileLabel, CaseFileTriage, CaseFileStatus, ICaseFileEntity,
} from '@/entities/case-file';
import { IListOption } from '@/types';

export interface ICaseFilesService {
  fetchCaseFileActivities(id: uuid): Promise<ICaseFileActivity[]>;
  setCaseFileTags(id: uuid, payload: IListOption[]): Promise<ICaseFileEntity>;
  setCaseFileStatus(id: uuid, { status, rationale, reason }:{status: CaseFileStatus, rationale?: string, reason?: IListOption})
  : Promise<ICaseFileEntity>;
  setCaseFileLabels(id: uuid, labels: ICaseFileLabel[]): Promise<ICaseFileEntity>;
  setCaseFileIsDuplicate(id: uuid, isDuplicate: boolean): Promise<ICaseFileEntity>;
  setCaseFileTriage(id: uuid, triage: CaseFileTriage): Promise<ICaseFileEntity>;
  setCaseFileAssign(id: uuid, payload: {individuals: uuid[], teams: uuid[]}): Promise<ICaseFileEntity>;
}

export interface ICaseFilesServiceMock {
  fetchCaseFileActivities: jest.Mock<ICaseFileActivity[]>;
  setCaseFileTags: jest.Mock<ICaseFileEntity>;
  setCaseFileStatus: jest.Mock<ICaseFileEntity>;
  setCaseFileLabels: jest.Mock<ICaseFileEntity>;
  setCaseFileIsDuplicate: jest.Mock<ICaseFileEntity>;
  setCaseFileTriage: jest.Mock<ICaseFileEntity>;
  setCaseFileAssign: jest.Mock<ICaseFileEntity>;
}
