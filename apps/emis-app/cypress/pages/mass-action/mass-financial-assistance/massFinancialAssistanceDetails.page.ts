import { BaseDetailsMassAction } from '../base/baseDetailsMassAction';

export enum DataTest {
  event = 'event',
  table = 'table',
  program = 'program',
  item = 'item',
  sub_item = 'sub_item',
  payment = 'payment',
  amount = 'amount',
  projectedAmount = 'projectedAmount',
  showErrorsButton = 'showErrorsButton',
  errorMessage = 'errorMessage',
  invalidDownloadButton = 'invalidDownloadButton',
  }

  export class MassFinancialAssistanceDetailsPage extends BaseDetailsMassAction {
    private event = { selector: DataTest.event };

    private table = { selector: DataTest.table };

    private program = { selector: DataTest.program };

    private item = { selector: DataTest.item };

    private sub_item = { selector: DataTest.sub_item };

    private payment = { selector: DataTest.payment };

    private amount = { selector: DataTest.amount };

    private projectedAmount = { selector: DataTest.projectedAmount };

    private showErrorsButton = { selector: DataTest.showErrorsButton };

    private errorMessage = { selector: DataTest.errorMessage };

    private invalidDownloadButton = { selector: DataTest.invalidDownloadButton };

    public getMassActionPaymentDetailsEvent() {
      return cy.getByDataTest(this.event).getAndTrimText();
    }

    public getMassActionPaymentDetailsTable() {
      return cy.getByDataTest(this.table).getAndTrimText();
    }

    public getMassActionPaymentDetailsProgram() {
      return cy.getByDataTest(this.program).getAndTrimText();
    }

    public getMassActionPaymentDetailsItem() {
      return cy.getByDataTest(this.item).getAndTrimText();
    }

    public getMassActionPaymentDetailsSubItem() {
      return cy.getByDataTest(this.sub_item).getAndTrimText();
    }

    public getMassActionPaymentDetailsPaymentModality() {
      return cy.getByDataTest(this.payment).invoke('text').then((text) => text.toLowerCase().trim());
    }

    public getMassActionPaymentDetailsPaymentAmount() {
      return cy.getByDataTest(this.amount).getAndTrimText();
    }

    public getMassActionProjectedAmount() {
      return cy.getByDataTest(this.projectedAmount).getAndTrimText();
    }

    public clickShowErrorsButton() {
      return cy.getByDataTest(this.showErrorsButton).click();
    }

    public getErrorMessage() {
      return cy.getByDataTest(this.errorMessage).invoke('text').then((text) => text);
    }

    public clickInvalidDownloadButton() {
      return cy.getByDataTest(this.invalidDownloadButton).click();
    }
  }
