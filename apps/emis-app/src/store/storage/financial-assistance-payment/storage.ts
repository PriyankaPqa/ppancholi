import { IVersionedEntityCombined } from '@libs/entities-lib/value-objects/versioned-entity';
import {
  IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentMetadata, PaymentStatus, EPaymentCancellationReason, IFinancialAssistancePaymentGroup,
} from '@libs/entities-lib/financial-assistance-payment';
import { IStore, IState } from '../../store.types';
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
    updatePaymentStatus: (entityId: uuid, paymentGroupId: uuid, status: PaymentStatus, cancellationReason?: EPaymentCancellationReason):
      Promise<IFinancialAssistancePaymentEntity> => this.store.dispatch(`${this.entityModuleName}/updatePaymentStatus`
      , ({
        entityId, paymentGroupId, status, cancellationReason,
      })),
    submitFinancialAssistancePayment: (entityId: uuid):
      Promise<IFinancialAssistancePaymentEntity> => this.store.dispatch(`${this.entityModuleName}/submitFinancialAssistancePayment`, entityId),
    addFinancialAssistancePaymentLine: (financialAssistanceId: uuid, entity: IFinancialAssistancePaymentGroup):
      Promise<IFinancialAssistancePaymentEntity> => this.store.dispatch(`${this.entityModuleName}/addFinancialAssistancePaymentLine`
      , ({ entity, financialAssistanceId })),
    editFinancialAssistancePaymentLine: (financialAssistanceId: uuid, entity: IFinancialAssistancePaymentGroup):
      Promise<IFinancialAssistancePaymentEntity> => this.store.dispatch(`${this.entityModuleName}/editFinancialAssistancePaymentLine`
      , ({ entity, financialAssistanceId })),
    deleteFinancialAssistancePaymentLine: (financialAssistanceId: uuid, paymentId: uuid):
      Promise<IFinancialAssistancePaymentEntity> => this.store.dispatch(`${this.entityModuleName}/deleteFinancialAssistancePaymentLine`
      , ({ paymentId, financialAssistanceId })),
    fetchHistory: async (financialAssistanceId: uuid, includeMetadata: boolean):
      Promise<IVersionedEntityCombined[]> => this.store.dispatch(`${this.entityModuleName}/fetchHistory`,
      ({ financialAssistanceId, includeMetadata })),

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
