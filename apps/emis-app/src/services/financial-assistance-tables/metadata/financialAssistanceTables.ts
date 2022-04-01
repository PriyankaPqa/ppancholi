/* eslint-disable @typescript-eslint/no-explicit-any */
import { IHttpClient } from '@libs/core-lib/services/http-client';

import { DomainBaseService } from '@/services/base';
import { IFinancialAssistanceTableMetadata } from '@/entities/financial-assistance';
import { IFinancialAssistanceTablesMetadataService } from './financialAssistanceTables.types';

const apiUrlSuffix = 'finance';
const controller = 'financial-assistance-tables/metadata';

export class FinancialAssistanceTablesMetadataService extends DomainBaseService<IFinancialAssistanceTableMetadata, uuid>
  implements IFinancialAssistanceTablesMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
