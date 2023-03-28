export enum DataTest {
  createTeam = 'create-team-button',
  teamLink = 'team_link',
}

export class TeamsHomePage {
  private createTeam = { selector: DataTest.createTeam };

  private teamLink = { selector: DataTest.teamLink };

  public getCreateTeamButton() {
    return cy.getByDataTest(this.createTeam);
  }

  public getTeams() {
    return cy.getByDataTestLike(this.teamLink);
  }
}
