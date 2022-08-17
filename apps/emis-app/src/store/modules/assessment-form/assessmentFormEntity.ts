import { ActionContext, ActionTree } from 'vuex';
import { SignalR, ISignalRMock } from '@/ui/plugins/signal-r';
import { IRootState } from '@libs/registration-lib/store';
import { IAssessmentFormEntity } from '@libs/entities-lib/assessment-template';
import { AssessmentFormsService } from '@libs/services-lib/assessment-form/entity';
import { BaseModule } from '../base';
import { IState } from '../base/base.types';
import { IAssessmentFormEntityState } from './assessmentFormEntity.types';

export class AssessmentFormEntityModule extends BaseModule <IAssessmentFormEntity, { id: uuid }> {
  constructor(readonly service: AssessmentFormsService, protected signalR: typeof SignalR | ISignalRMock) {
    super(service, signalR);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<IAssessmentFormEntity>, IRootState>,
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

    create: async (context: ActionContext<IAssessmentFormEntityState, IAssessmentFormEntityState>,
      payload: IAssessmentFormEntity): Promise<IAssessmentFormEntity> => {
      const result = await this.service.create(payload);
      if (result) {
        context.commit('addNewlyCreatedId', result);
        context.commit('set', result);
      }
      return result;
    },

    update: async (context: ActionContext<IAssessmentFormEntityState, IAssessmentFormEntityState>,
      payload: IAssessmentFormEntity): Promise<IAssessmentFormEntity> => {
      const result = await this.service.update(payload);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },
  }
}
