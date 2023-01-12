import { ActionContext, ActionTree } from 'vuex';
import { SignalR } from '@/ui/plugins/signal-r';
import { ISignalRMock } from '@libs/shared-lib/signal-r';
import { IRootState } from '@libs/registration-lib/store';
import { IAssessmentTemplateEntity } from '@libs/entities-lib/assessment-template';
import { AssessmentTemplatesService } from '@libs/services-lib/assessment-template/entity';
import { BaseModule } from '../base';
import { IState } from '../base/base.types';
import { IAssessmentTemplateEntityState } from './assessmentTemplateEntity.types';

export class AssessmentTemplateEntityModule extends BaseModule <IAssessmentTemplateEntity, { id: uuid }> {
  constructor(readonly service: AssessmentTemplatesService, protected signalR: typeof SignalR | ISignalRMock) {
    super(service, signalR);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<IAssessmentTemplateEntity>, IRootState>,
  });

  public state = {
    ...this.baseState,
  };

  public getters = {
    ...this.baseGetters,
  };

  public mutations = {
    ...this.baseMutations,
  };

  public actions = {
    ...this.baseActions,

    create: async (
      context: ActionContext<IAssessmentTemplateEntityState, IAssessmentTemplateEntityState>,
      payload: IAssessmentTemplateEntity,
    ): Promise<IAssessmentTemplateEntity> => {
      const result = await this.service.create(payload);
      if (result) {
        context.commit('addNewlyCreatedId', result);
        context.commit('set', result);
      }
      return result;
    },

    update: async (
      context: ActionContext<IAssessmentTemplateEntityState, IAssessmentTemplateEntityState>,
      payload: IAssessmentTemplateEntity,
    ): Promise<IAssessmentTemplateEntity> => {
      const result = await this.service.update(payload);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },

    updateAssessmentStructure: async (
      context: ActionContext<IAssessmentTemplateEntityState, IAssessmentTemplateEntityState>,
      payload: IAssessmentTemplateEntity,
    ): Promise<IAssessmentTemplateEntity> => {
      const result = await this.service.updateAssessmentStructure(payload);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },
  };
}
