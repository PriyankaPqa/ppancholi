import {
  IFinancialAssistancePaymentEntity,
  CreateFinancialAssistancePaymentServiceRequest,
  IFinancialAssistancePaymentGroup,
  PaymentsSummary,
} from '@libs/entities-lib/financial-assistance-payment';
import { EPaymentCancellationReason, IApprovalActionPayload } from '@libs/entities-lib/src/financial-assistance-payment/financial-assistance-payment.types';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
import { IFinancialAssistancePaymentsService, IUpdatePaymentStatusParams } from './financial-assistance-payments.types';

const API_URL_SUFFIX = 'finance';
const CONTROLLER = 'financial-assistance-payments';

export class FinancialAssistancePaymentsService extends DomainBaseService<IFinancialAssistancePaymentEntity, uuid>
  implements IFinancialAssistancePaymentsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async addFinancialAssistancePayment(entity: IFinancialAssistancePaymentEntity): Promise<IFinancialAssistancePaymentEntity> {
    const payload = {
      caseFileId: entity.caseFileId,
      description: entity.description,
      financialAssistanceTableId: entity.financialAssistanceTableId,
      name: entity.name,
      groups: !entity.groups ? null : entity.groups.map((g) => ({ ...g.groupingInformation, lines: g.lines })),
    } as CreateFinancialAssistancePaymentServiceRequest;
    return this.http.post(`${this.baseUrl}`, payload);
  }

  async editFinancialAssistancePayment(entity: IFinancialAssistancePaymentEntity): Promise<IFinancialAssistancePaymentEntity> {
    const payload = {
      description: entity.description,
      financialAssistanceTableId: entity.financialAssistanceTableId,
      name: entity.name,
    };
    return this.http.patch(`${this.baseUrl}/${entity.id}`, payload);
  }

  async updatePaymentStatus({
 entityId, paymentGroupId, status, cancellationReason,
}: IUpdatePaymentStatusParams): Promise<IFinancialAssistancePaymentEntity> {
    return this.http.patch(`${this.baseUrl}/${entityId}/groups/${paymentGroupId}/payment-status`, { paymentStatus: status, cancellationReason });
  }

  async submitFinancialAssistancePayment(entityId: uuid): Promise<IFinancialAssistancePaymentEntity> {
    return this.http.patch(`${this.baseUrl}/${entityId}/submit`);
  }

  async submitApprovalRequest(paymentId: uuid, submitTo: uuid): Promise<IFinancialAssistancePaymentEntity> {
    return this.http.patch(`${this.baseUrl}/${paymentId}/start-approval/${submitTo}`);
  }

  async submitApprovalAction(paymentId: uuid, payload: IApprovalActionPayload): Promise<IFinancialAssistancePaymentEntity> {
    return this.http.patch(`${this.baseUrl}/${paymentId}/action`, payload);
  }

  async addFinancialAssistancePaymentLine(financialAssistanceId: uuid, entity: IFinancialAssistancePaymentGroup):
    Promise<IFinancialAssistancePaymentEntity> {
    const payload = {
      ...entity.groupingInformation,
      ...entity.lines[0],
    };
    return this.http.post(`${this.baseUrl}/${financialAssistanceId}/lines`, payload);
  }

  async editFinancialAssistancePaymentLine(financialAssistanceId: uuid, entity: IFinancialAssistancePaymentGroup):
    Promise<IFinancialAssistancePaymentEntity> {
    const payload = {
      ...entity.groupingInformation,
      ...entity.lines[0],
    };
    return this.http.patch(`${this.baseUrl}/${financialAssistanceId}/lines/${entity.lines[0].id}`, payload);
  }

  async deleteFinancialAssistancePaymentLine(financialAssistanceId: uuid, paymentId: uuid):
    Promise<IFinancialAssistancePaymentEntity> {
    return this.http.delete(`${this.baseUrl}/${financialAssistanceId}/lines/${paymentId}`);
  }

  async cancelFinancialAssistancePaymentLine(financialAssistanceId: uuid, paymentId: uuid, reason: EPaymentCancellationReason):
    Promise<IFinancialAssistancePaymentEntity> {
    return this.http.patch(`${this.baseUrl}/${financialAssistanceId}/cancel-payment-line/${paymentId}`, { cancellationReason: reason });
  }

  async getPaymentSummary(caseFileId: uuid): Promise<PaymentsSummary> {
    return this.http.get(`${this.baseUrl}/payments-summary?caseFileId=${caseFileId}`);
  }

  async getNextApprovalGroupRoles(financialAssistanceId: uuid): Promise<uuid[]> {
    return this.http.get(`${this.baseUrl}/${financialAssistanceId}/next-approval-group-roles`);
  }
}
