import { IStore, IState } from '@/store';
import { IStorage } from './storage.types';
import { Base } from '../base';
import { IFeatureEntity } from '@/entities/feature';

export class FeatureStorage extends Base<IFeatureEntity, never, uuid> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string) {
    super(pStore, pEntityModuleName, null);
  }

  private getters = {
    ...this.baseGetters,

    feature: (name: string) => this.store.getters[`${this.entityModuleName}/feature`](name),
  };

  private actions = {
    ...this.baseActions,

    enableFeature: (featureId: uuid): Promise<IFeatureEntity> => this.store.dispatch(`${this.entityModuleName}/enableFeature`, featureId),

    disableFeature: (featureId: uuid): Promise<IFeatureEntity> => this.store.dispatch(`${this.entityModuleName}/disableFeature`, featureId),
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
