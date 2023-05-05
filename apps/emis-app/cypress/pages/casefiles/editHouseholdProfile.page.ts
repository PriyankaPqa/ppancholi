export enum DataTest {
  middleName = 'personalInfo__middleName',
  save = 'dialog-submit-action',
}

export class EditHouseholdProfilePage {
  private middleName = { selector: DataTest.middleName, type: 'input' };

  private save = { selector: DataTest.save };

  public fillMiddleName(name: string) {
    cy.getByDataTest(this.middleName).type(name);
  }

  public saveEdit() {
    cy.getByDataTest(this.save).click();
  }
}
