import { EditTeamPage } from './editTeam.page';

export enum DataTest {
  teamEdit = 'pageContent_editButton',
}

export class TeamDetailsPage {
  private teamEdit = { selector: DataTest.teamEdit };

  public editTeam() {
    cy.getByDataTest(this.teamEdit).click();
    return new EditTeamPage();
  }

  public getEditTeamButton() {
    return cy.getByDataTest(this.teamEdit);
  }
}
