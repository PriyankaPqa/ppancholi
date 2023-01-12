import { ActionContext } from 'vuex';
import { httpClient } from '@/services/httpClient';
import { ApprovalTablesService } from '@libs/services-lib/approval-tables/entity';
import { ApprovalTableEntityModule } from '@/store/modules/approval-table/approvalTableEntity';

import { IApprovalTableEntityState } from '@/store/modules/approval-table/approvalTableEntity.types';
import { IApprovalTableEntityData, mockApprovalTableEntity } from '@libs/entities-lib/approvals/approvals-table';
import { mockSignalR } from '@libs/shared-lib/signal-r';
import { mockApprovalGroup } from '@libs/entities-lib/approvals/approvals-group';

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

    describe('editApprovalTable', () => {
      it('should call edit service with proper params', async () => {
        const payload = mockApprovalTableEntity();
        const res = {} as IApprovalTableEntityData;
        myModule.service.edit = jest.fn(() => Promise.resolve(res));
        await myModule.actions.editApprovalTable(actionContext, payload);

        expect(myModule.service.edit).toBeCalledWith(payload.id, payload);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('addGroup', () => {
      it('should call addGroup service with proper params', async () => {
        const group = mockApprovalGroup();
        const approvalId = '1';
        const res = {} as IApprovalTableEntityData;
        myModule.service.addGroup = jest.fn(() => Promise.resolve(res));
        await myModule.actions.addGroup(actionContext, { approvalId, group });

        expect(myModule.service.addGroup).toBeCalledWith(approvalId, group);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('removeGroup', () => {
      it('should call removeGroup service with proper params', async () => {
        const groupId = '1';
        const approvalId = '1';
        const res = {} as IApprovalTableEntityData;
        myModule.service.removeGroup = jest.fn(() => Promise.resolve(res));
        await myModule.actions.removeGroup(actionContext, { approvalId, groupId });

        expect(myModule.service.removeGroup).toBeCalledWith(approvalId, groupId);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('editGroup', () => {
      it('should call editGroup service with proper params', async () => {
        const group = mockApprovalGroup();
        const approvalId = '1';
        const res = {} as IApprovalTableEntityData;
        myModule.service.editGroup = jest.fn(() => Promise.resolve(res));
        await myModule.actions.editGroup(actionContext, { approvalId, group });

        expect(myModule.service.editGroup).toBeCalledWith(approvalId, group);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });
  });
});
