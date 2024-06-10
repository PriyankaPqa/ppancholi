export enum DataTest {
  teamName = 'team-name',
  primaryContact = 'team-contact',
  eventList = 'events',
  teamCreate = 'createEditTeam__submit',
  cancelButton = 'createEditTeam__cancel',
  memberName = 'teamMembers__member_name',
  memberRole = 'teamMembers__member_role',
  memberTeamCount = 'teamMembers__member_teamCount',
  memberCaseFileCount = 'teamMembers__member_caseFileCount',
  memberOpenCaseFileCount = 'teamMembers__member_openCaseFileCount',
  memberInactiveCaseFileCount = 'teamMembers__member_inactiveCaseFileCount',
  memberPhoneNumber = 'teamMembers__member_phoneNumber',
  memberEmailAddress = 'teamMembers__member_email_address',
  teamIsEscalationCheckbox = 'team-isEscalation-checkbox',
  teamIsAssignableCheckbox = 'team-isAssignable-checkbox',
  addNewMemberButton = 'add-new-member',
}

export class CreateNewTeamPage {
  private teamName = { selector: DataTest.teamName, type: 'input' };

  private teamNameSpan = { selector: DataTest.teamName, type: 'span' };

  private eventListDiv = { selector: DataTest.eventList, type: 'div' };

  private primaryContact = { selector: DataTest.primaryContact };

  private primaryContactDiv = { selector: DataTest.primaryContact, type: 'div' };

  private teamCreate = { selector: DataTest.teamCreate };

  private cancelButton = { selector: DataTest.cancelButton };

  private addNewMemberButton = { selector: DataTest.addNewMemberButton };

  private memberName = { selector: DataTest.memberName };

  private memberRole = { selector: DataTest.memberRole };

  private memberTeamCount = { selector: DataTest.memberTeamCount };

  private memberCaseFileCount = { selector: DataTest.memberCaseFileCount };

  private memberOpenCaseFileCount = { selector: DataTest.memberOpenCaseFileCount };

  private memberInactiveCaseFileCount = { selector: DataTest.memberInactiveCaseFileCount };

  private memberPhoneNumber = { selector: DataTest.memberPhoneNumber };

  private memberEmailAddress = { selector: DataTest.memberEmailAddress };

  private teamIsEscalationCheckbox = { selector: DataTest.teamIsEscalationCheckbox, type: 'input' };

  private teamIsAssignableCheckbox = { selector: DataTest.teamIsAssignableCheckbox, type: 'input' };

  public fillTeamName(teamName: string) {
    cy.getByDataTest(this.teamName).type(teamName);
  }

  public fillEventName(eventName: string) {
    cy.searchAndSelect(DataTest.eventList, eventName);
  }

  public fillPrimaryContactName(primaryContactName: string) {
    cy.getByDataTest(this.primaryContact).type(primaryContactName);
    cy.getByDataTest(this.primaryContact).selectListElementByValue(DataTest.primaryContact, primaryContactName);
  }

  public getTeamName() {
    return cy.getByDataTest(this.teamNameSpan);
  }

  public getEventName() {
    return cy.getByDataTest(this.eventListDiv);
  }

  public getPrimaryContact() {
    return cy.getByDataTest(this.primaryContactDiv);
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

  public getMemberPhoneNumber() {
    return cy.getByDataTest(this.memberPhoneNumber);
  }

  public getMemberEmailAddress() {
    return cy.getByDataTest(this.memberEmailAddress);
  }

  public getTeamIsEscalationCheckbox() {
    return cy.getByDataTest(this.teamIsEscalationCheckbox);
  }

  public getTeamIsAssignableCheckbox() {
    return cy.getByDataTest(this.teamIsAssignableCheckbox);
  }

  public getTeamCreateButton() {
    return cy.getByDataTest(this.teamCreate);
  }

  public getCancelButton() {
    return cy.getByDataTest(this.cancelButton);
  }

  public getAddNewMemberButton() {
    return cy.getByDataTest(this.addNewMemberButton);
  }
}
