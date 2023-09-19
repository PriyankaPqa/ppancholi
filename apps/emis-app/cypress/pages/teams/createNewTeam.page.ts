export enum DataTest {
  teamName = 'team-name',
  primaryContact = 'team-contact',
  eventList = 'events',
  teamCreate = 'createEditTeam__submit',
  memberName = 'teamMembers__member_name',
  memberRole = 'teamMembers__member_role',
  memberTeamCount = 'teamMembers__member_teamCount',
  memberCaseFileCount = 'teamMembers__member_caseFileCount',
  memberOpenCaseFileCount = 'teamMembers__member_openCaseFileCount',
  memberInactiveCaseFileCount = 'teamMembers__member_inactiveCaseFileCount',
}

export class CreateNewTeamPage {
  private teamName = { selector: DataTest.teamName, type: 'input' };

  private primaryContact = { selector: DataTest.primaryContact, type: 'input' };

  private teamCreate = { selector: DataTest.teamCreate };

  private memberName = { selector: DataTest.memberName };

  private memberRole = { selector: DataTest.memberRole };

  private memberTeamCount = { selector: DataTest.memberTeamCount };

  private memberCaseFileCount = { selector: DataTest.memberCaseFileCount };

  private memberOpenCaseFileCount = { selector: DataTest.memberOpenCaseFileCount };

  private memberInactiveCaseFileCount = { selector: DataTest.memberInactiveCaseFileCount };

  public fillTeamName(teamName: string) {
    cy.getByDataTest(this.teamName).type(teamName);
  }

  public fillEventName(eventName: string) {
    cy.searchAndSelect(DataTest.eventList, eventName);
  }

  public fillPrimaryContactName(primaryContactName: string) {
    cy.getByDataTest(this.primaryContact).type(primaryContactName).selectListElementByValue(DataTest.primaryContact, primaryContactName);
  }

  public createTeam() {
    cy.getByDataTest(this.teamCreate).click();
  }

  public getMemberName() {
    return cy.getByDataTest(this.memberName).getAndTrimText();
  }

  public getMemberRole() {
    return cy.getByDataTest(this.memberRole).getAndTrimText();
  }

  public getMemberTeamCount() {
    return cy.getByDataTest(this.memberTeamCount);
  }

  public getMemberCaseFileCount() {
    return cy.getByDataTest(this.memberCaseFileCount);
  }

  public getMemberOpenCaseFileCount() {
    return cy.getByDataTest(this.memberOpenCaseFileCount);
  }

  public getMemberInactiveCaseFileCount() {
    return cy.getByDataTest(this.memberInactiveCaseFileCount);
  }
}
