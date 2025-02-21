import { getCurrentDateString, getRandomNumber, ItemFinancialAssistance, SubItemFinancialAssistance } from '@libs/cypress-lib/helpers';
import { IEventEntity } from '@libs/entities-lib/event';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { IMassActionFinancialAssistanceCreatePayload } from '@libs/services-lib/mass-actions/entity';

export const mockCreateMassFinancialAssistanceRequest = (event: IEventEntity, force?: Partial<IMassActionFinancialAssistanceCreatePayload>) => ({
  name: `test mass financial assistance- - ${getCurrentDateString()} - s${getRandomNumber()}`,
  description: 'description mass action',
  eventId: '',
  tableId: '',
  programId: '',
  mainCategoryId: ItemFinancialAssistance.Clothing,
  subCategoryId: SubItemFinancialAssistance.WinterClothing,
  paymentModality: EPaymentModalities.Cheque,
  amount: 80.00,
  search: '',
  filter: `?$filter=Entity/EventId eq ${event.id} and Entity/Status eq 'Active'`,
  ...force,
});

export interface MockCreateMassActionXlsxFileRequestParams {
  fileContents: Blob,
  fileName: string,
  eventId?: string,
  massActionType?:number,
}

export const mockCreateMassActionXlsxFileRequest = (params: MockCreateMassActionXlsxFileRequestParams) => {
  const data = new FormData();

  // Append each property individually to the FormData
  if (params.eventId) {
    data.append('eventId', params.eventId);
  }
  if (params.massActionType) {
    data.append('massActionType', params.massActionType.toString());
  }
  data.append('name', `test mass financial assistance - ${getCurrentDateString()} - s${getRandomNumber()}`);
  data.append('description', 'description mass action');
  data.append('file', params.fileContents, `${params.fileName}.xlsx`);
  const payload = data;
  return payload;
};

export interface MockCreateMassActionFaUploadCsvFileRequestParams {
  eventId: string,
  tableId: string,
  programId: string,
  fileContents: string
}

export const mockCreateMassFinancialAssistanceUploadCsvFileRequest = (params: MockCreateMassActionFaUploadCsvFileRequestParams) => {
  const data = new FormData();

  // Append each property individually to the FormData
  data.append('eventId', params.eventId);
  data.append('tableId', params.tableId);
  data.append('programId', params.programId);
  data.append('mainCategoryId', ItemFinancialAssistance.Clothing);
  data.append('subCategoryId', SubItemFinancialAssistance.WinterClothing);
  data.append('paymentModality', `${EPaymentModalities.Cheque}`);
  data.append('amount', '80.00');
  data.append('name', `test mass financial assistance- - ${getCurrentDateString()} - s${getRandomNumber()}`);
  data.append('description', 'description mass action custom file');

  // Append the file separately
  const blob = new Blob([params.fileContents], { type: 'text/csv' });
  data.append('file', blob);
  const payload = data;
  return payload;
};

export const mockCreateMassActionDataCorrectionFileRequest = (massActionType: number, fileContents: string, correctionType: string) => {
  const data = new FormData();

  data.append('name', `Test Mass Action - ${correctionType} - ${getCurrentDateString()} - s${getRandomNumber()}`);
  data.append('description', 'description mass action');
  data.append('massActionType', massActionType.toString());

  const blob = new Blob([fileContents], { type: 'text/csv' });
  data.append('file', blob);
  const payload = data;
  return payload;
};
