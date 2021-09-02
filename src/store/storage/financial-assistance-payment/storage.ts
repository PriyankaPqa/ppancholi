import { IStore, IState } from '@/store';
import {
  IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentGroup, IFinancialAssistancePaymentMetadata,
} from '@/entities/financial-assistance-payment';
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
    editFinancialAssistancePayment: (entity: IFinancialAssistancePaymentEntity):
      Promise<IFinancialAssistancePaymentEntity> => this.store.dispatch(`${this.entityModuleName}/editFinancialAssistancePayment`, entity),
    addFinancialAssistancePaymentLine: (financialAssistanceId: uuid, entity: IFinancialAssistancePaymentGroup):
      Promise<IFinancialAssistancePaymentEntity> => this.store.dispatch(`${this.entityModuleName}/addFinancialAssistancePaymentLine`
      , ({ entity, financialAssistanceId })),
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
