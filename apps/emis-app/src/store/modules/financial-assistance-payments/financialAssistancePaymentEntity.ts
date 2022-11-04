import { ActionContext, ActionTree } from 'vuex';
import { IVersionedEntity, IVersionedEntityCombined } from '@libs/entities-lib/value-objects/versioned-entity';
import utils from '@libs/entities-lib/value-objects/versioned-entity/versionedEntityUtils';
import { FinancialAssistancePaymentsService } from '@libs/services-lib/financial-assistance-payments/entity';
import {
  EPaymentCancellationReason, IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentGroup, PaymentStatus,
} from '@libs/entities-lib/financial-assistance-payment';
import { SignalR, ISignalRMock } from '@/ui/plugins/signal-r';
import { BaseModule } from '../base';
import { IRootState } from '../../store.types';
import { IState } from '../base/base.types';
import { IFinancialAssistancePaymentEntityState } from './financialAssistancePaymentEntity.types';

export class FinancialAssistancePaymentEntityModule extends BaseModule<IFinancialAssistancePaymentEntity, uuid> {
  constructor(readonly service: FinancialAssistancePaymentsService, protected signalR: typeof SignalR | ISignalRMock) {
    super(service, signalR);
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
        context.commit('addNewlyCreatedId', result);
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

    submitApprovalRequest: async (context: ActionContext<IFinancialAssistancePaymentEntityState,
      IFinancialAssistancePaymentEntityState>, payload: { paymentId: uuid, submitTo: uuid })
      : Promise<IFinancialAssistancePaymentEntity> => {
      const result = await this.service.submitApprovalRequest(payload.paymentId, payload.submitTo);
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

    fetchHistory: async (context: ActionContext<IFinancialAssistancePaymentEntityState,
      IFinancialAssistancePaymentEntityState>, payload: { financialAssistanceId: uuid, includeMetadata: boolean })
      : Promise<IVersionedEntityCombined[]> => {
      const entityRequest = this.service.getHistory(payload.financialAssistanceId);
      const metadataRequest = payload.includeMetadata ? this.service.getMetadataHistory(payload.financialAssistanceId) : null;

      // Fetch  history from the entity and metadata endpoints for financialAssistancePayment
      const [entityResponse, metadataResponse] = await Promise.all([entityRequest, metadataRequest]);

      // Add the type of change 'financialAssistancePayment' to the financialAssistancePayment history items
      const entityResponseWithType = entityResponse?.map((r) => {
        r.entityType = 'financialAssistancePayment';
        return r;
      });

      // add the previous entity to each history item and order them chronologically
      const mappedEntityResponses: IVersionedEntity[] = utils.mapResponses([entityResponseWithType]);
      const mappedMetadataResponses = utils.mapResponses([metadataResponse || []]);

      // Combine the entities and metadata history items into one object
      const combinedEntities: IVersionedEntityCombined[] = utils.combineEntities(mappedEntityResponses, mappedMetadataResponses);

      return combinedEntities;
    },
  }
}
