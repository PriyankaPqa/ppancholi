import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { createTestingPinia } from '@pinia/testing';
import { defineStore, setActivePinia } from 'pinia';
import { getExtensionComponents } from '@/pinia/approval-table/approval-table-extension';

import { mockApprovalTablesService } from '@libs/services-lib/approval-tables/entity';
import { IApprovalTableEntity, IApprovalTableEntityData, IdParams } from '@libs/entities-lib/approvals/approvals-table';
import { mockApprovalGroup } from '@libs/entities-lib/approvals/approvals-group';

const entityService = mockApprovalTablesService();
const baseComponents = getBaseStoreComponents<IApprovalTableEntityData, IdParams>(entityService);

const getPinia = () => {
  const pinia = createTestingPinia({
    initialState: {
      'test-approval-table': {
      },
    },
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useApprovalTableTestStore = (opts = {}) => {
  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService);

  const useApprovalTableStore = defineStore('test-approval-table', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useApprovalTableStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  return useApprovalTableTestStore(bComponents);
};

describe('>>> Approval Table Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createApprovalTable', () => {
    it('should call createApprovalTable service with proper params', async () => {
      const bComponents = { ...baseComponents, addNewlyCreatedId: jest.fn(), set: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = {} as IApprovalTableEntity;
      const res = {} as IApprovalTableEntityData;
      entityService.create = jest.fn(() => res);
      await store.createApprovalTable(payload);

      expect(entityService.create).toBeCalledWith(payload);
      expect(bComponents.addNewlyCreatedId).toBeCalledWith(res);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });

  describe('editApprovalTable', () => {
    it('should call editApprovalTable service with proper params', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = { id: 'id-1' } as IApprovalTableEntity;
      const res = {} as IApprovalTableEntityData;
      entityService.edit = jest.fn(() => res);
      await store.editApprovalTable(payload);

      expect(entityService.edit).toBeCalledWith('id-1', payload);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });

  describe('addGroup', () => {
    it('should call addGroup service with proper params', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = { approvalId: 'id', group: mockApprovalGroup() };
      const res = {} as IApprovalTableEntityData;
      entityService.addGroup = jest.fn(() => res);
      await store.addGroup(payload);

      expect(entityService.addGroup).toBeCalledWith('id', mockApprovalGroup());
      expect(bComponents.set).toBeCalledWith(res);
    });
  });

  describe('removeGroup', () => {
    it('should call removeGroup service with proper params', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = { approvalId: 'id', groupId: 'group-id' };
      const res = {} as IApprovalTableEntityData;
      entityService.removeGroup = jest.fn(() => res);
      await store.removeGroup(payload);

      expect(entityService.removeGroup).toBeCalledWith('id', 'group-id');
      expect(bComponents.set).toBeCalledWith(res);
    });
  });

  describe('editGroup', () => {
    it('should call editGroup service with proper params', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = { approvalId: 'id', group: mockApprovalGroup() };
      const res = {} as IApprovalTableEntityData;
      entityService.editGroup = jest.fn(() => res);
      await store.editGroup(payload);

      expect(entityService.editGroup).toBeCalledWith('id', mockApprovalGroup());
      expect(bComponents.set).toBeCalledWith(res);
    });
  });
});
