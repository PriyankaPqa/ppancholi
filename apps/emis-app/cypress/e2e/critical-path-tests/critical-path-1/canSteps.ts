import { IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { ICreateHouseholdRequest } from '@libs/entities-lib/household-create';
import { FinancialAssistanceDetailsPage } from 'cypress/pages/financial-assistance-payment/financialAssistanceDetails.page';
import { AddFinancialAssistancePage } from '../../../pages/financial-assistance-payment/addFinancialAssistance.page';
import { IAddNewPaymentLineFields } from '../../../pages/financial-assistance-payment/addNewPaymentLine.page';

export interface PaymentLineCanStepsParams {
  faTable: IFinancialAssistanceTableEntity,
  retries: number,
  paymentLineData: IAddNewPaymentLineFields,
  groupTitle: string,
  household: ICreateHouseholdRequest,
}

export interface paymentGroupStatusUpdateParam {
  paymentStatus: string,
  paymentModality: string,
}

const addPaymentLineCanSteps = ({ faTable, retries, paymentLineData, groupTitle }: Partial<PaymentLineCanStepsParams>) => {
  const addFinancialAssistancePage = new AddFinancialAssistancePage();
  addFinancialAssistancePage.selectTable(faTable.name.translation.en);
  addFinancialAssistancePage.fillDescription(`Financial Description ${groupTitle} Payment Line - retries - ${retries}`);

  const addNewPaymentLinePage = addFinancialAssistancePage.addPaymentLine();
  addNewPaymentLinePage.fill(paymentLineData);
  if (groupTitle === 'Gift card' || groupTitle === 'Invoice' || groupTitle === 'Voucher') {
    addNewPaymentLinePage.getRelatedNumberField().should('be.visible');
    addNewPaymentLinePage.fillRelatedNumber(paymentLineData.relatedNumber);
    addNewPaymentLinePage.fillAmount(paymentLineData.amount);
  }
  addNewPaymentLinePage.addNewPaymentLine();
};

const addPaymentLineChequeCanSteps = ({ faTable, retries, paymentLineData, household }: Partial<PaymentLineCanStepsParams>) => {
  const addFinancialAssistancePage = new AddFinancialAssistancePage();
  addFinancialAssistancePage.getAddPaymentLineButton().should('be.disabled');
  addFinancialAssistancePage.getCreateButton().should('not.be.enabled');
  addFinancialAssistancePage.selectTable(faTable.name.translation.en);
  addFinancialAssistancePage.fillDescription(`Financial Description Cheque Payment Line - retries - ${retries}`);
  addFinancialAssistancePage.getAddPaymentLineButton().click();

  const addNewPaymentLinePage = addFinancialAssistancePage.addPaymentLine();
  addNewPaymentLinePage.fill(paymentLineData);
  addNewPaymentLinePage.getAmountValue().should('eq', paymentLineData.amount);
  // eslint-disable-next-line
  addNewPaymentLinePage.getPayeeNameValue().should('eq', `${household.primaryBeneficiary.identitySet.firstName} ${household.primaryBeneficiary.identitySet.lastName}`);
  addNewPaymentLinePage.getPayeeTypeElement().contains('Individual').should('be.visible');
  addNewPaymentLinePage.getStreetValue().should('eq', household.homeAddress.streetAddress);
  addNewPaymentLinePage.getUnitSuiteValue().should('eq', household.homeAddress.unitSuite);
  addNewPaymentLinePage.getCityValue().should('eq', household.homeAddress.city);
  addNewPaymentLinePage.getProvinceElement().contains('Alberta').should('be.visible');
  addNewPaymentLinePage.getPostalCodeValue().should('eq', household.homeAddress.postalCode);
  addNewPaymentLinePage.addNewPaymentLine();
};

const financialAssistanceCanSteps = ({ paymentLineData, groupTitle }: Partial<PaymentLineCanStepsParams>) => {
  const addFinancialAssistancePage = new AddFinancialAssistancePage();
  addFinancialAssistancePage.getSectionTitleElement().contains('Payment line(s)').should('be.visible');
  addFinancialAssistancePage.getPaymentLineGroupTitle().should('string', groupTitle);
  addFinancialAssistancePage.getItemEditButton().should('be.visible');
  addFinancialAssistancePage.getItemDeleteButton().should('be.visible');
  addFinancialAssistancePage.getAddPaymentLineButton().should('be.enabled');
  addFinancialAssistancePage.getSubmitAssistanceButton().should('not.be.enabled');
  addFinancialAssistancePage.getCreateButton().click();

  cy.contains('The financial assistance has been successfully created').should('be.visible');
  addFinancialAssistancePage.getPaymentStatus().should('eq', 'New');
  addFinancialAssistancePage.getPaymentLineGroupStatus().should('eq', 'Payment must be submitted');
  addFinancialAssistancePage.getPaymentEditButton().should('be.visible');
  addFinancialAssistancePage.getPaymentDeleteButton().should('be.visible');
  addFinancialAssistancePage.getPaymentLineItemTitle().should('eq', `${paymentLineData.item} > ${paymentLineData.subItem}`);
  if (groupTitle === 'Gift card' || groupTitle === 'Invoice' || groupTitle === 'Voucher') {
    addFinancialAssistancePage.getRelatedNumber().should('string', paymentLineData.relatedNumber);
  }
  addFinancialAssistancePage.getAddPaymentLineButton().should('be.enabled');
  addFinancialAssistancePage.getSubmitAssistanceButton().should('be.enabled');
  addFinancialAssistancePage.getBackToFinancialAssistanceButton().should('be.enabled');
};

export const paymentLineGeneralCanSteps = ({ faTable, retries, paymentLineData, groupTitle }: Partial<PaymentLineCanStepsParams>) => {
  cy.interceptAndRetryUntilNoMoreStatus('**/case-file/case-files/metadata/*', 404);
  addPaymentLineCanSteps({ faTable, retries, paymentLineData, groupTitle });
  financialAssistanceCanSteps({ paymentLineData, groupTitle });
};

export const paymentLineChequeCanSteps = ({ faTable, retries, paymentLineData, groupTitle, household }: Partial<PaymentLineCanStepsParams>) => {
  cy.interceptAndRetryUntilNoMoreStatus('**/case-file/case-files/metadata/*', 404);
  addPaymentLineChequeCanSteps({ faTable, retries, paymentLineData, household });
  financialAssistanceCanSteps({ paymentLineData, groupTitle });
};

export const updatePaymentGroupStatusTo = ({ paymentStatus, paymentModality }: Partial<paymentGroupStatusUpdateParam>) => {
  const financialAssistanceDetailsPage = new FinancialAssistanceDetailsPage();
  financialAssistanceDetailsPage.selectPaymentLineStatus(paymentStatus);
  if (paymentStatus === 'Cancelled') {
    if (paymentModality === 'E-Transfer') {
      cy.contains('Please choose a reason for the cancellation').should('be.visible');
      financialAssistanceDetailsPage.getCancellationReasonField();
      financialAssistanceDetailsPage.getCancellationReasonFieldItems().should('have.length', 7); // 7 option as reason for cancellation
      financialAssistanceDetailsPage.chooseAnyCancellationReason();
    } else {
      cy.contains(`Are you sure you want to cancel all ${paymentModality} payment lines?`).should('be.visible');
    }
    financialAssistanceDetailsPage.getDialogSubmitButton().should('be.enabled');
    financialAssistanceDetailsPage.getDialogCancelButton().should('be.enabled');
    financialAssistanceDetailsPage.getDialogSubmitButton().click();
  }

  cy.contains('Payment status successfully updated.').should('be.visible');

  if (paymentStatus === 'Inprogress') {
    financialAssistanceDetailsPage.getPaymentLineStatusElement().contains('In progress').should('be.visible');
  } else {
    financialAssistanceDetailsPage.getPaymentLineStatusElement().contains(paymentStatus).should('be.visible');
  }

  if (paymentStatus === 'Cancelled') {
    financialAssistanceDetailsPage.getPaymentLineItemAmountField().should('have.attr', 'class').and('contains', 'line-through');
    financialAssistanceDetailsPage.getPaymentGroupListField().contains('Payment total: $0.00');
  } else {
    financialAssistanceDetailsPage.getPaymentLineItemAmountField().should('have.attr', 'class').and('not.have.string', 'line-through');
    financialAssistanceDetailsPage.getPaymentGroupListField().contains('Payment total: $80.00');
  }
};
