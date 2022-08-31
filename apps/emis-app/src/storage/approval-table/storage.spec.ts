import { APPROVALS_TABLE_ENTITIES, APPROVALS_TABLE_METADATA } from '@/constants/vuex-modules';
import { mockStore } from '@/store';
import { mockApprovalTableEntity } from '@libs/entities-lib/approvals/approvals-table';
import { ApprovalStorage } from './storage';

const entityModuleName = APPROVALS_TABLE_ENTITIES;
const metadataModuleName = APPROVALS_TABLE_METADATA;

const store = mockStore({}, { commit: true, dispatch: true });

const storage = new ApprovalStorage(store, entityModuleName, metadataModuleName).make();

describe('>>> Approval Table Storage', () => {
  describe('>> Actions', () => {
    it('should proxy createApprovalTable', () => {
      storage.actions.createApprovalTable(mockApprovalTableEntity());
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/createApprovalTable`, mockApprovalTableEntity());
    });
  });
});
