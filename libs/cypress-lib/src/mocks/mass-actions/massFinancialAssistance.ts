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
