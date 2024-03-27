import { IAzureCombinedSearchResult, IAzureSearchParams } from '@libs/shared-lib/types';
import { IApprovalTableEntity, IApprovalTableEntityData } from '@libs/entities-lib/approvals/approvals-table';
import { IApprovalGroup } from '@libs/entities-lib/approvals/approvals-group';
import { IEntity } from '@libs/entities-lib/base';
import { IApprovalTablesService, ICreateApprovalTableRequest, IEditApprovalTableRequest } from './approvalTables.types';
import { DomainBaseService } from '../../base';
import { GlobalHandler, IHttpClient } from '../../http-client';

const API_URL_SUFFIX = 'finance'; // Located in finance domain in the BE
const CONTROLLER = 'approval-tables';

export class ApprovalTablesService extends DomainBaseService<IApprovalTableEntityData, uuid> implements IApprovalTablesService {
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
    return this.http.post<IApprovalTableEntityData>(`${this.baseUrl}`, formattedPayload, { globalHandler: GlobalHandler.Partial });
  }

  getApprovalsTableByEventId(eventId: uuid): Promise<IApprovalTableEntityData[]> {
    return this.http.get<IApprovalTableEntityData[]>(`${this.baseApi}/events/${eventId}/approval-tables`);
  }

  getApprovalTableByProgramId(programId: uuid): Promise<IApprovalTableEntityData> {
    return this.http.get<IApprovalTableEntityData>(`${this.baseApi}/programs/${programId}/approval-table`, { globalHandler: GlobalHandler.Partial });
  }

  edit(approvalId: uuid, payload: IApprovalTableEntity): Promise<IApprovalTableEntityData> {
    const formattedPayload = {
      eventId: payload.eventId,
      programId: payload.programId,
      name: payload.name,
      aggregatedByType: payload.aggregatedByType,
      approvalBaseStatus: payload.approvalBaseStatus,
    } as IEditApprovalTableRequest;

    return this.http.patch(`${this.baseUrl}/${approvalId}`, formattedPayload, { globalHandler: GlobalHandler.Partial });
  }

  addGroup(approvalId: uuid, group: IApprovalGroup): Promise<IApprovalTableEntityData> {
    return this.http.post(`${this.baseUrl}/${approvalId}/groups`, group.toDto());
  }

  removeGroup(approvalId: uuid, groupId: uuid): Promise<IApprovalTableEntityData> {
    return this.http.delete(`${this.baseUrl}/${approvalId}/groups/${groupId}`);
  }

  editGroup(approvalId: uuid, group: IApprovalGroup): Promise<IApprovalTableEntityData> {
    return this.http.patch(`${this.baseUrl}/${approvalId}/groups/${group.id}`, group.toDto());
  }

  async search(params: IAzureSearchParams):
    Promise<IAzureCombinedSearchResult<IApprovalTableEntity, IEntity>> {
    return this.http.get('finance/search/approval-tablesV2', { params, isODataSql: true });
  }
}
