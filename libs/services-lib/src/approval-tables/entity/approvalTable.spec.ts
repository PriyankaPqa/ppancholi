import { mockApprovalTableEntity } from '@libs/entities-lib/approvals/approvals-table';
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
        status: approvalTable.status,
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
});
