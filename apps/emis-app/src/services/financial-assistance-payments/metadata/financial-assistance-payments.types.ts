import { IFinancialAssistancePaymentMetadata } from '@/entities/financial-assistance-payment';
import { IDomainBaseService } from '@libs/core-lib/services/base';

export interface IFinancialAssistancePaymentsMetadataService extends IDomainBaseService<IFinancialAssistancePaymentMetadata, uuid> {}
