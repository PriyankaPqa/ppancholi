export enum DataTest {
  dialogCancel = 'dialog-cancel-action',
  dialogSubmit = 'dialog-submit-action',
  inputSearch = 'team-search-input',
  roleNameAddTeamMember = 'teams_addTeamMember_roleName',
  displayNameAddTeamMember = 'teams_addTeamMember_displayName',
  checkboxAddTeamMember = 'select_',
}

export class AddNewTeamMemberPage {
  private dialogCancel = { selector: DataTest.dialogCancel };

  private dialogSubmit = { selector: DataTest.dialogSubmit };

  private inputSearch = { selector: DataTest.inputSearch, type: 'input' };

  private roleNameAddTeamMember = { selector: DataTest.roleNameAddTeamMember };

  private displayNameAddTeamMember = { selector: DataTest.displayNameAddTeamMember };

  public cancelButton() {
    return cy.getByDataTest(this.dialogCancel);
  }

  public addButton() {
    return cy.getByDataTest(this.dialogSubmit);
  }

  public memberSearch(searchString: string) {
    cy.getByDataTest(this.inputSearch).type(searchString);
  }

  public getRoleNames() {
    return cy.getByDataTest(this.roleNameAddTeamMember);
  }

  public getMemberNames() {
    return cy.getByDataTest(this.displayNameAddTeamMember);
  }

  public selectMember(memberId: string) {
    const memberSelector = { selector: `'${DataTest.checkboxAddTeamMember}${memberId}'`, type: 'div' };
    cy.getByDataTest(memberSelector).click();
  }
}
