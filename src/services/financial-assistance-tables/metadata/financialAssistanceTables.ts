/* eslint-disable @typescript-eslint/no-explicit-any */
import { IHttpClient } from '@/services/httpClient';

import { DomainBaseService } from '@/services/base';
import { IFinancialAssistanceTableMetadata } from '@/entities/financial-assistance';
import { IFinancialAssistanceTablesMetadataService } from './financialAssistanceTables.types';

const apiUrlSuffix = 'event';
const controller = 'events/metadata';

export class FinancialAssistanceTablesMetadataService extends DomainBaseService<IFinancialAssistanceTableMetadata, uuid>
  implements IFinancialAssistanceTablesMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
