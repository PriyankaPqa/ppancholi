export enum DataTest {
description = 'description',
}

export interface IBaseMassActionFields {
  description?: string;
}

export class BaseCreateMassAction {
  private description = { selector: DataTest.description, type: 'textarea' };

  public fillDescription(data: IBaseMassActionFields) {
    cy.getByDataTest(this.description).type(data.description);
  }
}
