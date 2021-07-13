import { ICaseFileReferralEntity, ICaseFileReferralMetadata } from '@/entities/case-file-referral';
import { IOptionItem, IOptionItemData } from '@/entities/optionItem';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<ICaseFileReferralEntity, ICaseFileReferralMetadata> {
  types(filterOutInactive?: boolean, actualValue?: string[] | string): Array<IOptionItem>;
  outcomeStatuses(filterOutInactive?: boolean, actualValue?: string[] | string): Array<IOptionItem>;
}

export interface IGettersMock extends IBaseGettersMock<ICaseFileReferralEntity, ICaseFileReferralMetadata> {
  types: jest.Mock<void>;
  outcomeStatuses: jest.Mock<void>;
}

export interface IActions extends IBaseActions<ICaseFileReferralEntity, ICaseFileReferralMetadata> {
  fetchTypes(): Promise<IOptionItem[]>;
  fetchOutcomeStatuses(): Promise<IOptionItem[]>;
}

export interface IActionsMock extends IBaseActionsMock<ICaseFileReferralEntity, ICaseFileReferralMetadata> {
  fetchTypes: jest.Mock<IOptionItemData[]>;
  fetchOutcomeStatuses: jest.Mock<IOptionItemData[]>;
}

export interface IMutations extends IBaseMutations<ICaseFileReferralEntity, ICaseFileReferralMetadata> {
 }

export interface IMutationsMock extends IBaseMutationsMock<ICaseFileReferralEntity, ICaseFileReferralMetadata> {
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
