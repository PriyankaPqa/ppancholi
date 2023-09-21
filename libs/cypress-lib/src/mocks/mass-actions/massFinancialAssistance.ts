import { getCurrentDateString, getRandomNumber, itemFinancialAssistance, subItemFinancialAssistance } from '@libs/cypress-lib/helpers';
import { IEventEntity } from '@libs/entities-lib/src/event';
import { EPaymentModalities } from '@libs/entities-lib/src/program';
import { IMassActionFinancialAssistanceCreatePayload } from '@libs/services-lib/src/mass-actions/entity';

export const mockCreateMassFinancialAssistanceRequest = (event: IEventEntity, force?: Partial<IMassActionFinancialAssistanceCreatePayload>) => ({
  name: `test mass financial assistance- - ${getCurrentDateString()} - s${getRandomNumber()}`,
  description: 'description mass action',
  eventId: '',
  tableId: '',
  programId: '',
  mainCategoryId: itemFinancialAssistance.clothing,
  subCategoryId: subItemFinancialAssistance.winterClothing,
  paymentModality: EPaymentModalities.Cheque,
  amount: 80.00,
  search: '',
  filter: `Entity/EventId eq '${event.id}' and Entity/Status eq 1`,
  ...force,
});

export const mockCreateMassFinancialAssistanceCustomFileRequest = (eventId: string, fileContents: Blob) => {
  const data = new FormData();

  // Append each property individually to the FormData
  data.append('eventId', eventId);
  data.append('name', `test mass financial assistance - custom file - ${getCurrentDateString()} - s${getRandomNumber()}`);
  data.append('description', 'description mass action custom file');
  data.append('file', fileContents, 'faCustomOptionsFile.xlsx');
  const payload = data;
  return payload;
};

export const mockCreateMassFinancialAssistanceUploadCsvFileRequest = (eventId: string, tableId: string, programId: string, fileContents: string) => {
  const data = new FormData();

  // Append each property individually to the FormData
  data.append('eventId', eventId);
  data.append('tableId', tableId);
  data.append('programId', programId);
  data.append('mainCategoryId', itemFinancialAssistance.clothing);
  data.append('subCategoryId', subItemFinancialAssistance.winterClothing);
  data.append('paymentModality', `${EPaymentModalities.Cheque}`);
  data.append('amount', '80.00');
  data.append('name', `test mass financial assistance- - ${getCurrentDateString()} - s${getRandomNumber()}`);
  data.append('description', 'description mass action custom file');

  // Append the file separately
  const blob = new Blob([fileContents], { type: 'text/csv' });
  data.append('file', blob);
  const payload = data;
  return payload;
};
