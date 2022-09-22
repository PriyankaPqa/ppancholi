import { ISignalRMock, SignalR } from '@/ui/plugins/signal-r';
import { ActionContext, ActionTree } from 'vuex';
import { IApprovalTableEntity, IApprovalTableEntityData } from '@libs/entities-lib/approvals/approvals-table';
import { ApprovalTablesService } from '@libs/services-lib/approval-tables/entity';
import { IApprovalTableEntityState } from '@/store/modules/approval-table/approvalTableEntity.types';
import { IApprovalGroup } from '@libs/entities-lib/approvals/approvals-group';
import { BaseModule, IState } from '../base';
import { IRootState } from '../../store.types';

export class ApprovalTableEntityModule extends BaseModule <IApprovalTableEntityData, uuid> {
  constructor(readonly service: ApprovalTablesService, protected signalR: typeof SignalR | ISignalRMock) {
    super(service, signalR);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<IApprovalTableEntityData>, IRootState>,
  })

  public state = {
    ...this.baseState,
  }

  public getters = {
    ...this.baseGetters,
  }

  public mutations = {
    ...this.baseMutations,
  }

  public actions = {
    ...this.baseActions,

    createApprovalTable: async (
      context: ActionContext<IApprovalTableEntityState, IApprovalTableEntityState>,
      approvalTableEntity: IApprovalTableEntity,
    ): Promise<IApprovalTableEntityData> => {
      const res = await this.service.create(approvalTableEntity);
      if (res) {
        context.commit('addNewlyCreatedId', res);
        context.commit('set', res);
      }
      return res;
    },

    editApprovalTable: async (
      context: ActionContext<IApprovalTableEntityState, IApprovalTableEntityState>,
      approvalTableEntity: IApprovalTableEntity,
    ): Promise<IApprovalTableEntityData> => {
      const res = await this.service.edit(approvalTableEntity.id, approvalTableEntity);
      if (res) {
        context.commit('set', res);
      }
      return res;
    },

    addGroup: async (
      context: ActionContext<IApprovalTableEntityState, IApprovalTableEntityState>,
      { approvalId, group }: { approvalId: uuid, group: IApprovalGroup },
    ): Promise<IApprovalTableEntityData> => {
      const res = await this.service.addGroup(approvalId, group);
      if (res) {
        context.commit('set', res);
      }
      return res;
    },

    removeGroup: async (
      context: ActionContext<IApprovalTableEntityState, IApprovalTableEntityState>,
      { approvalId, groupId }: { approvalId: uuid, groupId: uuid },
    ): Promise<IApprovalTableEntityData> => {
      const res = await this.service.removeGroup(approvalId, groupId);
      if (res) {
        context.commit('set', res);
      }
      return res;
    },

    editGroup: async (
      context: ActionContext<IApprovalTableEntityState, IApprovalTableEntityState>,
      { approvalId, group }: { approvalId: uuid, group: IApprovalGroup },
    ): Promise<IApprovalTableEntityData> => {
      const res = await this.service.editGroup(approvalId, group);
      if (res) {
        context.commit('set', res);
      }
      return res;
    },
  }
}
