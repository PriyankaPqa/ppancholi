import { IStore, IState } from '@/store/store.types';
import {
  IMassActionEntity, IMassActionMetadata, MassActionRunType, MassActionType,
} from '@libs/entities-lib/mass-action';
import { Base } from '../base';
import { IStorage } from './storage.types';

export class MassActionStorage extends Base<IMassActionEntity, IMassActionMetadata, uuid> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,
  }

  private actions = {
    ...this.baseActions,
    process: (id: string, runType: MassActionRunType) => this.store.dispatch(`${this.entityModuleName}/process`, { id, runType }),
    update: (id: string, payload: { name: string; description: string }) => this.store.dispatch(`${this.entityModuleName}/update`, { id, payload }),
    create: (massActionType: MassActionType, payload: unknown) => this.store.dispatch(`${this.entityModuleName}/create`, { massActionType, payload }),
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
