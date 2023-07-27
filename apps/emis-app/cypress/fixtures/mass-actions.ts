import { getCurrentDateString, getRandomNumber } from '@libs/cypress-lib/helpers';
import { IBaseMassActionFields } from '../pages/mass-action/base/baseCreateMassAction';
import { INewMassFinancialAssistanceFields } from '../pages/mass-action/mass-financial-assistance/newMassFinancialAssistance.page';

export const fixtureBaseMassAction = (retries: number) : IBaseMassActionFields => ({
  name: `test mass action - ${getCurrentDateString()} - s${getRandomNumber()} - retry(${retries})`,
  description: `description mass action - retry ${retries}`,
});

export const fixtureNewMassFinancialAssistance = () : INewMassFinancialAssistanceFields => ({
  paymentModality: 'Direct Deposit',
  item: 'Clothing',
  subItem: 'Winter Clothing',
  paymentAmount: '80.00',
});
