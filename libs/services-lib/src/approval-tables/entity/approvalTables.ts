import { IApprovalTableEntity, IApprovalTableEntityData } from '@libs/entities-lib/approvals/approvals-table';
import { IApprovalTablesService, ICreateApprovalTableRequest } from './approvalTables.types';
import { DomainBaseService } from '../../base';
import { IHttpClient } from '../../http-client';

const API_URL_SUFFIX = 'finance'; // Located in finance domain in the BE
const CONTROLLER = 'approval-tables';

export class ApprovalTablesService extends DomainBaseService<IApprovalTableEntity, uuid> implements IApprovalTablesService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  create(payload: IApprovalTableEntity): Promise<IApprovalTableEntityData> {
    const formattedPayload = {
      eventId: payload.eventId,
      programId: payload.programId,
      name: payload.name,
      aggregatedByType: payload.aggregatedByType,
      groups: payload.groups.map((g) => g.toDto()),
      approvalBaseStatus: payload.approvalBaseStatus,
    } as ICreateApprovalTableRequest;
    return this.http.post<IApprovalTableEntityData>(`${this.baseUrl}`, formattedPayload, { globalHandler: false });
  }

  getApprovalsTableByEventId(eventId: uuid) {
    return this.http.get<IApprovalTableEntityData[]>(`${this.baseApi}/events/${eventId}/approval-tables`);
  }
}
