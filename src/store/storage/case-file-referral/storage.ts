import { IStore, IState } from '@/store';
import { ICaseFileReferralEntity, ICaseFileReferralMetadata } from '@/entities/case-file-referral';
import { IOptionItem } from '@/entities/optionItem';
import { IStorage } from './storage.types';
import { Base } from '../base';

export class CaseFileReferralStorage
  extends Base<ICaseFileReferralEntity, ICaseFileReferralMetadata, { id: uuid, caseFileId: uuid }> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,

    // eslint-disable-next-line
    types: (filterOutInactive = true, actualValue?: string[] | string): Array<IOptionItem> => this.store.getters[`${this.entityModuleName}/types`](filterOutInactive, actualValue),

    // eslint-disable-next-line
    outcomeStatuses: (filterOutInactive = true, actualValue?: string[] | string): Array<IOptionItem> => this.store.getters[`${this.entityModuleName}/outcomeStatuses`](filterOutInactive, actualValue),
  }

  private actions = {
    ...this.baseActions,

    fetchTypes: (): Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchTypes`),

    fetchOutcomeStatuses: (): Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchOutcomeStatuses`),

    // eslint-disable-next-line
    createReferral: (payload: ICaseFileReferralEntity): Promise<ICaseFileReferralEntity> => this.store.dispatch(`${this.entityModuleName}/createReferral`, payload),

    // eslint-disable-next-line
    updateReferral: (payload: ICaseFileReferralEntity): Promise<ICaseFileReferralEntity> => this.store.dispatch(`${this.entityModuleName}/updateReferral`, payload),
  }

  private mutations = {
    ...this.baseMutations,
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
