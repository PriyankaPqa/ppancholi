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
  }
