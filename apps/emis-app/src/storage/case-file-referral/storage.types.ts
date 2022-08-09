import { ICaseFileReferralEntity, ICaseFileReferralMetadata } from '@libs/entities-lib/case-file-referral';
import { IOptionItem, IOptionItemData } from '@libs/entities-lib/optionItem';
import { IEntityCombined } from '@libs/entities-lib/base';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<ICaseFileReferralEntity, ICaseFileReferralMetadata> {
  types(filterOutInactive?: boolean, actualValue?: string[] | string): Array<IOptionItem>;
  outcomeStatuses(filterOutInactive?: boolean, actualValue?: string[] | string): Array<IOptionItem>;
  getByCaseFile(id: uuid): Array<IEntityCombined<ICaseFileReferralEntity, ICaseFileReferralMetadata>>;
}

export interface IGettersMock extends IBaseGettersMock<ICaseFileReferralEntity, ICaseFileReferralMetadata> {
  types: jest.Mock<void>;
  outcomeStatuses: jest.Mock<void>;
}

export interface IActions extends IBaseActions<ICaseFileReferralEntity, ICaseFileReferralMetadata, {id: uuid, caseFileId: uuid}> {
  fetchTypes(): Promise<IOptionItem[]>;
  fetchOutcomeStatuses(): Promise<IOptionItem[]>;
  createReferral(payload: ICaseFileReferralEntity): Promise<ICaseFileReferralEntity>;
  updateReferral(payload: ICaseFileReferralEntity): Promise<ICaseFileReferralEntity>;
}

export interface IActionsMock extends IBaseActionsMock<ICaseFileReferralEntity, ICaseFileReferralMetadata> {
  fetchTypes: jest.Mock<IOptionItemData[]>;
  fetchOutcomeStatuses: jest.Mock<IOptionItemData[]>;
  createReferral: jest.Mock<ICaseFileReferralEntity>;
  updateReferral: jest.Mock<ICaseFileReferralEntity>;
}

export interface IMutations extends IBaseMutations<ICaseFileReferralEntity, ICaseFileReferralMetadata> {
  setTypesFetched(payload: boolean) : void;
  setOutcomeStatusesFetched(payload: boolean) : void;
 }

export interface IMutationsMock extends IBaseMutationsMock<ICaseFileReferralEntity, ICaseFileReferralMetadata> {
  setTypesFetched(payload: boolean) : jest.Mock<void>;
  setOutcomeStatusesFetched(payload: boolean) : jest.Mock<void>;
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
