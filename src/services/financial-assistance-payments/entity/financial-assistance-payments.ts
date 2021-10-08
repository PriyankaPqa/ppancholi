import { IHttpClient } from '@/services/httpClient';
import { DomainBaseService } from '@/services/base';
import {
  IFinancialAssistancePaymentEntity,
  CreateFinancialAssistancePaymentServiceRequest,
  IFinancialAssistancePaymentGroup,
  PaymentStatus,
} from '@/entities/financial-assistance-payment';
import { IFinancialAssistancePaymentsService } from './financial-assistance-payments.types';

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

  async updatePaymentStatus(entityId: uuid, paymentGroupId: uuid, status: PaymentStatus): Promise<IFinancialAssistancePaymentEntity> {
    return this.http.patch(`${this.baseUrl}/${entityId}/groups/${paymentGroupId}/payment-status`, { paymentStatus: status });
  }

  async submitFinancialAssistancePayment(entityId: uuid): Promise<IFinancialAssistancePaymentEntity> {
    return this.http.patch(`${this.baseUrl}/${entityId}/submit`);
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
}
