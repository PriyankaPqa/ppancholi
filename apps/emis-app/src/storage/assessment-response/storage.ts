import {
  IAssessmentResponseCreateRequest, IAssessmentResponseEntity, IAssessmentResponseMetadata, IQuestionResponse,
} from '@libs/entities-lib/assessment-template';
import { IStore, IState } from '../../store/store.types';
import { IStorage } from './storage.types';
import { Base } from '../base';

export class AssessmentResponseStorage
  extends Base<IAssessmentResponseEntity, IAssessmentResponseMetadata, { id: uuid }> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,
  }

  private actions = {
    ...this.baseActions,

    create: (payload: IAssessmentResponseCreateRequest): Promise<IAssessmentResponseEntity> => this.store.dispatch(`${this.entityModuleName}/create`, payload),

    update: (payload: IAssessmentResponseEntity): Promise<IAssessmentResponseEntity> => this.store.dispatch(`${this.entityModuleName}/update`, payload),

    // eslint-disable-next-line
    saveAssessmentAnsweredQuestions: (payload: IAssessmentResponseEntity): Promise<IAssessmentResponseEntity> => this.store.dispatch(`${this.entityModuleName}/saveAssessmentAnsweredQuestions`, payload),

    // eslint-disable-next-line
    editAssessmentAnsweredQuestion: (payload: { id: string, responses: IQuestionResponse[], assessmentQuestionIdentifier: string, parentIndexPath: string }): Promise<IAssessmentResponseEntity> => this.store.dispatch(`${this.entityModuleName}/editAssessmentAnsweredQuestion`, payload),
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
