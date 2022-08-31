import { ActionContext } from 'vuex';
import { httpClient } from '@/services/httpClient';
import { ApprovalTablesService } from '@libs/services-lib/approval-tables/entity';
import { ApprovalTableEntityModule } from '@/store/modules/approval-table/approvalTableEntity';

import { IApprovalTableEntityState } from '@/store/modules/approval-table/approvalTableEntity.types';
import { IApprovalTableEntityData, mockApprovalTableEntity } from '@libs/entities-lib/approvals/approvals-table';
import { mockSignalR } from '@/ui/plugins/signal-r';

const signalR = mockSignalR();
const service = new ApprovalTablesService(httpClient);
const myModule = new ApprovalTableEntityModule(service, signalR);

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as IApprovalTableEntityState,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<IApprovalTableEntityState, IApprovalTableEntityState>;

describe('Approval Table Entity module', () => {
  describe('actions', () => {
    describe('createApprovalTable', () => {
      it('should call create service with proper params', async () => {
        const payload = mockApprovalTableEntity();
        const res = {} as IApprovalTableEntityData;
        myModule.service.create = jest.fn(() => Promise.resolve(res));
        await myModule.actions.createApprovalTable(actionContext, payload);

        expect(myModule.service.create).toBeCalledWith(payload);
        expect(actionContext.commit).toBeCalledWith('addNewlyCreatedId', res);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });
  });
});
