import { ActionContext, ActionTree } from 'vuex';
import { FinancialAssistancePaymentsService } from '@/services/financial-assistance-payments/entity';
import {
  EPaymentCancellationReason, IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentGroup, PaymentStatus,
} from '@/entities/financial-assistance-payment';
import { BaseModule } from '../base';
import { IRootState } from '../../store.types';
import { IState } from '../base/base.types';
import { IFinancialAssistancePaymentEntityState } from './financialAssistancePaymentEntity.types';

export class FinancialAssistancePaymentEntityModule extends BaseModule<IFinancialAssistancePaymentEntity, uuid> {
  constructor(readonly service: FinancialAssistancePaymentsService) {
    super(service);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<IFinancialAssistancePaymentEntity>, IRootState>,
  })

  public state = {
    ...this.baseState,
  }

  public getters = {
    ...this.baseGetters,
  }

  public mutations = {
    ...this.baseMutations,
  }

  public actions = {
    ...this.baseActions,

    addFinancialAssistancePayment: async (context: ActionContext<IFinancialAssistancePaymentEntityState,
      IFinancialAssistancePaymentEntityState>, payload: IFinancialAssistancePaymentEntity)
      : Promise<IFinancialAssistancePaymentEntity> => {
      const result = await this.service.addFinancialAssistancePayment(payload);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },

    editFinancialAssistancePayment: async (context: ActionContext<IFinancialAssistancePaymentEntityState,
      IFinancialAssistancePaymentEntityState>, payload: IFinancialAssistancePaymentEntity)
      : Promise<IFinancialAssistancePaymentEntity> => {
      const result = await this.service.editFinancialAssistancePayment(payload);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },

    updatePaymentStatus: async (context: ActionContext<IFinancialAssistancePaymentEntityState,
      IFinancialAssistancePaymentEntityState>, payload: { paymentGroupId: uuid, entityId: uuid, status: PaymentStatus,
        cancellationReason?: EPaymentCancellationReason })
      : Promise<IFinancialAssistancePaymentEntity> => {
      const result = await this.service.updatePaymentStatus(payload.entityId, payload.paymentGroupId, payload.status, payload.cancellationReason);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },

    submitFinancialAssistancePayment: async (context: ActionContext<IFinancialAssistancePaymentEntityState,
      IFinancialAssistancePaymentEntityState>, payload: uuid)
      : Promise<IFinancialAssistancePaymentEntity> => {
      const result = await this.service.submitFinancialAssistancePayment(payload);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },

    addFinancialAssistancePaymentLine: async (context: ActionContext<IFinancialAssistancePaymentEntityState,
      IFinancialAssistancePaymentEntityState>, payload: { entity: IFinancialAssistancePaymentGroup, financialAssistanceId: uuid })
      : Promise<IFinancialAssistancePaymentEntity> => {
      const result = await this.service.addFinancialAssistancePaymentLine(payload.financialAssistanceId, payload.entity);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },

    editFinancialAssistancePaymentLine: async (context: ActionContext<IFinancialAssistancePaymentEntityState,
      IFinancialAssistancePaymentEntityState>, payload: { entity: IFinancialAssistancePaymentGroup, financialAssistanceId: uuid })
      : Promise<IFinancialAssistancePaymentEntity> => {
      const result = await this.service.editFinancialAssistancePaymentLine(payload.financialAssistanceId, payload.entity);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },

    deleteFinancialAssistancePaymentLine: async (context: ActionContext<IFinancialAssistancePaymentEntityState,
      IFinancialAssistancePaymentEntityState>, payload: { paymentId: uuid, financialAssistanceId: uuid })
      : Promise<IFinancialAssistancePaymentEntity> => {
      const result = await this.service.deleteFinancialAssistancePaymentLine(payload.financialAssistanceId, payload.paymentId);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },
  }
}
