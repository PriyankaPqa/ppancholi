import { mockApprovalTableEntity } from '@libs/entities-lib/approvals/approvals-table';
import { mockApprovalGroup } from '@libs/entities-lib/approvals/approvals-group';
import { IEditApprovalTableRequest } from '@/approval-tables/entity/approvalTables.types';
import { ApprovalTablesService } from './approvalTables';
import { IHttpMock, mockHttp } from '../../http-client';

describe('>>> Approval Tables Service', () => {
  let http: IHttpMock;
  let service: ApprovalTablesService;

  beforeEach(() => {
    jest.clearAllMocks();
    http = mockHttp();
    service = new ApprovalTablesService(http as never);
  });

  describe('create', () => {
    it('is linked to the correct URL and params', async () => {
      const approvalTable = mockApprovalTableEntity();
      await service.create(approvalTable);
      expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}`, {
        eventId: approvalTable.eventId,
        programId: approvalTable.programId,
        name: approvalTable.name,
        aggregatedByType: approvalTable.aggregatedByType,
        groups: approvalTable.groups.map((g) => g.toDto()),
        approvalBaseStatus: approvalTable.approvalBaseStatus,
      }, { globalHandler: false });
    });
  });

  describe('getApprovalsTableByEventId', () => {
    it('is linked to the correct URL and params', async () => {
      const eventId = '1';
      await service.getApprovalsTableByEventId('1');
      expect(http.get).toHaveBeenCalledWith(`${service.baseApi}/events/${eventId}/approval-tables`);
    });
  });

  describe('getApprovalsTableByProgramId', () => {
    it('is linked to the correct URL and params', async () => {
      const programId = '1';
      await service.getApprovalTableByProgramId('1');
      expect(http.get).toHaveBeenCalledWith(`${service.baseApi}/programs/${programId}/approval-table`, { globalHandler: false });
    });
  });

  describe('edit', () => {
    it('is linked to the correct URL and params', async () => {
      const payload = mockApprovalTableEntity();
      const formattedPayload = {
        eventId: payload.eventId,
        programId: payload.programId,
        name: payload.name,
        aggregatedByType: payload.aggregatedByType,
        approvalBaseStatus: payload.approvalBaseStatus,
      } as IEditApprovalTableRequest;
      const approvalId = '1';
      await service.edit(approvalId, payload);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${approvalId}`, formattedPayload, { globalHandler: false });
    });
  });

  describe('addGroup', () => {
    it('is linked to the correct URL and params', async () => {
      const payload = mockApprovalGroup();
      const approvalId = '1';
      await service.addGroup(approvalId, payload);
      expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/${approvalId}/groups`, payload.toDto());
    });
  });

  describe('removeGroup', () => {
    it('is linked to the correct URL and params', async () => {
      const approvalId = '1';
      const groupId = '1';
      await service.removeGroup(approvalId, groupId);
      expect(http.delete).toHaveBeenCalledWith(`${service.baseUrl}/${approvalId}/groups/${groupId}`);
    });
  });

  describe('editGroup', () => {
    it('is linked to the correct URL and params', async () => {
      const approvalId = '1';
      const payload = mockApprovalGroup();
      await service.editGroup(approvalId, payload);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${approvalId}/groups/${payload.id}`, payload.toDto());
    });
  });
});
