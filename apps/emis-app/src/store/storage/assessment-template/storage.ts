import { IAssessmentTemplateEntity, IAssessmentTemplateMetadata } from '@libs/entities-lib/assessment-template';
import { IStore, IState } from '../../store.types';
import { IStorage } from './storage.types';
import { Base } from '../base';

export class AssessmentTemplateStorage
  extends Base<IAssessmentTemplateEntity, IAssessmentTemplateMetadata, { id: uuid }> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,
  }

  private actions = {
    ...this.baseActions,

    // eslint-disable-next-line
    create: (payload: IAssessmentTemplateEntity): Promise<IAssessmentTemplateEntity> => this.store.dispatch(`${this.entityModuleName}/create`, payload),

    // eslint-disable-next-line
    update: (payload: IAssessmentTemplateEntity): Promise<IAssessmentTemplateEntity> => this.store.dispatch(`${this.entityModuleName}/update`, payload),
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
