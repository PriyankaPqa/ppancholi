import { ICaseNoteEntity, ICaseNoteMetadata } from '@/entities/case-note';

import { IOptionItem, IOptionItemData } from '@/entities/optionItem';

import { IAzureSearchParams } from '@/types';
import { IAzureCombinedSearchResult } from '@/types/interfaces/IAzureSearchResult';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<ICaseNoteEntity, ICaseNoteMetadata> {
  caseNoteCategories(filterOutInactive?: boolean, actualValue?: string[] | string): Array<IOptionItem>;
}

export interface IGettersMock extends IBaseGettersMock<ICaseNoteEntity, ICaseNoteMetadata> {
  caseNoteCategories: jest.Mock<IOptionItemData[]>;
}

export interface IActions extends IBaseActions<ICaseNoteEntity, ICaseNoteMetadata, uuid> {
  fetchCaseNoteCategories(): Promise<IOptionItem[]>;
  addCaseNote(id: uuid, caseNote: ICaseNoteEntity): Promise<ICaseNoteEntity>;
  pinCaseNote(caseFileId: uuid, caseNoteId: uuid, isPinned: boolean): Promise<ICaseNoteEntity>;
  editCaseNote(caseFileId: uuid, caseNoteId: uuid, caseNote: ICaseNoteEntity): Promise<ICaseNoteEntity>;
  searchCaseNotes(params: IAzureSearchParams, searchEndpoint: string):Promise<IAzureCombinedSearchResult<ICaseNoteEntity, ICaseNoteMetadata>>;
}

export interface IActionsMock extends IBaseActionsMock<ICaseNoteEntity, ICaseNoteMetadata> {
  fetchCaseNoteCategories: jest.Mock<void>;
  addCaseNote: jest.Mock<ICaseNoteEntity>;
  pinCaseNote: jest.Mock<ICaseNoteEntity>;
  editCaseNote: jest.Mock<ICaseNoteEntity>;
  searchCaseNotes: jest.Mock<void>;
}

export interface IMutations extends IBaseMutations<ICaseNoteEntity, ICaseNoteMetadata> {
  setCaseNoteCategoriesFetched(payload: boolean) : void;
 }

export interface IMutationsMock extends IBaseMutationsMock<ICaseNoteEntity, ICaseNoteMetadata> {
  setCaseNoteCategoriesFetched(payload: boolean) : jest.Mock<void>;
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
