import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@/services/httpClient';
import { IFinancialAssistancePaymentMetadata } from '@/entities/financial-assistance-payment';
import { IFinancialAssistancePaymentsMetadataService } from './financial-assistance-payments.types';

const API_URL_SUFFIX = 'financial-assistance';
const CONTROLLER = 'financial-assistance-payments';

export class FinancialAssistancePaymentsMetadataService extends DomainBaseService<IFinancialAssistancePaymentMetadata, uuid>
  implements IFinancialAssistancePaymentsMetadataService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }
}
