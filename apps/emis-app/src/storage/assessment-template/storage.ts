import { IAssessmentTemplateEntity, IAssessmentTemplateMetadata } from '@libs/entities-lib/assessment-template';
import { IStore, IState } from '../../store/store.types';
import { IStorage } from './storage.types';
import { Base } from '../base';

export class AssessmentTemplateStorage
  extends Base<IAssessmentTemplateEntity, IAssessmentTemplateMetadata, { id: uuid }> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,
  };

  private actions = {
    ...this.baseActions,

    create: (payload: IAssessmentTemplateEntity): Promise<IAssessmentTemplateEntity> => this.store.dispatch(`${this.entityModuleName}/create`, payload),

    update: (payload: IAssessmentTemplateEntity): Promise<IAssessmentTemplateEntity> => this.store.dispatch(`${this.entityModuleName}/update`, payload),

    // eslint-disable-next-line
    updateAssessmentStructure: (payload: IAssessmentTemplateEntity): Promise<IAssessmentTemplateEntity> => this.store.dispatch(`${this.entityModuleName}/updateAssessmentStructure`, payload),
  };

  private mutations = {
    ...this.baseMutations,
  };

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  });
}
