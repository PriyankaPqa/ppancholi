import { IApprovalTableEntity, IApprovalTableEntityData, IApprovalTableMetadata } from '@libs/entities-lib/approvals/approvals-table/approvalTable.types';
import { IStore, IState } from '../../store/store.types';
import { Base } from '../base';
import { IStorage } from './storage.types';

export class ApprovalStorage
  extends Base<IApprovalTableEntity, IApprovalTableMetadata, uuid> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,
  }

  private actions = {
    ...this.baseActions,
    createApprovalTable: (payload: IApprovalTableEntity):
      Promise<IApprovalTableEntityData> => this.store.dispatch(`${this.entityModuleName}/createApprovalTable`, payload),
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
