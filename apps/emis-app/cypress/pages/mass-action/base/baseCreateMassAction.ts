export enum DataTest {
name = 'name',
description = 'description',
}

export interface IBaseMassActionFields {
  name?: string;
  description?: string;
}

export class BaseCreateMassAction {
  private name = { selector: DataTest.name, type: 'input' };

  private description = { selector: DataTest.description, type: 'textarea' };

  async fillNameDescription(data: IBaseMassActionFields) {
    if (data.name) {
      cy.getByDataTest(this.name).type(data.name);
    }

    if (data.description) {
      cy.getByDataTest(this.description).type(data.description);
    }
  }
}
