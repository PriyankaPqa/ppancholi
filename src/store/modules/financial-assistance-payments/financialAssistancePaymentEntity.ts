import { ActionContext, ActionTree } from 'vuex';
import { FinancialAssistancePaymentsService } from '@/services/financial-assistance-payments/entity';
import { IFinancialAssistancePaymentEntity } from '@/entities/financial-assistance-payment';
import { BaseModule } from '../base';
import { IRootState } from '../../store.types';
import { IState } from '../base/base.types';
import { IFinancialAssistancePaymentEntityState } from './financialAssistancePaymentEntity.types';

export class FinancialAssistancePaymentEntityModule extends BaseModule <IFinancialAssistancePaymentEntity, uuid> {
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

    addFinancialAssistancePayment: async (context:ActionContext<IFinancialAssistancePaymentEntityState,
      IFinancialAssistancePaymentEntityState>, payload: IFinancialAssistancePaymentEntity)
    : Promise<IFinancialAssistancePaymentEntity> => {
      const result = await this.service.addFinancialAssistancePayment(payload);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },
  }
}
