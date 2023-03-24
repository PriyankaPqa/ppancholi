export enum DataTest {
programName = 'program-details-name',
editButton = 'edit-button',
}

export class ProgramDetailsPage {
  private programName = { selector: DataTest.programName };

  private editButton = { selector: DataTest.editButton };

  public getProgramName() {
    return cy.getByDataTest(this.programName).invoke('text').then((text) => text.trim());
  }

  public getEditButton() {
    return cy.getByDataTest(this.editButton);
  }
}
