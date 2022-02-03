import { IEntityCombined } from '@/entities/base';
import { ICaseFileDocumentEntity, ICaseFileDocumentMetadata } from '@/entities/case-file-document';
import { IOptionItem, IOptionItemData } from '@/entities/optionItem';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<ICaseFileDocumentEntity, ICaseFileDocumentMetadata> {
  categories(filterOutInactive?: boolean, actualValue?: string[] | string): Array<IOptionItem>;
  getByCaseFile(id: uuid): Array<IEntityCombined<ICaseFileDocumentEntity, ICaseFileDocumentMetadata>>;
}

export interface IGettersMock extends IBaseGettersMock<ICaseFileDocumentEntity, ICaseFileDocumentMetadata> {
  categories: jest.Mock<Array<IOptionItem>>;
}

export interface IActions extends IBaseActions<ICaseFileDocumentEntity, ICaseFileDocumentMetadata, {id: uuid, caseFileId: uuid}> {
  fetchCategories(): Promise<IOptionItem[]>;
  updateDocument(payload: ICaseFileDocumentEntity): Promise<ICaseFileDocumentEntity>;
  downloadDocumentAsUrl(item: ICaseFileDocumentEntity, saveDownloadedFile: boolean): Promise<string>;
}

export interface IActionsMock extends IBaseActionsMock<ICaseFileDocumentEntity, ICaseFileDocumentMetadata> {
  fetchCategories: jest.Mock<IOptionItemData[]>;
  updateDocument: jest.Mock<ICaseFileDocumentEntity>;
  downloadDocumentAsUrl: jest.Mock<string>;
}

export interface IMutations extends IBaseMutations<ICaseFileDocumentEntity, ICaseFileDocumentMetadata> {
  setCategoriesFetched(payload: boolean) : void;
 }

export interface IMutationsMock extends IBaseMutationsMock<ICaseFileDocumentEntity, ICaseFileDocumentMetadata> {
  setCategoriesFetched(payload: boolean) : jest.Mock<void>;
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
