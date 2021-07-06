import {
  CaseFileStatus, ICaseFileEntity, CaseFileTriage, ICaseFileActivity, ICaseFileLabel, ICaseFileMetadata,
} from '@/entities/case-file/case-file.types';
import { IStore, IState } from '@/store';
import { IStorage } from '@/store/storage/case-file/storage.types';
import { IOptionItem } from '@/entities/optionItem';
import { IListOption } from '@/types';

import { Base } from '../base';

export class CaseFileStorage
  extends Base<ICaseFileEntity, ICaseFileMetadata> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,

    tagsOptions: (): Array<IOptionItem> => this.store.getters[`${this.entityModuleName}/tagsOptions`],

    inactiveReasons: (): Array<IOptionItem> => this.store.getters[`${this.entityModuleName}/inactiveReasons`],

    closeReasons: (): Array<IOptionItem> => this.store.getters[`${this.entityModuleName}/closeReasons`],
  }

  private actions = {
    ...this.baseActions,

    fetchTagsOptions: (): Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchTagsOptions`),

    fetchInactiveReasons: (): Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchInactiveReasons`),

    fetchCloseReasons: () : Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchCloseReasons`),

    fetchCaseFileActivities: (id: uuid): Promise<ICaseFileActivity[]> => this.store.dispatch(`${this.entityModuleName}/fetchCaseFileActivities`, id),

    setCaseFileTags: (id: uuid, tags: IListOption[]):
    Promise<ICaseFileEntity> => this.store.dispatch(`${this.entityModuleName}/setCaseFileTags`, { id, tags }),

    setCaseFileStatus: (id: uuid, status: CaseFileStatus, rationale?: string, reason?: IListOption):
    Promise<ICaseFileEntity> => this.store.dispatch(`${this.entityModuleName}/setCaseFileStatus`, {
      id,
      status,
      rationale,
      reason,
    }),

    setCaseFileLabels: (id: uuid, labels: ICaseFileLabel[]):
    Promise<ICaseFileEntity> => this.store.dispatch(`${this.entityModuleName}/setCaseFileLabels`, { id, labels }),

    setCaseFileIsDuplicate: (id: uuid, isDuplicate: boolean):
    Promise<ICaseFileEntity> => this.store.dispatch(`${this.entityModuleName}/setCaseFileIsDuplicate`, { id, isDuplicate }),

    setCaseFileTriage: (id: uuid, triage: CaseFileTriage):
    Promise<ICaseFileEntity> => this.store.dispatch(`${this.entityModuleName}/setCaseFileTriage`, { id, triage }),

    setCaseFileAssign: (id: uuid, individuals: uuid[], teams: uuid[]):
    Promise<ICaseFileEntity> => this.store.dispatch(`${this.entityModuleName}/setCaseFileAssign`, { id, individuals, teams }),

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
