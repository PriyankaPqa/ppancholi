export enum DataTest {
  item = 'payment_item',
  subItem = 'payment_subItem',
  paymentModalities = 'payment_modalities',
  amount = 'txt_amount',
  addPaymentLineDetails = 'dialog-submit-action',
  relatedNumber = 'txt_related_number',
  actualAmount = 'txt_actualamount',
  street = 'address__street',
  unitSuite = 'address__unitSuite',
  city = 'address__city',
  province = 'address__province',
  postalCode = 'address__postalCode',
  country = 'address__country',
  payeeType = 'payment_payeetypes',
  payeeName = 'payment_payeename',
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

  private actualAmount = { selector: DataTest.actualAmount, type: 'input' };

  private street = { selector: DataTest.street, type: 'input' };

  private unitSuite = { selector: DataTest.unitSuite, type: 'input' };

  private city = { selector: DataTest.city, type: 'input' };

  private province = { selector: DataTest.province };

  private postalCode = { selector: DataTest.postalCode, type: 'input' };

  private country = { selector: DataTest.country, type: 'input' };

  private payeeType = { selector: DataTest.payeeType };

  private payeeName = { selector: DataTest.payeeName, type: 'input' };

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

  public fillAmount(amount: string) {
    cy.getByDataTest(this.amount).type(amount);
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

  public getActualAmountField() {
    return cy.getByDataTest(this.actualAmount);
  }

  public getStreetValue() {
    return cy.getByDataTest(this.street).invoke('val').then((val) => `${val}`.trim());
  }

  public getUnitSuiteValue() {
    return cy.getByDataTest(this.unitSuite).invoke('val').then((val) => `${val}`.trim());
  }

  public getCityValue() {
    return cy.getByDataTest(this.city).invoke('val').then((val) => `${val}`.trim());
  }

  public getProvinceElement() {
    return cy.getByDataTest(this.province);
  }

  public getPostalCodeValue() {
    return cy.getByDataTest(this.postalCode).invoke('val').then((val) => `${val}`.trim());
  }

  public getCountryValue() {
    return cy.getByDataTest(this.country).invoke('val').then((val) => `${val}`.trim());
  }

  public getPayeeNameValue() {
    return cy.getByDataTest(this.payeeName).invoke('val').then((val) => `${val}`.trim());
  }

  public getPayeeTypeElement() {
    return cy.getByDataTest(this.payeeType);
  }
}
