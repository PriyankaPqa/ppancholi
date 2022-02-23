import { IOptionItem, IOptionItemData } from '@/entities/optionItem';
import {
  ICaseFileActivity, CaseFileStatus, ICaseFileLabel, CaseFileTriage,
  ICaseFileEntity,
  ICaseFileMetadata,
  IIdentityAuthentication,
  IImpactStatusValidation,
  ICaseFileDetailedCount,
  ICaseFileCount,
} from '@/entities/case-file/case-file.types';
import { IListOption } from '@/types';
import { ICreateCaseFileRequest } from '@/services/case-files/entity';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<ICaseFileEntity, ICaseFileMetadata> {
  tagsOptions(filterOutInactive?: boolean, actualValue?: string[] | string): Array<IOptionItem>;
  inactiveReasons(filterOutInactive?: boolean, actualValue?: string[] | string): Array<IOptionItem>;
  screeningIds(filterOutInactive?: boolean, actualValue?: string[] | string): Array<IOptionItem>;
  closeReasons(filterOutInactive?: boolean, actualValue?: string[] | string): Array<IOptionItem>;
}

export interface IGettersMock extends IBaseGettersMock<ICaseFileEntity, ICaseFileMetadata> {
  tagsOptions: jest.Mock<void>;
  inactiveReasons: jest.Mock<void>;
  screeningIds: jest.Mock<void>;
  closeReasons: jest.Mock<void>;
}

export interface IActions extends IBaseActions<ICaseFileEntity, ICaseFileMetadata, uuid> {
  fetchTagsOptions(): Promise<IOptionItem[]>;
  fetchInactiveReasons(): Promise<IOptionItem[]>;
  fetchScreeningIds(): Promise<IOptionItem[]>;
  fetchCloseReasons(): Promise<IOptionItem[]>;
  fetchCaseFileActivities(id: uuid): Promise<ICaseFileActivity[]>;
  fetchCaseFileAssignedCounts(eventId: uuid, teamId: uuid): Promise<ICaseFileCount>;
  fetchCaseFileDetailedCounts(eventId: uuid): Promise<ICaseFileDetailedCount>;
  setCaseFileTags(id: uuid, tags: IListOption[]): Promise<ICaseFileEntity>;
  setCaseFileStatus(id: uuid, status: CaseFileStatus, rationale?: string, reason?: IListOption): Promise<ICaseFileEntity>;
  setCaseFileLabels(id: uuid, labels: ICaseFileLabel[]): Promise<ICaseFileEntity>;
  setCaseFileIsDuplicate(id: uuid, isDuplicate: boolean): Promise<ICaseFileEntity>;
  setCaseFileTriage(id: uuid, triage: CaseFileTriage): Promise<ICaseFileEntity>;
  setCaseFileIdentityAuthentication(id: uuid, identityAuthentication: IIdentityAuthentication): Promise<ICaseFileEntity>;
  setCaseFileValidationOfImpact(id: uuid, impactStatusValidation: IImpactStatusValidation): Promise<ICaseFileEntity>;
  setCaseFileAssign(id: uuid, individuals: uuid[], teams: uuid[]): Promise<ICaseFileEntity>;
  createCaseFile(payload: ICreateCaseFileRequest): Promise<ICaseFileEntity>;
}

export interface IActionsMock extends IBaseActionsMock<ICaseFileEntity, ICaseFileMetadata> {
  fetchTagsOptions: jest.Mock<void>;
  fetchInactiveReasons: jest.Mock<IOptionItemData[]>;
  fetchScreeningIds: jest.Mock<IOptionItemData[]>;
  fetchCloseReasons: jest.Mock<IOptionItemData[]>;
  fetchCaseFileActivities: jest.Mock<ICaseFileActivity[]>;
  fetchCaseFileAssignedCounts:jest.Mock<ICaseFileCount>;
  fetchCaseFileDetailedCounts:jest.Mock<ICaseFileDetailedCount>;
  setCaseFileTags: jest.Mock<ICaseFileEntity>;
  setCaseFileStatus: jest.Mock<ICaseFileEntity>;
  setCaseFileLabels: jest.Mock<ICaseFileEntity>;
  setCaseFileIsDuplicate: jest.Mock<ICaseFileEntity>;
  setCaseFileTriage: jest.Mock<ICaseFileEntity>;
  setCaseFileValidationOfImpact: jest.Mock<ICaseFileEntity>;
  setCaseFileAssign: jest.Mock<ICaseFileEntity>;
  createCaseFile: jest.Mock<ICaseFileEntity>;

}

export interface IMutations extends IBaseMutations<ICaseFileEntity, ICaseFileMetadata> {
  setTagsOptionsFetched(payload: boolean) : void;
  setInactiveReasonsFetched(payload: boolean) : void;
  setScreeningIdsFetched(payload: boolean) : void;
  setCloseReasonsFetched(payload: boolean) : void;
 }

export interface IMutationsMock extends IBaseMutationsMock<ICaseFileEntity, ICaseFileMetadata> {
  setTagsOptionsFetched(payload: boolean) : jest.Mock<void>;
  setInactiveReasonsFetched(payload: boolean) : jest.Mock<void>;
  setScreeningIdsFetched(payload: boolean) : jest.Mock<void>;
  setCloseReasonsFetched(payload: boolean) : jest.Mock<void>;
}

export interface IStorageMake {
  getters: IGetters;
  actions: IActions;
  mutations: IMutations;
}

export interface IStorageMakeMock {
  getters: IGettersMock;
  actions: IActionsMock;
  mutations: IMutationsMock;
}

export interface IStorage {
  make(): IStorageMake
}

export interface IStorageMock {
  make(): IStorageMake
}
