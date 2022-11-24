import { IApprovalTableEntity, IApprovalTableEntityData, IApprovalTableMetadata } from '@libs/entities-lib/approvals/approvals-table/approvalTable.types';
import { IApprovalGroup } from '@libs/entities-lib/approvals/approvals-group';
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
  };

  private actions = {
    ...this.baseActions,
    createApprovalTable: (payload: IApprovalTableEntity):
      Promise<IApprovalTableEntityData> => this.store.dispatch(`${this.entityModuleName}/createApprovalTable`, payload),
    editApprovalTable: (payload: IApprovalTableEntity):
      Promise<IApprovalTableEntityData> => this.store.dispatch(`${this.entityModuleName}/editApprovalTable`, payload),
    addGroup: (approvalId: uuid, group: IApprovalGroup):
      Promise<IApprovalTableEntityData> => this.store.dispatch(`${this.entityModuleName}/addGroup`, { approvalId, group }),
    editGroup: (approvalId: uuid, group: IApprovalGroup):
      Promise<IApprovalTableEntityData> => this.store.dispatch(`${this.entityModuleName}/editGroup`, { approvalId, group }),
    removeGroup: (approvalId: uuid, groupId: uuid):
      Promise<IApprovalTableEntityData> => this.store.dispatch(`${this.entityModuleName}/removeGroup`, { approvalId, groupId }),
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
