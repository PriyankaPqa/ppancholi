import { IAddNewPaymentLineFields } from 'cypress/pages/financial-assistance-payment/addNewPaymentLine.page';
import { ICaseNotesData } from '../pages/casefiles/caseNotes.page';

export const fixtureCaseNotes = (retries: number): ICaseNotesData => ({
  subject: `Case Notes - retries${retries}`,
  category: ' Action log ',
  description: 'Case Notes Description En',
});

export const fixturePrepaidCardPaymentLine = (): IAddNewPaymentLineFields => ({
  item: 'Clothing',
  subItem: 'Winter Clothing',
  paymentModality: 'Prepaid Card',
  amount: '80.00',
  relatedNumber: '11001',
});

export const fixtureInvoicePaymentLine = (): IAddNewPaymentLineFields => ({
  item: 'Clothing',
  subItem: 'Winter Clothing',
  paymentModality: 'Invoice',
  amount: '100.00',
  relatedNumber: '22222',
});

export const fixtureGiftCardPaymentLine = (): IAddNewPaymentLineFields => ({
  item: 'Clothing',
  subItem: 'Winter Clothing',
  paymentModality: 'Gift Card',
  amount: '100.00',
  relatedNumber: '33333',
});

export const fixtureVoucherPaymentLine = (): IAddNewPaymentLineFields => ({
  item: 'Clothing',
  subItem: 'Winter Clothing',
  paymentModality: 'Voucher',
  amount: '100.00',
  relatedNumber: '44444',
});

export const fixtureChequePaymentLine = (): IAddNewPaymentLineFields => ({
  item: 'Clothing',
  subItem: 'Winter Clothing',
  paymentModality: 'Cheque',
  amount: '80.00',
});

export const fixtureDirectDepositPaymentLine = (): IAddNewPaymentLineFields => ({
  item: 'Clothing',
  subItem: 'Winter Clothing',
  paymentModality: 'Direct Deposit',
  amount: '80.00',
});
