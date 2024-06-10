import { TeamDetailsPage } from './teamDetails.page';

export enum DataTest {
  createTeam = 'create-team-button',
  teamLink = 'team_link',
  createStandardTeam = 'create-standard-team-link',
  createAdHocTeam = 'create-adhoc-team-link',
}

export class TeamsHomePage {
  private createTeam = { selector: DataTest.createTeam, type: 'button' };

  private teamLink = { selector: DataTest.teamLink };

  private createStandardTeam = { selector: DataTest.createStandardTeam };

  private createAdHocTeam = { selector: DataTest.createAdHocTeam };

  public getCreateTeamButton() {
    return cy.getByDataTest(this.createTeam);
  }

  public getTeams() {
    return cy.getByDataTestLike(this.teamLink);
  }

  public getCreateStandardTeam() {
    return cy.getByDataTest(this.createStandardTeam);
  }

  public getCreateAdHocTeam() {
    return cy.getByDataTest(this.createAdHocTeam);
  }

  public goToFirstTeamDetails() {
    cy.getByDataTestLike(this.teamLink).eq(0).click();
    return new TeamDetailsPage();
  }

  public goToCreateAdHocTeamPage() {
    this.getCreateAdHocTeam().click();
  }
}
