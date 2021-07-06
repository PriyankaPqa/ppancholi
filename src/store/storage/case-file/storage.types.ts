import { IOptionItem, IOptionItemData } from '@/entities/optionItem';
import {
  ICaseFileActivity, CaseFileStatus, ICaseFileLabel, CaseFileTriage,
  ICaseFileEntity,
  ICaseFileMetadata,
} from '@/entities/case-file/case-file.types';
import { IListOption } from '@/types';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<ICaseFileEntity, ICaseFileMetadata> {
  tagsOptions(): Array<IOptionItem>;
  inactiveReasons(): Array<IOptionItem>;
  closeReasons(): Array<IOptionItem>;
}

export interface IGettersMock extends IBaseGettersMock<ICaseFileEntity, ICaseFileMetadata> {
  tagsOptions: jest.Mock<void>;
  inactiveReasons: jest.Mock<void>;
  closeReasons: jest.Mock<void>;
}

export interface IActions extends IBaseActions<ICaseFileEntity, ICaseFileMetadata> {
  fetchTagsOptions(): Promise<IOptionItem[]>;
  fetchInactiveReasons(): Promise<IOptionItem[]>;
  fetchCloseReasons(): Promise<IOptionItem[]>;
  fetchCaseFileActivities(id: uuid): Promise<ICaseFileActivity[]>;
  setCaseFileTags(id: uuid, tags: IListOption[]): Promise<ICaseFileEntity>;
  setCaseFileStatus(id: uuid, status: CaseFileStatus, rationale?: string, reason?: IListOption): Promise<ICaseFileEntity>;
  setCaseFileLabels(id: uuid, labels: ICaseFileLabel[]): Promise<ICaseFileEntity>;
  setCaseFileIsDuplicate(id: uuid, isDuplicate: boolean): Promise<ICaseFileEntity>;
  setCaseFileTriage(id: uuid, triage: CaseFileTriage): Promise<ICaseFileEntity>;
  setCaseFileAssign(id: uuid, individuals: uuid[], teams: uuid[]): Promise<ICaseFileEntity>;

}

export interface IActionsMock extends IBaseActionsMock<ICaseFileEntity, ICaseFileMetadata> {
  fetchTagsOptions: jest.Mock<void>;
  fetchInactiveReasons: jest.Mock<IOptionItemData[]>;
  fetchCloseReasons: jest.Mock<IOptionItemData[]>;
  fetchCaseFileActivities: jest.Mock<ICaseFileActivity[]>;
  setCaseFileTags: jest.Mock<ICaseFileEntity>;
  setCaseFileStatus: jest.Mock<ICaseFileEntity>;
  setCaseFileLabels: jest.Mock<ICaseFileEntity>;
  setCaseFileIsDuplicate: jest.Mock<ICaseFileEntity>;
  setCaseFileTriage: jest.Mock<ICaseFileEntity>;
  setCaseFileAssign: jest.Mock<ICaseFileEntity>;

}

export interface IMutations extends IBaseMutations<ICaseFileEntity, ICaseFileMetadata> {
 }

export interface IMutationsMock extends IBaseMutationsMock<ICaseFileEntity, ICaseFileMetadata> {
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
