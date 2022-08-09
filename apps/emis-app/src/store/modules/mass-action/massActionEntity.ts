import { ActionContext, ActionTree } from 'vuex';
import { IRootState } from '@/store/store.types';

import { IMassActionEntity, MassActionRunType, MassActionType } from '@libs/entities-lib/mass-action/massActions.types';
import { MassActionService } from '@libs/services-lib/mass-actions/entity/massAction';
import { IMassActionEntityState } from '@/store/modules/mass-action/massActionEntity.types';
import { IMassActionFinancialAssistanceCreatePayload, IMassActionFundingRequestCreatePayload } from '@libs/services-lib/mass-actions/entity';
import { SignalR, ISignalRMock } from '@/ui/plugins/signal-r';
import { BaseModule } from '../base';

import { IState } from '../base/base.types';

export class MassActionEntityModule extends BaseModule <IMassActionEntity, uuid> {
  constructor(readonly service: MassActionService, protected signalR: typeof SignalR | ISignalRMock) {
    super(service, signalR);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<IMassActionEntity>, IRootState>,
  })

  public state = {
    ...this.baseState,
  }

  public getters = {
    ...this.baseGetters,
  };

  public mutations = {
    ...this.baseMutations,
  };

  public actions = {
    ...this.baseActions,

    process: async (
      context: ActionContext<IMassActionEntityState, IMassActionEntityState>,
      { id, runType }: {id: string; runType: MassActionRunType},
    ): Promise<IMassActionEntity> => {
      const data = await this.service.process(id, runType);

      if (data) {
        context.commit('set', data);
        return data;
      }
      return null;
    },

    update: async (
      context: ActionContext<IMassActionEntityState, IMassActionEntityState>,
      { id, payload }: {id: string; payload: { name: string; description: string }},
    ): Promise<IMassActionEntity> => {
      const data = await this.service.update(id, payload);

      if (data) {
        context.commit('set', data);
        return data;
      }
      return null;
    },

    create: async (
      context: ActionContext<IMassActionEntityState, IMassActionEntityState>,
      { massActionType, payload }: {massActionType: MassActionType; payload: unknown},
    ): Promise<IMassActionEntity> => {
      let data = null;

      if (massActionType === MassActionType.FinancialAssistance) {
        const urlSuffix = 'financial-assistance-from-list';
        data = await this.service.create(urlSuffix, payload as IMassActionFinancialAssistanceCreatePayload);
      }

      if (massActionType === MassActionType.GenerateFundingRequest) {
        const urlSuffix = 'generate-funding';
        data = await this.service.create(urlSuffix, payload as IMassActionFundingRequestCreatePayload);
      }

      /* Add future mass action call here */

      if (data) {
        context.commit('addNewlyCreatedId', data);
        context.commit('set', data);
        return data;
      }
      return null;
    },
  };
}
