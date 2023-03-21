export enum DataTest {
  item = 'payment_item',
  subItem = 'payment_subItem',
  paymentModalities = 'payment_modalities',
  amount = 'txt_amount',
  addPaymentLineDetails = 'dialog-submit-action',
  relatedNumber = 'txt_related_number',
}

export interface IAddNewPaymentLineFields {
  item?: string,
  subItem?: string,
  paymentModality?: string,
  amount?: string,
  relatedNumber?: string,
}

export class AddNewPaymentLinePage {
  private amount = { selector: DataTest.amount, type: 'input' };

  private addPaymentLineDetails = { selector: DataTest.addPaymentLineDetails };

  private relatedNumber = { selector: DataTest.relatedNumber, type: 'input' };

  async fill(data: IAddNewPaymentLineFields) {
    if (data.item) {
    cy.selectListElementByValue(DataTest.item, data.item);
    }

    if (data.subItem) {
    cy.selectListElementByValue(DataTest.subItem, data.subItem);
    }

    if (data.paymentModality) {
      cy.selectListElementByValue(DataTest.paymentModalities, data.paymentModality);
    }
  }

  public fillRelatedNumber(relatedNumber: string) {
    cy.getByDataTest(this.relatedNumber).type(relatedNumber);
  }

  public addNewPaymentLine() {
    cy.getByDataTest(this.addPaymentLineDetails).click();
  }

  public getRelatedNumberField() {
    return cy.getByDataTest(this.relatedNumber);
  }

  public getAmountValue() {
    return cy.getByDataTest(this.amount).invoke('val').then((val) => `${val}`.trim());
  }
}
