import { IStore, IState } from '@/store';
import { IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentMetadata } from '@/entities/financial-assistance-payment';
import { IStorage } from './storage.types';
import { Base } from '../base';

export class FinancialAssistancePaymentStorage
  extends Base<IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentMetadata, uuid> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,
  }

  private actions = {
    ...this.baseActions,

    addFinancialAssistancePayment: (entity: IFinancialAssistancePaymentEntity):
      Promise<IFinancialAssistancePaymentEntity> => this.store.dispatch(`${this.entityModuleName}/addFinancialAssistancePayment`, entity),
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
