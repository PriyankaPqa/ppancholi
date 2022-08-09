import { IFinancialAssistancePaymentMetadata } from '@libs/entities-lib/financial-assistance-payment';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
import { IFinancialAssistancePaymentsMetadataService } from './financial-assistance-payments.types';

const API_URL_SUFFIX = 'finance';
const CONTROLLER = 'financial-assistance-payments/metadata';

export class FinancialAssistancePaymentsMetadataService extends DomainBaseService<IFinancialAssistancePaymentMetadata, uuid>
  implements IFinancialAssistancePaymentsMetadataService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }
}
