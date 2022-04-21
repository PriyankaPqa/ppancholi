import { IProgramEntity, IProgramMetadata } from '@/entities/program';
import { IStore, IState } from '../../store.types';
import { IStorage } from './storage.types';
import { Base } from '../base';

export class ProgramStorage extends Base<IProgramEntity, IProgramMetadata, { id: uuid; eventId: uuid }> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,
  };

  private actions = {
    ...this.baseActions,

    createProgram: (payload: IProgramEntity): Promise<IProgramEntity> => this.store.dispatch(`${this.entityModuleName}/createProgram`, payload),

    updateProgram: (payload: IProgramEntity): Promise<IProgramEntity> => this.store.dispatch(`${this.entityModuleName}/updateProgram`, payload),
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
