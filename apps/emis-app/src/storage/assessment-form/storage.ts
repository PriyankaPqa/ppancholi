import { IAssessmentFormEntity, IAssessmentFormMetadata } from '@libs/entities-lib/assessment-template';
import { IStore, IState } from '../../store/store.types';
import { IStorage } from './storage.types';
import { Base } from '../base';

export class AssessmentFormStorage
  extends Base<IAssessmentFormEntity, IAssessmentFormMetadata, { id: uuid }> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,
  }

  private actions = {
    ...this.baseActions,

    // eslint-disable-next-line
    create: (payload: IAssessmentFormEntity): Promise<IAssessmentFormEntity> => this.store.dispatch(`${this.entityModuleName}/create`, payload),

    // eslint-disable-next-line
    update: (payload: IAssessmentFormEntity): Promise<IAssessmentFormEntity> => this.store.dispatch(`${this.entityModuleName}/update`, payload),
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
