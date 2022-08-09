/* eslint-disable @typescript-eslint/no-explicit-any */
import { IFinancialAssistanceTableMetadata } from '@libs/entities-lib/financial-assistance';
import { IHttpClient } from '../../http-client';

import { DomainBaseService } from '../../base';
import { IFinancialAssistanceTablesMetadataService } from './financialAssistanceTables.types';

const apiUrlSuffix = 'finance';
const controller = 'financial-assistance-tables/metadata';

export class FinancialAssistanceTablesMetadataService extends DomainBaseService<IFinancialAssistanceTableMetadata, uuid>
  implements IFinancialAssistanceTablesMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
