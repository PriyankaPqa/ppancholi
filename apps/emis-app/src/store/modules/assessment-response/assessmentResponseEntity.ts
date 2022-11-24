import { ActionContext, ActionTree } from 'vuex';
import { SignalR, ISignalRMock } from '@/ui/plugins/signal-r';
import { IRootState } from '@libs/registration-lib/store';
import { IAssessmentResponseCreateRequest, IAssessmentResponseEntity, IQuestionResponse } from '@libs/entities-lib/assessment-template';
import { AssessmentResponsesService } from '@libs/services-lib/assessment-response/entity';
import { BaseModule } from '../base';
import { IState } from '../base/base.types';
import { IAssessmentResponseEntityState } from './assessmentResponseEntity.types';

export class AssessmentResponseEntityModule extends BaseModule <IAssessmentResponseEntity, { id: uuid }> {
  constructor(readonly service: AssessmentResponsesService, protected signalR: typeof SignalR | ISignalRMock) {
    super(service, signalR);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<IAssessmentResponseEntity>, IRootState>,
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
      context: ActionContext<IAssessmentResponseEntityState, IAssessmentResponseEntityState>,
      payload: IAssessmentResponseCreateRequest,
    ): Promise<IAssessmentResponseEntity> => {
      const result = await this.service.create(payload);
      if (result) {
        context.commit('addNewlyCreatedId', result);
        context.commit('set', result);
      }
      return result;
    },

    update: async (
      context: ActionContext<IAssessmentResponseEntityState, IAssessmentResponseEntityState>,
      payload: IAssessmentResponseEntity,
    ): Promise<IAssessmentResponseEntity> => {
      const result = await this.service.update(payload);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },

    saveAssessmentAnsweredQuestions: async (
      context: ActionContext<IAssessmentResponseEntityState, IAssessmentResponseEntityState>,
      payload: IAssessmentResponseEntity,
    ): Promise<IAssessmentResponseEntity> => {
      const result = await this.service.saveAssessmentAnsweredQuestions(payload);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },

    editAssessmentAnsweredQuestion: async (
context: ActionContext<IAssessmentResponseEntityState, IAssessmentResponseEntityState>,
      payload: { id: string, responses: IQuestionResponse[], assessmentQuestionIdentifier: string, parentIndexPath: string },
): Promise<IAssessmentResponseEntity> => {
      const result = await this.service.editAssessmentAnsweredQuestion(payload.id, payload);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },
  };
}
